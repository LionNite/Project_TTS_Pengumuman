<?php
/**
 * REST API Backend for VoiceAnnounce - Universal Voice Announcement System
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/config.php';

$action = $_GET['action'] ?? $_POST['action'] ?? '';

// Helper to send JSON responses
function send_json($data, $status_code = 200) {
    http_response_code($status_code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

// -------------------------------------------------------------
// CHIME BELL SYNTHESIS & WAV MERGER (SERVER-SIDE)
// -------------------------------------------------------------
function generate_bell_wav($sampleRate = 24000) {
    $duration = 1.35; // seconds
    $totalSamples = (int)($sampleRate * $duration);
    $data = '';
    $twoPi = 2 * M_PI;

    for ($i = 0; $i < $totalSamples; $i++) {
        $t = $i / $sampleRate;
        $sample = 0.0;
        
        // Note 1: E5 (659.25 Hz)
        if ($t >= 0 && $t <= 0.85) {
            $env1 = exp(-$t * 6.5);
            $sample += 0.28 * sin($twoPi * 659.25 * $t) * $env1;
            $sample += 0.05 * sin($twoPi * 1318.5 * $t) * $env1;
        }
        
        // Note 2: G5 (783.99 Hz)
        if ($t >= 0.30 && $t <= 1.25) {
            $t2 = $t - 0.30;
            $env2 = exp(-$t2 * 6.0);
            $sample += 0.26 * sin($twoPi * 783.99 * $t2) * $env2;
            $sample += 0.05 * sin($twoPi * 1567.98 * $t2) * $env2;
        }
        
        $sample = max(-1.0, min(1.0, $sample));
        $data .= pack('s', (int)($sample * 32767));
    }

    $dataSize = strlen($data);
    $header = 'RIFF' . pack('V', 36 + $dataSize) . 'WAVE';
    $header .= 'fmt ' . pack('V', 16) . pack('v', 1) . pack('v', 1);
    $header .= pack('V', $sampleRate) . pack('V', $sampleRate * 2);
    $header .= pack('v', 2) . pack('v', 16);
    $header .= 'data' . pack('V', $dataSize);

    return $header . $data;
}

function clean_and_merge_wav($rawWav, $addBell = true) {
    if (strlen($rawWav) < 44 || substr($rawWav, 0, 4) !== 'RIFF') {
        return $rawWav;
    }

    $channels = unpack('v', substr($rawWav, 22, 2))[1] ?: 1;
    $sampleRate = unpack('V', substr($rawWav, 24, 4))[1] ?: 24000;
    $bitsPerSample = unpack('v', substr($rawWav, 34, 2))[1] ?: 16;
    $bytesPerSample = (int)($bitsPerSample / 8) * $channels;

    $pos = strpos($rawWav, 'data');
    if ($pos === false) {
        return $rawWav;
    }

    // STRICTLY read only the declared data size.
    // Google Gemini TTS appends a ~6KB C2PA cryptographic provenance metadata chunk at EOF.
    // If not sliced strictly by dataSize, that metadata is played as loud static/hissing audio!
    $dataSize = unpack('V', substr($rawWav, $pos + 4, 4))[1];
    $pcm = substr($rawWav, $pos + 8, $dataSize);

    // Apply a smooth 50ms linear fade-out to the end of speech PCM to prevent hard cutoff pops or clicks
    $fadeSamples = min((int)($sampleRate * 0.05), (int)(strlen($pcm) / $bytesPerSample));
    $totalSamples = (int)(strlen($pcm) / $bytesPerSample);

    if ($fadeSamples > 0 && $bitsPerSample === 16 && $channels === 1) {
        $startSample = $totalSamples - $fadeSamples;
        for ($i = 0; $i < $fadeSamples; $i++) {
            $offset = ($startSample + $i) * 2;
            $val = unpack('s', substr($pcm, $offset, 2))[1];
            $factor = 1.0 - ($i / $fadeSamples);
            $newVal = (int)($val * $factor);
            $pcm = substr_replace($pcm, pack('s', $newVal), $offset, 2);
        }
    }

    // Append 50ms of clean silence (0x00) at the very end
    $endSilenceBytes = (int)($sampleRate * 0.05 * $bytesPerSample);
    $pcm .= str_repeat("\x00", $endSilenceBytes);

    // If announcement chime is enabled, prepend synthesized chime bell + 0.35s silence pause
    if ($addBell) {
        $bellWav = generate_bell_wav($sampleRate);
        $bellPcm = substr($bellWav, 44);
        $silenceBytes = (int)($sampleRate * 0.35 * $bytesPerSample);
        $pcm = $bellPcm . str_repeat("\x00", $silenceBytes) . $pcm;
    }

    $finalDataSize = strlen($pcm);
    $header = 'RIFF' . pack('V', 36 + $finalDataSize) . 'WAVE';
    $header .= 'fmt ' . pack('V', 16) . pack('v', 1) . pack('v', $channels);
    $header .= pack('V', $sampleRate) . pack('V', $sampleRate * $channels * ($bitsPerSample / 8));
    $header .= pack('v', $channels * ($bitsPerSample / 8)) . pack('v', $bitsPerSample);
    $header .= 'data' . pack('V', $finalDataSize);

    return $header . $pcm;
}

// -------------------------------------------------------------
// Helper to make cURL POST requests to Gemini API
// -------------------------------------------------------------
function call_gemini_api($endpoint, $payload, $apiKey, $timeout = 25) {
    $url = "https://generativelanguage.googleapis.com/v1beta/{$endpoint}?key=" . urlencode($apiKey);

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'User-Agent: aistudio-build',
            'x-goog-api-key: ' . $apiKey
        ],
        CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        CURLOPT_TIMEOUT => $timeout,
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_SSL_VERIFYHOST => 0
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($curlError) {
        return ['error' => 'cURL Error: ' . $curlError, 'http_code' => 500];
    }

    $decoded = json_decode($response, true);
    return ['data' => $decoded, 'http_code' => $httpCode, 'raw' => $response];
}

// -------------------------------------------------------------
// 1. Check API Key & Health Status
// -------------------------------------------------------------
if ($action === 'check_key' || $action === 'health') {
    $config = get_app_config();
    $key = trim($config['gemini_api_key'] ?? '');
    $hasKey = !empty($key);
    $preview = '';
    if ($hasKey) {
        $preview = substr($key, 0, 6) . '...' . substr($key, -4);
    }

    send_json([
        'status' => 'ok',
        'has_key' => $hasKey,
        'key_preview' => $preview,
        'audio_dir' => get_saved_audio_dir(),
        'language' => $config['language'] ?? 'id',
        'tts_model' => 'gemini-3.8-flash-tts'
    ]);
}

// -------------------------------------------------------------
// 2. Save Settings (API Key, Language, Storage Dir) into config
// -------------------------------------------------------------
if ($action === 'save_settings' || $action === 'save_key') {
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
    $toSave = [];

    if (isset($input['api_key']) && trim($input['api_key']) !== '') {
        $toSave['gemini_api_key'] = trim($input['api_key']);
    }

    if (isset($input['language']) && in_array($input['language'], ['id', 'en'])) {
        $toSave['language'] = $input['language'];
    }

    if (isset($input['saved_audio_dir'])) {
        $toSave['saved_audio_dir'] = trim($input['saved_audio_dir']);
    }

    if (empty($toSave)) {
        send_json(['error' => 'Tidak ada pengaturan yang diubah.'], 400);
    }

    $saved = save_app_config($toSave);
    if ($saved) {
        send_json([
            'success' => true,
            'message' => 'Pengaturan berhasil disimpan!',
            'audio_dir' => get_saved_audio_dir()
        ]);
    } else {
        send_json(['error' => 'Gagal menyimpan pengaturan ke file konfigurasi.'], 500);
    }
}

// -------------------------------------------------------------
// 3. Template Management (CRUD)
// -------------------------------------------------------------
if ($action === 'get_templates') {
    send_json([
        'success' => true,
        'templates' => get_app_templates()
    ]);
}

if ($action === 'save_templates') {
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
    $templates = $input['templates'] ?? [];

    if (!is_array($templates)) {
        send_json(['error' => 'Format template tidak valid.'], 400);
    }

    if (save_app_templates($templates)) {
        send_json(['success' => true, 'templates' => $templates]);
    } else {
        send_json(['error' => 'Gagal menyimpan file template.'], 500);
    }
}

// -------------------------------------------------------------
// 4. Generate TTS Audio via Gemini (With Integrated Announcement Bell)
// -------------------------------------------------------------
if ($action === 'tts') {
    $config = get_app_config();
    $apiKey = trim($config['gemini_api_key'] ?? '');

    if (empty($apiKey)) {
        send_json(['error' => 'GEMINI_API_KEY belum dikonfigurasi. Silakan buka menu "Pengaturan" di kanan atas.'], 400);
    }

    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
    $text = trim($input['text'] ?? '');
    $voice = trim($input['voice'] ?? 'Kore');
    $style = trim($input['style'] ?? 'Sopan, jelas, dan ramah untuk pengumuman umum');
    $includeBell = isset($input['include_bell']) ? (bool)$input['include_bell'] : true;

    if (empty($text)) {
        send_json(['error' => 'Teks naskah pengumuman tidak boleh kosong.'], 400);
    }

    // Candidate models and their payloads
    $attempts = [
        [
            'model' => 'gemini-3.8-flash-tts',
            'payload' => [
                'contents' => [
                    [
                        'role' => 'user',
                        'parts' => [
                            [
                                'text' => $text,
                                'speechMetadata' => [
                                    'speaker' => 'Penyiar Pengumuman',
                                    'style' => $style
                                ]
                            ]
                        ]
                    ]
                ],
                'generationConfig' => [
                    'responseModalities' => ['AUDIO'],
                    'speechConfig' => [
                        'voiceConfig' => [
                            'prebuiltVoiceConfig' => [
                                'voiceName' => $voice
                            ]
                        ]
                    ]
                ]
            ]
        ],
        [
            'model' => 'gemini-2.0-flash',
            'payload' => [
                'contents' => [
                    [
                        'role' => 'user',
                        'parts' => [
                            [
                                'text' => $text
                            ]
                        ]
                    ]
                ],
                'generationConfig' => [
                    'responseModalities' => ['AUDIO'],
                    'speechConfig' => [
                        'voiceConfig' => [
                            'prebuiltVoiceConfig' => [
                                'voiceName' => $voice
                            ]
                        ]
                    ]
                ]
            ]
        ]
    ];

    $lastError = 'Gagal memproses audio dari Gemini.';
    $rawAudioBase64 = null;
    $mimeType = 'audio/wav';

    foreach ($attempts as $attempt) {
        $modelName = $attempt['model'];
        $res = call_gemini_api("models/{$modelName}:generateContent", $attempt['payload'], $apiKey, 25);

        if (isset($res['error'])) {
            $lastError = $res['error'];
            continue;
        }

        if ($res['http_code'] === 200 && isset($res['data']['candidates'][0]['content']['parts'])) {
            foreach ($res['data']['candidates'][0]['content']['parts'] as $part) {
                if (isset($part['inlineData']['data'])) {
                    $rawAudioBase64 = $part['inlineData']['data'];
                    $mimeType = $part['inlineData']['mimeType'] ?? 'audio/wav';
                    break 2;
                }
            }
        } else {
            $errMsg = $res['data']['error']['message'] ?? ($res['raw'] ?? 'Unknown error');
            $lastError = "[{$modelName}] {$errMsg}";
        }
    }

    if (!$rawAudioBase64) {
        send_json(['error' => $lastError], 500);
    }

    // Process and clean audio (strips Google C2PA metadata, smooth fade-out, zero hissing)
    // and optionally prepend announcement chime bell
    $rawBytes = base64_decode($rawAudioBase64);
    if ($rawBytes !== false) {
        $cleanedBytes = clean_and_merge_wav($rawBytes, $includeBell);
        $finalAudioBase64 = base64_encode($cleanedBytes);
    } else {
        $finalAudioBase64 = $rawAudioBase64;
    }

    send_json([
        'success' => true,
        'audioBase64' => $finalAudioBase64,
        'mimeType' => 'audio/wav',
        'voice' => $voice,
        'bell_included' => $includeBell
    ]);
}

// -------------------------------------------------------------
// 5. Universal AI Text Refinement (Any Input Text)
// -------------------------------------------------------------
if ($action === 'refine') {
    $config = get_app_config();
    $apiKey = trim($config['gemini_api_key'] ?? '');

    if (empty($apiKey)) {
        send_json(['error' => 'GEMINI_API_KEY belum dikonfigurasi. Silakan buka menu "Pengaturan".'], 400);
    }

    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
    $text = trim($input['text'] ?? '');
    $tone = trim($input['tone'] ?? 'sopan, jelas, dan ramah');

    if (empty($text)) {
        send_json(['error' => 'Teks naskah tidak boleh kosong.'], 400);
    }

    $prompt = "Anda adalah penyiar suara profesional dan announcer publik.\n" .
        "Tolong sempurnakan teks naskah pengumuman berikut agar terdengar lebih jelas, santun, efektif, berartikulasi rapi, dan nyaman didengar dengan gaya \"{$tone}\".\n" .
        "Pertahankan semua informasi penting dari teks asli (nama, angka, waktu, lokasi, instruksi penting).\n" .
        "Keluarkan HANYA teks naskah hasil penyempurnaan, tanpa tanda petik pembuka/penutup, dan tanpa komentar atau penjelasan tambahan.\n\n" .
        "Teks Asli:\n{$text}";

    $payload = [
        'contents' => [
            [
                'parts' => [
                    ['text' => $prompt]
                ]
            ]
        ]
    ];

    $res = call_gemini_api("models/gemini-2.5-flash:generateContent", $payload, $apiKey, 20);

    if (isset($res['data']['candidates'][0]['content']['parts'][0]['text'])) {
        $refined = trim($res['data']['candidates'][0]['content']['parts'][0]['text']);
        send_json(['success' => true, 'refinedText' => $refined]);
    } else {
        $errMsg = $res['data']['error']['message'] ?? ($res['error'] ?? 'Gagal menyempurnakan teks dengan AI.');
        send_json(['error' => $errMsg], 500);
    }
}

// -------------------------------------------------------------
// 6. Save Audio WAV to Local Storage Directory (Manual / Triggered)
// -------------------------------------------------------------
if ($action === 'save_audio') {
    $storageDir = get_saved_audio_dir();
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
    $audioBase64 = $input['audioBase64'] ?? '';
    $title = trim($input['title'] ?? 'Pengumuman');
    $text = trim($input['text'] ?? '');
    $voice = trim($input['voice'] ?? 'Kore');
    $style = trim($input['style'] ?? 'Normal');

    if (empty($audioBase64)) {
        send_json(['error' => 'Data audio base64 diperlukan.'], 400);
    }

    $safeTitle = preg_replace('/[^a-zA-Z0-9_\-\s]/', '', $title);
    $safeTitle = trim(preg_replace('/\s+/', '_', $safeTitle));
    if (empty($safeTitle)) $safeTitle = 'pengumuman';
    $safeTitle = substr($safeTitle, 0, 40);

    $timestamp = date('Ymd_His');
    $filename = "{$timestamp}_{$safeTitle}.wav";
    $filepath = $storageDir . '/' . $filename;

    $binary = base64_decode($audioBase64);
    if ($binary === false) {
        send_json(['error' => 'Format audio base64 tidak valid.'], 400);
    }

    if (file_put_contents($filepath, $binary) === false) {
        send_json(['error' => "Gagal menulis file audio ke folder: {$storageDir}."], 500);
    }

    // Save companion JSON metadata
    $metaFile = $storageDir . '/' . pathinfo($filename, PATHINFO_FILENAME) . '.json';
    $meta = [
        'filename' => $filename,
        'title' => $title,
        'text' => $text,
        'voice' => $voice,
        'style' => $style,
        'created_at' => date('Y-m-d H:i:s'),
        'file_size' => filesize($filepath)
    ];
    @file_put_contents($metaFile, json_encode($meta, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

    send_json([
        'success' => true,
        'filename' => $filename,
        'filepath' => $filepath,
        'directory' => $storageDir,
        'meta' => $meta
    ]);
}

// -------------------------------------------------------------
// 7. List Saved Audio Files
// -------------------------------------------------------------
if ($action === 'list_audio') {
    $storageDir = get_saved_audio_dir();
    $files = [];

    if (is_dir($storageDir)) {
        $scan = scandir($storageDir);
        foreach ($scan as $item) {
            if ($item === '.' || $item === '..') continue;
            if (pathinfo($item, PATHINFO_EXTENSION) === 'wav') {
                $wavPath = $storageDir . '/' . $item;
                $metaPath = $storageDir . '/' . pathinfo($item, PATHINFO_FILENAME) . '.json';
                
                $meta = [];
                if (file_exists($metaPath)) {
                    $json = @file_get_contents($metaPath);
                    if ($json) $meta = json_decode($json, true) ?: [];
                }

                $files[] = [
                    'filename' => $item,
                    'title' => $meta['title'] ?? pathinfo($item, PATHINFO_FILENAME),
                    'text' => $meta['text'] ?? '',
                    'voice' => $meta['voice'] ?? 'Kore',
                    'style' => $meta['style'] ?? 'Normal',
                    'created_at' => $meta['created_at'] ?? date('Y-m-d H:i:s', filemtime($wavPath)),
                    'timestamp' => filemtime($wavPath),
                    'size_bytes' => filesize($wavPath),
                    'size_formatted' => round(filesize($wavPath) / 1024, 1) . ' KB',
                    'url' => 'api.php?action=stream_audio&file=' . urlencode($item)
                ];
            }
        }

        usort($files, function($a, $b) {
            return $b['timestamp'] - $a['timestamp'];
        });
    }

    send_json(['files' => $files, 'directory' => $storageDir]);
}

// -------------------------------------------------------------
// 8. Delete Saved Audio
// -------------------------------------------------------------
if ($action === 'delete_audio') {
    $storageDir = get_saved_audio_dir();
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
    $filename = basename($input['filename'] ?? $_GET['file'] ?? '');

    if (empty($filename)) {
        send_json(['error' => 'Nama file tidak boleh kosong.'], 400);
    }

    $wavPath = $storageDir . '/' . $filename;
    $metaPath = $storageDir . '/' . pathinfo($filename, PATHINFO_FILENAME) . '.json';

    $deleted = false;
    if (file_exists($wavPath)) {
        $deleted = @unlink($wavPath);
    }
    if (file_exists($metaPath)) {
        @unlink($metaPath);
    }

    if ($deleted) {
        send_json(['success' => true, 'message' => "File {$filename} berhasil dihapus."]);
    } else {
        send_json(['error' => 'File tidak ditemukan atau gagal dihapus.'], 404);
    }
}

// -------------------------------------------------------------
// 9. Stream Audio for Browser Player
// -------------------------------------------------------------
if ($action === 'stream_audio') {
    $storageDir = get_saved_audio_dir();
    $filename = basename($_GET['file'] ?? '');
    $filePath = $storageDir . '/' . $filename;

    if (empty($filename) || !file_exists($filePath)) {
        header('HTTP/1.0 404 Not Found');
        echo 'Audio file not found.';
        exit;
    }

    header('Content-Type: audio/wav');
    header('Content-Length: ' . filesize($filePath));
    header('Content-Disposition: inline; filename="' . $filename . '"');
    header('Accept-Ranges: bytes');
    readfile($filePath);
    exit;
}

send_json(['error' => 'Action tidak dikenali.'], 400);

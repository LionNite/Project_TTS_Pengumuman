<?php
/**
 * Configuration file for VoiceAnnounce - Universal Voice Announcement TTS
 */

define('CONFIG_FILE', __DIR__ . '/settings.json');
define('TEMPLATES_FILE', __DIR__ . '/templates.json');

// Function to get config settings
function get_app_config() {
    $default = [
        'gemini_api_key' => '',
        'language' => 'id',
        'saved_audio_dir' => '', // Empty means default __DIR__ . '/saved_audio'
        'tts_model' => 'gemini-3.8-flash-tts',
        'refine_model' => 'gemini-2.5-flash',
        'default_voice' => 'Kore',
        'default_tone' => 'professional'
    ];

    if (file_exists(CONFIG_FILE)) {
        $json = @file_get_contents(CONFIG_FILE);
        if ($json) {
            $data = json_decode($json, true);
            if (is_array($data)) {
                return array_merge($default, $data);
            }
        }
    }

    $envKey = getenv('GEMINI_API_KEY');
    if (!empty($envKey)) {
        $default['gemini_api_key'] = $envKey;
    }

    return $default;
}

// Function to save config settings
function save_app_config($data) {
    $current = get_app_config();
    $merged = array_merge($current, $data);
    return file_put_contents(CONFIG_FILE, json_encode($merged, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)) !== false;
}

// Dynamic Audio Storage Directory
function get_saved_audio_dir() {
    $config = get_app_config();
    $custom = trim(isset($config['saved_audio_dir']) ? $config['saved_audio_dir'] : '');

    if (!empty($custom)) {
        if (!is_dir($custom)) {
            @mkdir($custom, 0777, true);
        }
        $real = realpath($custom);
        if ($real && is_dir($real)) {
            return $real;
        }
        return $custom;
    }

    $defaultDir = __DIR__ . '/saved_audio';
    if (!is_dir($defaultDir)) {
        @mkdir($defaultDir, 0777, true);
    }
    return $defaultDir;
}

define('SAVED_AUDIO_DIR', get_saved_audio_dir());

// Templates Manager
function get_app_templates() {
    if (file_exists(TEMPLATES_FILE)) {
        $json = @file_get_contents(TEMPLATES_FILE);
        if ($json) {
            $data = json_decode($json, true);
            if (is_array($data)) return $data;
        }
    }
    return [];
}

function save_app_templates($templates) {
    return file_put_contents(TEMPLATES_FILE, json_encode($templates, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)) !== false;
}

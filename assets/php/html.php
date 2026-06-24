<?php

function clean_html($html) {
    $html = preg_replace('/<\/?(span|font)[^>]*>/i', '', $html);
    $html = preg_replace('/\s*style="[^"]*"/i', '', $html);
    $html = preg_replace('/\s*class="[^"]*"/i', '', $html);
    $html = str_replace("\xC2\xA0", ' ', $html);
    $html = preg_replace('/<(\w+)>\s*<\/\1>/', '', $html);
    return trim($html);
}

if (isset($_POST['action'])) {
    header('Content-Type: application/json');
    $data = $_POST['data'] ?? '';

    if ($_POST['action'] === 'quill_to_html') {
        $clean = clean_html($data);
        echo json_encode([
            'result' => $clean
        ]);
        exit;
    }

    if ($_POST['action'] === 'html_to_quill') {
        $clean = clean_html($data);
        echo json_encode([
            'result' => $clean
        ]);
        exit;
    }
}

?>
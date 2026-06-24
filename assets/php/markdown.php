<?php

use League\HTMLToMarkdown\HtmlConverter;
use League\CommonMark\CommonMarkConverter;

$htmlToMd = new HtmlConverter([
    'strip_tags' => false
]);

$mdConverter = new CommonMarkConverter();

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

    if ($_POST['action'] === 'html_to_md') {

        $clean = clean_html($data);

        echo json_encode([
            'result' => trim($htmlToMd->convert($clean))
        ]);
        exit;
    }

if ($_POST['action'] === 'md_to_html') {

    $html = $mdConverter->convert($data);

    echo json_encode([
        'result' => (string)$html
    ]);
    exit;
}
    
}
?>
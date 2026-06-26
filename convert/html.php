<?php
include '../assets/php/html.php';
?>
		
<!DOCTYPE html>

<html lang="en">
    
    <head>
        
        <title>WRITE! &bull; aroceu.com</title>
        
		<meta name="robots" content="noindex, nofollow" />
	<meta name="googlebot" content="noindex, nofollow" />
	<meta name="noai" content="true" />
	<meta name="noimageai" content="true" />
	<meta name="robots" content="noai, noimageai">
	<meta charset="UTF-8">
	<meta name="description" content="an html to/from rich text converter featuring writing analytics. saves to your browser's cache."/>
	<meta property="og:title" content="WRITE! • aroceu" />
	<meta property="og:description" content="an html to/from rich text converter featuring writing analytics. saves to your browser's cache." />
	<meta property="og:image" content="../assets/preview.png" />
	<meta property="og:url" content="https://write.aroceu.com/" />
	<meta name="viewport" content="initial-scale=1.0, maximum-scale=5, width=device-width">
    <link rel="shortcut icon" type="image/x-icon" href="../assets/favicon.png" />

<link href="https://cdn.quilljs.com/1.3.7/quill.snow.css" rel="stylesheet">

<link rel="stylesheet" href="../assets/css/convert.css">

</head>

<body>

<div class="container">

    <div class="panel">
        <div class="title">HTML

        <input 
        id="doc2Title"
        value="Untitled"
        style="
            flex:1;
            margin:0 10px;
            padding:6px 8px;
            font-size:14px;
            font-weight:600;
            border:1px solid #5C98B2;
            border-radius:4px;
            outline:none;
            color:#5C98B2;
        "
    />

                        <button id="txtDL"onclick="downloadHtml()">Download .html</button>
        </div>
        <textarea id="html"></textarea>
    </div>

    <div class="panel">
        <div class="title">
            Rich Text
            <small id="wordCount">0 words</small>
            <button id="openStats">📊</button>

<script>
function downloadHtml() {
    const html = document.getElementById('html').value;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    const titleInput = document.getElementById('doc2Title');

    const safeTitle = (titleInput?.value || "Untitled")
        .trim()
        .replace(/[\\/:*?"<>|]/g, '');

    const a = document.createElement('a');
    a.href = url;
    a.download = `${safeTitle || "Untitled"}-html.html`;

    document.body.appendChild(a); // important for Firefox reliability
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
}
</script>
        </div>
        <div id="editor"></div>
    </div>

</div>

<div id="sidebar">
    <div class="analytics-top">
        <h3>Analytics</h3>
        <button id="toggleStats">X</button>
    </div>

    <div id="stats"></div>
</div>

<script src="https://cdn.quilljs.com/1.3.7/quill.min.js"></script>

<script src="../assets/js/html-top.js"></script>
<script src="../assets/js/analytics.js"></script>
<script src="../assets/js/html-end.js"></script>

</body>
</html>

<!DOCTYPE html>
<html lang="en">
    
    <head>
        
        <title>WRITE! &bull; aroceu</title>
        
	<meta name="robots" content="noai, noimageai">
	<meta charset="UTF-8">
	<meta name="description" content="an in-browser text editor featuring a pomodoro timer and a reward system. saves to your browser's cache."/>
	<meta property="og:title" content="WRITE! • aroceu" />
	<meta property="og:description" content="an in-browser text editor featuring a pomodoro timer and a reward system. saves to your browser's cache." />
	<meta property="og:image" content="assets/preview.png" />
	<meta property="og:url" content="https://write.aroceu.com/" />
	<meta name="viewport" content="initial-scale=1.0, maximum-scale=5, width=device-width">
    <link rel="shortcut icon" type="image/x-icon" href="assets/favicon.png" />
    <link rel="stylesheet" type="text/css" href="assets/css/pomodoro.css" />
</head>
<body>

<div id="stickyHeader">
<div class="timer" id="timer">25:00</div>
<h1 id="projectTitle" contenteditable="true" class="title">
    Untitled
</h1>

<div class="toolbar">

<label for="themeSelector">Theme:</label>

<select id="themeSelector" onchange="setTheme(this.value)">
    <option value="day">Day Mode</option>
    <option value="night">Night Mode</option>
    <option value="pastel">Pastel Dream</option>
    <option value="forest">Emerald</option>
    <option value="ocean">Ocean Blue</option>
    <option value="neonred">Neon Red</option>
</select>

<label for="fontSelector">Font:</label>

<select id="fontSelector" onchange="setFont(this.value)">
    <option value="arial">Arial</option>
    <option value="georgia">Georgia</option>
    <option value="consolas">Consolas</option>
    <option value="comic">Comic Sans</option>
</select>

<label for="fontSizeSelector">Size:</label>

<select id="fontSizeSelector" onchange="setFontSize(this.value)">
    <option value="14">14px</option>
    <option value="16">16px</option>
    <option value="18" selected>18px</option>
    <option value="20">20px</option>
    <option value="24">24px</option>
    <option value="28">28px</option>
</select>


</div>

<hr>

<div class="toolbar" id="richToolbar">

    <button id="visualBtn" class="visual-active" onclick="switchVisual()">Visual Editor</button>
    <button id="textBtn" onclick="switchText()">Plain Text</button>

<button id="boldBtn" onclick="formatDoc('bold')"><b>B</b></button>
<button id="italicBtn" onclick="formatDoc('italic')"><i>I</i></button>
<button id="underlineBtn" onclick="formatDoc('underline')"><u>U</u></button>

<button onclick="selectAllContent()">Select All</button>
<button onclick="copyContent()">Copy</button>


<button onclick="downloadHTML()">Download HTML</button>


<span id="notesWrapper">    <a href="javascript:void(0)" id="toggleNotesLink" onclick="toggleNotes()" class="notes-toggle">
        Hide tips
    </a>
    <span id="notesText" class="button-notes">
        <ul>
            <li>Plain text supports Markdown, basic HTML, and mixed Markdown/basic HTML.</li> 
            <li>Single line breaks work best in the Visual Editor.</li>
            <li><strong>Do not paste from Google Docs into the visual editor, you will lose all formatting.</strong> Use Rich Text to <a href="convert/markdown">Markdown</a>/<a href="convert/html">HTML</a> for Google Docs conversions instead. </li>
            <li>Undo/redo history will be lost on new page load.</li>
        </ul>
    </span>


</span>

<span id="mobile-nav">
    | <a href="#" onclick="scrollToTop('editor')">Top</a> | 
    <a href="index">Home</a> | 
    <a href="#bottom">Bottom</a>
</span>



</div>
</div>

<div id="editor" contenteditable="true"></div>

<textarea id="plaintext"></textarea>

<div class="stats" id="bottom">

    Words:
    <span id="wordCount">0</span>

</div>

<div id="copyToast">
    ✓ Copied
</div>

<div id="rewardPanel">

<div id="rewardProgressContainer">
    <div id="rewardProgressLabel">
        0 / 100 words
    </div>

    <div id="rewardProgressBar">
        <div id="rewardProgressFill"></div>
    </div>
</div>

    <div id="stars"></div>

    <div class="right-nav">
        <a href="#" onclick="scrollToTop('editor')">Top</a> | 
        <a href="index">Home</a> | 
        <a href="#bottom">Bottom</a>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>

<script src="assets/js/pomodoro.js"></script>

</body>
</html>

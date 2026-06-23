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

<html lang="en">
    
    <head>
        
        <title>WRITE &bull; aroceu.com</title>
        
	<meta name="robots" content="noai, noimageai">
	<meta charset="UTF-8">
	<meta name="description" content="an html to/from rich text converter featuring writing analytics. saves to your browser's cache."/>
	<meta property="og:title" content="aroceu" />
	<meta property="og:description" content="an html to/from rich text converter featuring writing analytics. saves to your browser's cache." />
	<meta property="og:image" content="assets/preview.png" />
	<meta property="og:url" content="https://write.aroceu.com/" />
	<meta name="viewport" content="initial-scale=1.0, maximum-scale=5, width=device-width">
    <link rel="shortcut icon" type="image/x-icon" href="assets/fav.ico" />

<link href="https://cdn.quilljs.com/1.3.7/quill.snow.css" rel="stylesheet">

<style>
body { margin:0; font-family:system-ui; }
.container { display:flex; height:100vh; }

.panel { flex:1; display:flex; flex-direction:column; border-right:1px solid #5C98B2; }
.title { padding:10px; font-size:16px; font-weight: bold; display:flex; justify-content:space-between; border-bottom: 1px solid #5C98B2; align-items: center; color: #5C98B2; background: #eee;}
.ql-toolbar.ql-snow{
    border-bottom: 1px solid #5C98B2;
    border-top: none;
    border-left: none;
    border-right: none;
}
.ql-container.ql-snow{
    border: none;
}
.panel:nth-child(2) .title {
    padding-bottom: 8px;
}


button{
    padding:8px 12px;
    margin-right:5px;
    background:#ffffff;
    color:#5C98B2;
    border:1px solid #5C98B2;
    cursor:pointer;
}

button#toggleStats{
    height: 30px;
    width: 30px;
    padding:0;
    margin:0;
}

button:hover{
    background:#5C98B2;
    color:#ffffff; 
}
textarea { flex:1; padding:12px; font-family:monospace; border:0; }

#editor { flex:1; }

#sidebar {
    position:fixed;
    right:0;
    top:0;
    width:360px;
    height:100vh;
    background:#fafafa;
    border-left:1px solid #5C98B2;
    transform:translateX(100%);
    transition:.25s;
    overflow:auto;
    padding:12px;
    line-height: 160%;
}

#sidebar.open { transform:translateX(0); }

#openStats {
}

#txtDL {
}

.stat-number, .ngram-count{
    background: #ddd;
    padding: 2px 4px;
    border-radius: 3px;
}

.ngrams-nav {
    display:flex;
    gap:6px;
    margin-bottom:8px;
    font-size: 10pt;
}

.ngrams-nav button{
    display: inline;
    border: none;
    padding: 0;
    margin: 0;
    background: transparent;
}

.ngrams-nav button:hover{
    background:#5C98B2;
    color:#ffffff; 
}


h3, h4{
    color: #5C98B2;
}

.analytics-top {
    border-bottom: 1px solid #5C98B2;
    display:flex;justify-content:space-between;
}

hr{
    padding-top: 10px;
        border-bottom: 1px solid #5C98B2;
        border-top: none;
        border-right: none;
        border-left: none;
}

.footer{
    border-top: 1px solid #5C98B2;
    text-align: center;
    padding: 5px 0 10px;
}

a:link, a:visited{
    color: #5C98B2;
}
a:hover{
    text-decoration: none;
}

.ql-editor p {
    margin: 0;
}

.ql-editor p + p {
    margin-top: 1em;
}
textarea,
.ql-container {
    flex: 1;
    height: 0;
}
.panel {
    display: flex;
    flex-direction: column;
}
</style>
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

                        <button id="txtDL"onclick="downloadHtml()">Download as .html</button>
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

<script>
/**
 * =========================
 * STATE
 * =========================
 */
let isUpdating = false;
let requestId = 0;
let lastStatsHash = "";
let State = { syncing: false };
let isBooting = true;
let docTitle = "Untitled";

/**
 * =========================
 * QUILL
 * =========================
 */

const quill = new Quill('#editor', {
    theme: 'snow',
    modules: {
        toolbar: [
            ['bold','italic','underline'],
            [{ header: [1,2,3,false] }],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['link'],
            ['clean']
        ]
    }
});

function cleanPastedHtml(html) {
    return html
        // normalize nbsp
        .replace(/\u00A0/g, ' ')

        // collapse runs of spaces/tabs
        .replace(/[ \t]{2,}/g, ' ')

        // remove spaces between tags
        .replace(/>\s+</g, '><')

        // limit blank lines
        .replace(/\n{3,}/g, '\n\n');
}

quill.root.addEventListener('paste', e => {
    e.preventDefault();

    const html =
        e.clipboardData.getData('text/html') ||
        e.clipboardData.getData('text/plain');

    const cleaned = cleanPastedHtml(html);

    const delta = quill.clipboard.convert(cleaned);

    quill.updateContents(delta, Quill.sources.USER);
});

function normalizeEditorWhitespace() {
    const walker = document.createTreeWalker(
        quill.root,
        NodeFilter.SHOW_TEXT
    );

    let node;

    while ((node = walker.nextNode())) {
        node.textContent = node.textContent.replace(
            /[ \t]{2,}/g,
            ' '
        );
    }
}

quill.clipboard.addMatcher(Node.ELEMENT_NODE, (node, delta) => {
    if (node.tagName === 'DIV') {
        node = document.createElement('p');
    }

    if (node.nodeType === 1) {
        node.removeAttribute?.('style');
        node.removeAttribute?.('class');
    }

    return delta;
});

setTimeout(normalizeEditorWhitespace, 0);

function normalizeWhitespace(text) {
    return text
        .replace(/\u00A0/g, ' ')
        .replace(/[^\S\r\n]+/g, ' ')
        .replace(/\n{3,}/g, '\n\n');
}

const htmlTA = document.getElementById('html');

/**
 * =========================
 * HELPERS
 * =========================
 */
function post(action, data) {
    return fetch('', {
        method:'POST',
        headers:{'Content-Type':'application/x-www-form-urlencoded'},
        body:'action='+action+'&data='+encodeURIComponent(data)
    }).then(r=>r.json());
}

function getWords(text) {
    return (text || '')
        .match(/\b[\w']+\b/g) || [];
}

/**
 * =========================
 * QUILL → HTML
 * =========================
 */

quill.root.addEventListener('paste', () => {

    // let Quill finish processing the rich HTML
    setTimeout(() => {

        const html = quill.root.innerHTML;

        post('quill_to_html', html).then(res => {
            htmlTA.value = res.result;

            updateWordCount();
            updateAnalytics();
        });

    }, 0);

});


/**
 * =========================
 *  INITIAL LOAD
 * =========================
 */

function loadFromCache() {

    const titleInput = document.getElementById('doc2Title');

    const savedTitle = localStorage.getItem('doc2_title');

    if (savedTitle) {
        docTitle = savedTitle;
        titleInput.value = savedTitle;
    }

    document.title = `${docTitle} • WRITE (aroceu)` || 'Untitled • WRITE (aroceu)';

    titleInput.addEventListener('input', (e) => {
        docTitle = e.target.value || 'Untitled';

         document.title = `${docTitle} • WRITE (aroceu)` || 'Untitled • WRITE (aroceu)';

        localStorage.setItem('doc2_title', docTitle);
    });

    const cached = localStorage.getItem('doc2');

    htmlTA.value = localStorage.getItem('doc2_html') || '';
    if (!cached) {
        isBooting = false;
        return;
    }

    try {
        const delta = JSON.parse(cached);
        State.syncing = true;

        quill.setContents(delta, Quill.sources.SILENT);

requestAnimationFrame(async () => {

    const html = quill.root.innerHTML;

    const res = await post('quill_to_html', html);

    htmlTA.value = res.result;

    State.syncing = false;
    isBooting = false;

    updateWordCount();
    updateAnalytics();
});

    } catch (e) {
        console.warn('cache load failed', e);
        isBooting = false;
    }
}

loadFromCache();

const titleInput = document.getElementById('doc2Title');

titleInput.addEventListener('input', () => {
    docTitle = titleInput.value || 'Untitled';
document.title = `${docTitle} • WRITE (aroceu)` || 'Untitled • WRITE (aroceu)';
    localStorage.setItem('doc2_title', docTitle);
});

function syncToHtml() {
    if (isUpdating) return;

    const html = quill.root.innerHTML;
    const myReq = ++requestId;

    post('quill_to_html', html).then(res => {
        if (myReq !== requestId) return;

        isUpdating = true;
        htmlTA.value = res.result;
        isUpdating = false;

        updateAnalytics();
    });
}

/**
 * =========================
 * HTML → QUILL
 * =========================
 */

function normalizeIncomingHTML(html) {
    if (!html) return '';

    return html
        // Google Docs / Word junk
        .replace(/<meta[^>]*>/gi, '')
        .replace(/<link[^>]*>/gi, '')
        .replace(/\u200B/g, '') // zero-width space
        .replace(/\u00A0/g, ' ') // nbsp
        .replace(/<o:p>/gi, '')
        .replace(/<\/o:p>/gi, '')

        // remove spans but keep content
        .replace(/<\/?span[^>]*>/gi, '')
        .replace(/<\/?font[^>]*>/gi, '')

        // force divs to paragraphs (IMPORTANT FOR GDOCS)
        .replace(/<div[^>]*>/gi, '<p>')
        .replace(/<\/div>/gi, '</p>')

        // cleanup empty paragraphs
        .replace(/<p>\s*<\/p>/gi, '')
        .replace(/<p>\s*(<br\s*\/?>)?\s*<\/p>/gi, '<p><br></p>');
}

htmlTA.addEventListener('input', async () => {
    if (isUpdating) return;

    const myReq = ++requestId;

    const res = await post('html_to_quill', htmlTA.value);
    if (myReq !== requestId) return;

    isUpdating = true;

const html = normalizeIncomingHTML(res.result || '');

quill.setContents(
    quill.clipboard.convert(html),
    Quill.sources.SILENT
);

    isUpdating = false;

    updateAnalytics();
});

/**
 * =========================
 * ANALYTICS (CORE ONLY)
 * =========================
 */

function scheduleDerivedUpdate() {
    clearTimeout(window.__t);

    window.__t = setTimeout(() => {
        updateDerivedOutputs();
        updateAnalytics();
    }, 120);
}

/**
 * =========================
 * SIDEBAR
 * =========================
 */
document.getElementById('openStats').onclick = () => {
    document.getElementById('sidebar').classList.add('open');
};
const toggleBtn = document.getElementById('toggleStats');
if (toggleBtn) {
    toggleBtn.onclick = () => {
        document.getElementById('sidebar').classList.remove('open');
    };
}



/**
 * =========================
 *  SAVE CACHE
 * =========================
 */

setInterval(() => {
    if (State.syncing) return;

    localStorage.setItem('doc2', JSON.stringify(quill.getContents()));
    localStorage.setItem('doc2_html', htmlTA.value);
    localStorage.setItem('doc2_title', docTitle);
}, 1000);

async function copyHtml() {
    await navigator.clipboard.writeText(
        document.getElementById('html').value
    );
}

async function copyEditor() {
    await navigator.clipboard.writeText(
        quill.getText()
    );
    localStorage.setItem('doc2', JSON.stringify(quill.getContents()));
    localStorage.setItem('doc2_html', htmlTA.value);
    localStorage.setItem('doc2_title', docTitle);

}

function updateWordCount() {
    const text = quill.getText();
    const words = getWords(text);
    const paragraphs = getParagraphsFromQuill();

    document.getElementById('wordCount').textContent =
    `${words.length.toLocaleString()} words • ${text.length.toLocaleString()} chars • ${paragraphs.length.toLocaleString()} paragraphs`;
}
updateWordCount();

function scrollToTop(id) {

    if (id === 'editor') {

        document.querySelector('.ql-editor')
            .scrollTo({
                top: 0,
                behavior: 'smooth'
            });

        return;
    }

    document.getElementById(id)
        .scrollTo({
            top: 0,
            behavior: 'smooth'
        });
}

function getText() {
    return quill.getText()
        .replace(/\s+/g, ' ')
        .trim();
}

function normalizeSentence(s) {
    return s
        .replace(/<<DOT>>/g, '.')
        .replace(/<<DECIMAL>>/g, '.')
        .replace(/\s+/g, ' ')
        .trim();
}

function splitSentences(text) {
    if (!text) return [];

    text = text
        .replace(/\r/g, '')
        .trim();

    const paragraphs = text
        .split(/\n+/)
        .map(p => p.trim())
        .filter(Boolean);

    const sentences = [];

    for (let para of paragraphs) {

        // protect abbreviations
        para = para
            .replace(/\b(Dr|Mr|Mrs|Ms|Prof|Sr|Jr|St)\./g, '$1<<DOT>>')
            .replace(/(\d)\.(\d)/g, '$1<<DECIMAL>>$2');

        let buffer = '';

        for (let i = 0; i < para.length; i++) {

            const c = para[i];
            buffer += c;

            // detect sentence-ending punctuation
            if (/[.!?]/.test(c)) {

                const nextChar = para[i + 1];
                const nextWord = para.slice(i + 1).match(/^\s*"?\s*[A-Z]/);

                // valid sentence boundary if:
                // - next is space or quote OR
                // - next is capitalized start of new sentence
                const isBoundary =
                    (nextChar === ' ' || nextChar === '"' || nextChar === undefined) ||
                    !!nextWord;

                if (!isBoundary) continue;

                const sentence = buffer.trim();

                if (sentence) {
                    sentences.push(normalizeSentence(sentence));
                }

                buffer = '';
            }
        }

        if (buffer.trim()) {
            sentences.push(normalizeSentence(buffer.trim()));
        }
    }

    return sentences;
}

/**
 * FIXED: robust paragraph detection (Quill + Google Docs safe)
 */
function getParagraphsFromQuill() {
    const html = quill.root.innerHTML;

    if (!html || html === '<p><br></p>') return [];

    return html
        .replace(/<hr\s*\/?>/g, '\n---\n')
        .replace(/<img[^>]*>/g, '\n[image]\n')

        // normalize block structure FIRST
        .replace(/<\/p>\s*<p[^>]*>/g, '\n')
        .replace(/<p[^>]*>/g, '')
        .replace(/<\/p>/g, '\n')

        // GDocs / Word / weird div structures
        .replace(/<div[^>]*>/gi, '\n')
        .replace(/<\/div>/gi, '\n')

        // cleanup
        .replace(/<br\s*\/?>/g, '\n')
        .replace(/<[^>]+>/g, '')

        .split('\n')
        .map(p => p.trim())
        .filter(Boolean);   // ← IMPORTANT (prevents undefined analytics crash)
}

const stopWords = new Set([
    // articles
    'the','a','an',

    // conjunctions
    'and','or','but','nor','so','yet',

    // prepositions
    'of','to','in','on','for','with','at','by','from','into','over','under','between','through',

    // verbs (very common)
    'is','are','was','were','be','been','being','have','has','had','do','does','did',

    // pronouns
    'i','you','he','she','it','we','they','me','him','her','us','them','my','your','his','their',

    // misc filler
    'this','that','these','those',

    'as', 'is', 'it', 'on', 'at', 'by', 'an', 'be', 'he\'s','she\'s', 'we\'re', 'they\'re', 'i\'m', 'you\'re',

    'not', 'up', 'doesn\'t', 'out', 'what', 'if',
]);

function getWordFrequency(text, exclude = true) {

    const words =
        (text.match(/\b[\w']+\b/g) || [])
        .map(w => w.toLowerCase());

    const freq = {};

    for (const word of words) {

        if (exclude && stopWords.has(word)) continue;

        freq[word] = (freq[word] || 0) + 1;
    }

    return Object.entries(freq)
        .sort((a,b)=>b[1]-a[1])
        .slice(0, 25);
}

function getNGrams(text, n, exclude = true) {

    const words =
        (text.match(/\b[\w']+\b/g) || [])
        .map(w => w.toLowerCase())
        .filter(w => !(exclude && stopWords.has(w)));

    const counts = {};

    for (let i = 0; i <= words.length - n; i++) {
        const gram = words.slice(i, i + n).join(' ');
        counts[gram] = (counts[gram] || 0) + 1;
    }

    return Object.entries(counts)
        .filter(x => x[1] > 1)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20);
}

function normalizeItem(item) {

    if (!item) return null;

    // sentence objects
    if (item.text && item.length !== undefined) {
        return item;
    }

    // paragraph objects
    if (item.text && item.words !== undefined) {
        return item;
    }

    // fallback if a raw string ever sneaks in
    if (typeof item === 'string') {
        return { text: item, length: 0 };
    }

    return item;
}

function groupByLength(items, getLength) {

    const map = Object.create(null);

    for (const item of (items || [])) {
        try {
            const len = getLength(item);

            if (!Number.isFinite(len) || len <= 0) continue;

            if (!map[len]) map[len] = [];
            map[len].push(item);

        } catch (e) {
            continue;
        }
    }

    const keys = Object.keys(map).map(Number);

    if (keys.length === 0) {
        return {
            shortest: [],
            longest: [],
            shortestCount: 0,
            longestCount: 0
        };
    }

    const min = Math.min(...keys);
    const max = Math.max(...keys);

    return {
        shortest: map[min] || [],
        longest: map[max] || [],
        shortestCount: map[min]?.length || 0,
        longestCount: map[max]?.length || 0,
        minValue: min,
        maxValue: max
    };
}

let ngramMode = 1;
let excludeCommon = true;
function toggleExcludeCommon() {
    excludeCommon = !excludeCommon;
    updateAnalytics();
}

function updateAnalytics() {
    try {
        const text = quill.getText() || '';

        const stats = getTextStats(text);
        if (!stats) return;

        if (!stats.shortestSentence) stats.shortestSentence = [];
if (!stats.longestSentence) stats.longestSentence = [];
if (!stats.shortestParagraphWords) stats.shortestParagraphWords = [];
if (!stats.longestParagraphWords) stats.longestParagraphWords = [];

 updateWordCount(); 

const p = getParagraphsFromQuill();

const hash = JSON.stringify({
    w: stats.words,
    u: stats.uniqueWords,
    m: ngramMode,
    e: excludeCommon
});

if (hash === lastStatsHash) return;
lastStatsHash = hash;

         const shortestSentenceCount = stats.shortestSentence.length;

const shortestSentenceLength =
    stats.shortestSentence.length
        ? stats.shortestSentence[0].length
        : 0;

    let ngramData;

if (ngramMode === 1) ngramData = getWordFrequency(text, excludeCommon);
if (ngramMode === 2) ngramData = getNGrams(text, 2, excludeCommon);
if (ngramMode === 3) ngramData = getNGrams(text, 3, excludeCommon);
if (ngramMode === 4) ngramData = getNGrams(text, 4, excludeCommon);

    document.getElementById('stats').innerHTML = `

<h4>Overview</h4>
Words: <span class="stat-number">${stats.words}</span><br>
Characters: <span class="stat-number">${stats.chars}</span><br>
Paragraphs: <span class="stat-number">${stats.paragraphs}</span><br><br>

Unique Words: <span class="stat-number">${stats.uniqueWords}</span><br>
Reading Time: <span class="stat-number">${stats.readMinutes}</span> min<br>
Speaking Time: <span class="stat-number">${stats.speakMinutes}</span> min<br>

<hr>

<h4>Sentences</h4>
Average Length: <span class="stat-number">${stats.avgSentenceLength}</span> words<br><br>
Median: <span class="stat-number">${stats.medianSentenceLength}</span> words<br><br>

<details>
<summary>
Shortest:
<span class="stat-number">(Length: ${shortestSentenceLength}w • Count: ${shortestSentenceCount})</span>
</summary>
<br>

${stats.shortestSentence.map(s =>
    `(${s.length}w) ${s.text}`
).join('<br>') || '—'}

</details>
<br>

Longest:<br><br>
${stats.longestSentence.map(s => `<span class="stat-number">(${s.length}w)</span> ${s.text}`).join('<br>') || '—'}


<hr>

<h4>Paragraphs (Words)</h4>
Average Length: <span class="stat-number">${stats.avgParagraphLength}</span><br><br>
Median: <span class="stat-number">${stats.medianParagraphWords}</span><br><br>


Shortest: <br><br>
${stats.shortestParagraphWords.map(p => `<span class="stat-number">(${p.words}w)</span> ${p.text}`).join('<br>') || '—'}
<br><br>

Longest: <br><br>
${stats.longestParagraphWords.map(p => `<span class="stat-number">(${p.words}w)</span> ${p.text}`).join('<br>') || '—'}

<hr>

<h4>Paragraphs (Sentences)</h4>

<details>
<summary>
Shortest <span class="stat-number">(Length: ${stats.shortestParagraphSentenceValue}s &bull; Count: ${stats.shortestParagraphSentenceCount})</span>:

</summary>
<br>

${stats.shortestParagraphSentences
    .slice(0, 100)
    .map(p => `<span class="stat-number">(${p.sentences}s)</span> ${p.text}`)
    .join('<br>') || '—'}

    </details>

    <br />

Longest: <br><br>
${stats.longestParagraphSentences.map(p => `<span class="stat-number">(${p.sentences}s)</span> ${p.text}`).join('<br>') || '—'}

<hr>

<h4>
Word and Phrase Frequency (${ngramMode === 1 ? '1 word' : ngramMode + ' words'})
</h4>

<div class="ngrams-nav">

<button onclick="setNgramMode(1)">one</button>/
<button onclick="setNgramMode(2)">two</button>/
<button onclick="setNgramMode(3)">three</button>/
<button onclick="setNgramMode(4)">four</button>

<label>
  <input
      type="checkbox"
      onchange="toggleCommonWords(this)"
      ${excludeCommon ? 'checked' : ''}
  >
  Exclude common words
</label>

</div>

<ul>
${ngramData.map(x => `<li>${x[0]} <span class="ngram-count">(${x[1]})</span></li>`).join('')}
</ul>

<div class="footer">

<p><a href="index">Home</a></p>
</div>

`;

    } catch (err) {
        console.error("Analytics failed:", err);
    }

}

function setNgramMode(mode) {
    ngramMode = mode;
    updateAnalytics();
}

function getTextStats(text) {

    const cleanText = (text || '').trim();
    if (!cleanText) return null;

    const words = getWords(cleanText);

    const uniqueWords =
        [...new Set(words.map(w => w.toLowerCase()))];
        

    const sentences = splitSentences(cleanText);

    const paragraphs = getParagraphsFromQuill() || [];
    

    // ----------------------------
    // SENTENCES
    // ----------------------------
    const sentenceData = sentences
        .map(s => {
            const len = (s.match(/\b[\w']+\b/g) || []).length;
            return { text: s, length: len };
        })
        .filter(s => s.text && s.length > 0);

    const sentenceGroups = groupByLength(sentenceData, s => s.length);

    const sentenceLengths = sentenceData.map(s => s.length);

    const medianSentenceLength =
        sentenceLengths.length
            ? [...sentenceLengths].sort((a,b)=>a-b)[Math.floor(sentenceLengths.length/2)]
            : 0;

    // ----------------------------
    // PARAGRAPHS
    // ----------------------------
    const paragraphData = paragraphs
        .map(p => {
            const w = (p.match(/\b[\w']+\b/g) || []).length;
            const s = splitSentences(p).length;

            return { text: p, words: w, sentences: s };
        })
        .filter(p => p.words > 0);

    const paragraphWordGroups =
        groupByLength(paragraphData, p => p.words);

const paragraphSentenceGroups =
    groupByLength(paragraphData, p => p.sentences);
    const minParagraphSentenceCount = paragraphSentenceGroups.minValue;
const shortestParagraphSentenceCount = paragraphSentenceGroups.shortestCount;

    const paragraphWordLengths = paragraphData.map(p => p.words);
const medianParagraphWords =
    paragraphWordLengths.length
        ? [...paragraphWordLengths].sort((a,b)=>a-b)[Math.floor(paragraphWordLengths.length/2)]
        : 0;
    const paragraphSentenceLengths = paragraphData.map(p => p.sentences);
    const medianParagraphSentences =
        paragraphSentenceLengths.length
            ? [...paragraphSentenceLengths].sort((a,b)=>a-b)[Math.floor(paragraphSentenceLengths.length/2)]
            : 0;

    const avgSentenceLength =
        words.length / Math.max(sentences.length, 1);

    const avgParagraphLength =
        words.length / Math.max(paragraphs.length, 1);

    const avgWordLength =
        words.reduce((s,w)=>s+w.length,0) /
        Math.max(words.length,1);

    const readMinutes = words.length / 225;
    const speakMinutes = words.length / 130;

    return {
    words: words.length,
    uniqueWords: uniqueWords.length,
    chars: cleanText.length + 1,
    paragraphs: paragraphs.length,

    avgSentenceLength: avgSentenceLength.toFixed(1),
    avgParagraphLength: avgParagraphLength.toFixed(1),
    avgWordLength: avgWordLength.toFixed(2),

    readMinutes: readMinutes.toFixed(1),
    speakMinutes: speakMinutes.toFixed(1),

     shortestSentence: sentenceGroups.shortest || [],
        longestSentence: sentenceGroups.longest || [],
        medianSentenceLength,

        shortestParagraphWords: paragraphWordGroups.shortest || [],
        longestParagraphWords: paragraphWordGroups.longest || [],
        medianParagraphWords: medianParagraphWords,

        shortestParagraphSentences: paragraphSentenceGroups.shortest || [],
        longestParagraphSentences: paragraphSentenceGroups.longest || [],
        medianParagraphSentences: medianParagraphSentences,
        shortestParagraphSentences: paragraphSentenceGroups.shortest || [],
shortestParagraphSentenceCount: paragraphSentenceGroups.shortestCount || 0,
shortestParagraphSentenceValue: paragraphSentenceGroups.minValue || 0,

};
}

function updateDerivedOutputs() {
    const html = quill.root.innerHTML;
    const cleanHtml = normalizeIncomingHTML(html);

    post('quill_to_html', cleanHtml).then(res => {
        if (!isUpdating) htmlTA.value = res.result;
    });

    updateWordCount();
    updateAnalytics();
        localStorage.setItem('doc2', JSON.stringify(quill.getContents()));
    localStorage.setItem('doc2_title', docTitle);
    localStorage.setItem('doc2_html', htmlTA.value);

}

quill.on('text-change', (delta, old, source) => {
    if (source !== Quill.sources.USER) return;
    if (isBooting) return;

     updateWordCount(); 
     updateAnalytics();
    syncToHtml();
});

const sidebar = document.getElementById('sidebar');

document
.getElementById('openStats')
.onclick = () => {
    sidebar.classList.add('open');
};

document
.getElementById('toggleStats')
.onclick = () => {
    sidebar.classList.remove('open');
};

const closeBtn = document.getElementById('toggleStats');

if (closeBtn) {
    closeBtn.onclick = () => {
        sidebar.classList.remove('open');
    };
}

function toggleCommonWords(el) {
    excludeCommon = el.checked;
updateAnalytics();
}
</script>

</body>
</html>

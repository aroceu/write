function updateWordCount() {
    const text = quill.getText();
    const words = getWords(text);
    const paragraphs = getParagraphsFromQuill();
    const chars = Math.max(0, text.length - 1);

    document.getElementById('wordCount').textContent =
    `${words.length.toLocaleString()} words • ${chars.toLocaleString()} chars • ${paragraphs.length.toLocaleString()} paragraphs`;
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
        .replace(/<\/div>\s*<div[^>]*>/gi, '\n')
        .replace(/<br\s*\/?>/gi, '\n')

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
Characters: <span class="stat-number">${Math.max(0, (stats.chars || 0) - 1)}</span><br>
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

   const cleanText = text || '';
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
chars: Number.isFinite(cleanText?.length)
? cleanText.length
: 0,
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
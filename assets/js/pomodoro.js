
document.addEventListener("DOMContentLoaded", () => {
    document.execCommand("defaultParagraphSeparator", false, "p");
   document.addEventListener("DOMContentLoaded", () => {

});
    loadTheme();
    loadFontSettings();

});

let sourceContent = "";

const themes = {

day: {
    "--background-color":"#fafafa",
    "--text-color":"#333333",
    "--surface-color":"#ffffff",
    "--textarea-background":"#ffffff",
    "--accent-color":"#5C98B2",
    "--border-color":"#bbbbbb",
    "--button-text":"#ffffff",
    "--break-color":"#aaa"
},

night: {
    "--background-color":"#121212",
    "--text-color":"#e8e8e8",
    "--surface-color":"#1d1d1d",
    "--textarea-background":"#1d1d1d",
    "--accent-color":"#5C98B2",
    "--border-color":"#aaa",
    "--button-text":"#ffffff",
    "--break-color":"#888"
},

pastel: {
    "--background-color":"#fff6fb",
    "--text-color":"#563a56",
    "--surface-color":"#fffdf8",
    "--textarea-background":"#fffdf8",
    "--accent-color":"#c99cff",
    "--border-color":"#ffae70",
    "--button-text":"#ffffff",
    "--break-color":"#ffae70"
},

forest: {
    "--background-color":"#f7f5f1",
    "--text-color":"#3c2020",
    "--surface-color":"#ffffff",
    "--textarea-background":"#ffffff",
    "--accent-color":"#0f8b5f",
    "--border-color":"#7a1f2b",
    "--button-text":"#ffffff",
    "--break-color":"#7a1f2b"
},

ocean: {
    "--background-color":"#17445c",
    "--text-color":"#f7f4e8",
    "--surface-color":"#102f40",
    "--textarea-background":"#fffdf5",
    "--accent-color":"#4dc2d1",
    "--border-color":"#4dc2d1",
    "--button-text":"#ffffff",
    "--break-color":"#eddba8"
},

neonred: {
    "--background-color":"#111111",
    "--text-color":"#ffffff",
    "--surface-color":"#1b1b1b",
    "--textarea-background":"#1b1b1b",
    "--accent-color":"#ff3562",
    "--border-color":"#ff3562",
    "--button-text":"#ffffff",
    "--break-color":"#ff0000"
}

};

const FONT_KEY = "pomodoro_writer_font";
const FONT_SIZE_KEY = "pomodoro_writer_font_size";

const fonts = {
    arial: "Arial, sans-serif",
    georgia: "Georgia, serif",
    consolas: "Consolas, monospace",
    comic: "'Comic Sans MS', cursive"
};

function setFont(name){

    const font = fonts[name];

    if(!font) return;

    document.documentElement.style.setProperty(
        "--font-family",
        font
    );

    localStorage.setItem(FONT_KEY,name);
}

function setFontSize(size){

    document.documentElement.style.setProperty(
        "--editor-font-size",
        size + "px"
    );


    localStorage.setItem(
        FONT_SIZE_KEY,
        size
    );
}

function loadFontSettings(){

    const savedFont =
        localStorage.getItem(FONT_KEY) || "arial";

    const savedSize =
        localStorage.getItem(FONT_SIZE_KEY) || "18";

    setFont(savedFont);
    setFontSize(savedSize);

    const fontSelector =
        document.getElementById("fontSelector");

    const sizeSelector =
        document.getElementById("fontSizeSelector");

    if(fontSelector){
        fontSelector.value = savedFont;
    }

    if(sizeSelector){
        sizeSelector.value = savedSize;
    }
}

const TITLE_KEY = "pomodoro_writer_title";

const NOTES_KEY = "pomodoro_writer_notes_hidden";

function loadNotesState() {
    const hidden = localStorage.getItem(NOTES_KEY) === "1";
    applyNotesState(hidden);
}

function toggleNotes() {
    const currentHidden = localStorage.getItem(NOTES_KEY) === "1";
    const newHidden = !currentHidden;

    localStorage.setItem(NOTES_KEY, newHidden ? "1" : "0");
    applyNotesState(newHidden);
}

function applyNotesState(hidden) {
    const notes = document.getElementById("notesText");
    const link = document.getElementById("toggleNotesLink");

    if (!notes || !link) return;

    if (hidden) {
        notes.style.display = "none";
        link.textContent = "Show tips";
    } else {
        notes.style.display = "inline";
        link.textContent = "Hide tips";
    }
}

function updatePageTitle() {

    const title =
        document.getElementById("projectTitle")
            .textContent
            .trim() || "Untitled";

    document.title =
        `${title} • WRITE! (aroceu)`;
}

// run once on page load
document.addEventListener("DOMContentLoaded", loadNotesState);

function updatePomodoroClock(){

    const now = new Date();
    const minute = now.getMinutes();
    const second = now.getSeconds();

    let phase;
    let endMinute;

    if(minute < 25){
        phase = "WRITE!";
        endMinute = 25;
    }
    else if(minute < 30){
        phase = "BREAK";
        endMinute = 30;
    }
    else if(minute < 55){
        phase = "WRITE!";
        endMinute = 55;
    }
    else{
        phase = "BREAK";
        endMinute = 60;
    }

    let remaining =
        ((endMinute - minute) * 60) - second;

    if(remaining < 0) remaining = 0;

    const m = Math.floor(remaining / 60);
    const s = remaining % 60;

    const timer = document.getElementById("timer");

    timer.textContent =
        phase + " " +
        String(m).padStart(2,"0") + ":" +
        String(s).padStart(2,"0");

    timer.style.color =
        phase === "BREAK" ? "var(--break-color)" : "var(--accent-color)";
}

updatePomodoroClock();
setInterval(updatePomodoroClock,1000);

// ========================================
// SOURCE DOCUMENT
// ========================================

const STORAGE_KEY = "pomodoro_writer_source";

let sourceText = "";
let textMode = false;

// ========================================
// SAVE / LOAD
// ========================================

function saveContent(){

localStorage.setItem(
    STORAGE_KEY,
    sourceText
);

}

document.addEventListener("DOMContentLoaded", () => {

    const titleEl = document.getElementById("projectTitle");

    // LOAD
const savedTitle = localStorage.getItem(TITLE_KEY);

if (savedTitle) {
    document.getElementById("projectTitle").textContent = savedTitle;
}

document.title =
    `${titleEl.textContent.trim() || "Untitled"} • WRITE! (aroceu)`;

    // SAVE on input
titleEl.addEventListener("input", () => {

    const title =
        titleEl.textContent.trim() || "Untitled";

    localStorage.setItem(TITLE_KEY, title);

    updatePageTitle();
});

    // prevent new lines
    titleEl.addEventListener("keydown", (e) => {
        if (e.key === "Enter") e.preventDefault();
    });
});

function loadContent(){

const saved =
    localStorage.getItem(STORAGE_KEY);

if(!saved) return;

sourceText = saved;

const savedTitle = localStorage.getItem(TITLE_KEY);

if (savedTitle) {
    document.getElementById("projectTitle").textContent = savedTitle;
}

document.getElementById("plaintext").value =
    sourceText;

document.getElementById("editor").innerHTML =
    marked.parse(sourceText);

}

// ========================================
// TEXT MODE
// ========================================

function switchText(){

if(textMode) return;

document.getElementById("plaintext").value =
    sourceText;

document.getElementById("editor").style.display =
    "none";

document.getElementById("plaintext").style.display =
    "block";

document.getElementById("visualBtn")
    .classList.remove("visual-active");

document.getElementById("textBtn")
    .classList.add("text-active");

document.getElementById("boldBtn").classList.remove("active-format");
document.getElementById("italicBtn").classList.remove("active-format");
document.getElementById("underlineBtn").classList.remove("active-format");

textMode = true;

document.getElementById("boldBtn").style.display = "none";
document.getElementById("italicBtn").style.display = "none";
document.getElementById("underlineBtn").style.display = "none";

}

function formatDoc(command) {
    document.execCommand(command, false, null);
    updateFormatButtons();
}

// ========================================
// VISUAL MODE
// ========================================

function updateFormatButtons() {
    document.getElementById("boldBtn")
        .classList.toggle("active-format", document.queryCommandState("bold"));

    document.getElementById("italicBtn")
        .classList.toggle("active-format", document.queryCommandState("italic"));

    document.getElementById("underlineBtn")
        .classList.toggle("active-format", document.queryCommandState("underline"));
}

document.getElementById("editor").addEventListener("keyup", updateFormatButtons);
document.getElementById("editor").addEventListener("mouseup", updateFormatButtons);
document.getElementById("editor").addEventListener("input", updateFormatButtons);

document.getElementById("editor").addEventListener("paste", (e) => {

    const html = e.clipboardData.getData("text/html");

    if (!html) return;

    e.preventDefault();

    const doc = new DOMParser()
        .parseFromString(html, "text/html");

    // Remove spans entirely
    doc.querySelectorAll("span").forEach(span => {
        span.replaceWith(...span.childNodes);
    });

    // Clean paragraph tags
    doc.querySelectorAll("p").forEach(p => {
        [...p.attributes].forEach(attr =>
            p.removeAttribute(attr.name)
        );
    });

    // Remove all inline styling
    doc.querySelectorAll("*").forEach(el => {
        [...el.attributes].forEach(attr => {

            if (
                attr.name === "style" ||
                attr.name === "class" ||
                attr.name === "id"
            ) {
                el.removeAttribute(attr.name);
            }
        });
    });

const walker = document.createTreeWalker(
    doc.body,
    NodeFilter.SHOW_COMMENT
);

const comments = [];

while (walker.nextNode()) {
    comments.push(walker.currentNode);
}

comments.forEach(comment => comment.remove());

    document.execCommand(
        "insertHTML",
        false,
        doc.body.innerHTML
    );

    updateWordCount();
    saveContent();
});

function switchVisual(){


if(!textMode) return;

sourceText =
    document.getElementById("plaintext").value;

document.getElementById("editor").innerHTML =
    marked.parse(sourceText);

document.getElementById("editor").style.display =
    "block";

document.getElementById("plaintext").style.display =
    "none";

document.getElementById("visualBtn")
    .classList.add("visual-active");

document.getElementById("textBtn")
    .classList.remove("text-active");

textMode = false;

document.getElementById("boldBtn").style.display = "";
document.getElementById("italicBtn").style.display = "";
document.getElementById("underlineBtn").style.display = "";

setTimeout(updateFormatButtons, 0);

saveContent();
updateWordCount();


}

function htmlToPlainText(root) {
    let out = "";

    root.childNodes.forEach(node => {

        if (node.nodeType === Node.TEXT_NODE) {
            out += node.textContent;
        }

        else if (node.nodeType === Node.ELEMENT_NODE) {

            const tag = node.tagName.toLowerCase();

            // treat BOTH div and p as paragraph breaks
            if (tag === "p" || tag === "div") {
                const inner = htmlToPlainText(node).trim();
                if (inner) out += inner + "\n";
            }

            else if (tag === "br") {
                out += "\n";
            }

            else {
                out += htmlToPlainText(node);
            }
        }
    });

    return out;
}

function htmlToTextWithLineBreaks(root) {
    let out = "";

    root.childNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
            out += node.textContent;
        }

        else if (node.nodeType === Node.ELEMENT_NODE) {
            const tag = node.tagName.toLowerCase();

            if (tag === "br") {
                out += "\n";
            }

            else if (tag === "div" || tag === "p") {
                out += htmlToTextWithLineBreaks(node) + "\n";
            }

            else {
                out += htmlToTextWithLineBreaks(node);
            }
        }
    });

    return out;
}

// ========================================
// VISUAL EDITING
// ========================================

document
.getElementById("editor")
.addEventListener("input", () => {


    // Visual mode becomes source of truth
    sourceText =
        document.getElementById("editor").innerHTML;

    saveContent();
    updateWordCount();
});

document.addEventListener("keydown", (e) => {

    if (textMode) return;

    const editor = document.getElementById("editor");

    if (document.activeElement !== editor) return;

    const ctrlOrCmd = e.ctrlKey || e.metaKey;

    if (!ctrlOrCmd) return;

    switch (e.key.toLowerCase()) {

        case "b":
            e.preventDefault();
            formatDoc("bold");
            break;

        case "i":
            e.preventDefault();
            formatDoc("italic");
            break;

        case "u":
            e.preventDefault();
            formatDoc("underline");
            break;
    }
});


// ========================================
// SOURCE EDITING
// ========================================

document
.getElementById("plaintext")
.addEventListener("input", () => {


    sourceText =
        document.getElementById("plaintext").value;

    saveContent();
    updateWordCount();
});


//////////////////////////////////////////////////
// WORD COUNT + STARS
//////////////////////////////////////////////////

function updateWordCount(){


let text;

if(textMode){

    text =
        document.getElementById("plaintext").value;

}else{

    text =
        htmlToPlainText(document.getElementById("editor"));
}

text = text.replace(/<[^>]+>/g," ");

const words = text
    .trim()
    .split(/\s+/)
    .filter(Boolean);

const count = words.length;

document.getElementById("wordCount")
    .textContent = count;

    //////////////////////////////////////////////////
// REWARD PROGRESS BAR
//////////////////////////////////////////////////

const progressWords = count % 100;
const progressPercent = progressWords;

document.getElementById("rewardProgressFill").style.width =
    progressPercent + "%";

document.getElementById("rewardProgressLabel").textContent =
    progressWords + " / 100 words";

const stars = Math.floor(count / 100);
const goldStars = Math.floor(count / 1000);

let output = "";

for(let i=0;i<goldStars;i++){
    output += '<span class="star gold">&#9733;</span>';
}

for(let i=0;i<(stars - goldStars * 10);i++){
    output += '<span class="star">&#9733;</span>';
}

document.getElementById("stars").innerHTML =
    output;


}

//////////////////////////////////////////////////
// EVENTS
//////////////////////////////////////////////////

document.getElementById("editor")
.addEventListener("input", updateWordCount);

document.getElementById("plaintext")
.addEventListener("input", updateWordCount);

loadContent();
updateWordCount();

function cleanEditorHTML(rootHTML) {
    const doc = new DOMParser().parseFromString(rootHTML, "text/html");

    // Remove empty spans (your main issue)
    doc.querySelectorAll("span").forEach(span => {
        const style = span.getAttribute("style") || "";

        // remove spans that only contain styling noise and no real content
        if (
            span.textContent.trim() === "" ||
            style.includes("white-space") ||
            style.includes("font-size")
        ) {
            span.remove();
            return;
        }

        // unwrap harmless spans (keep text, remove tag)
        span.replaceWith(...span.childNodes);
    });

    // remove inline styles everywhere
    doc.querySelectorAll("*").forEach(el => {
        el.removeAttribute("style");
        el.removeAttribute("class");
    });

    return doc.body.innerHTML;
}

function getProjectTitle() {
    const el = document.getElementById("projectTitle");
    const title = (el?.textContent || "Untitled").trim();
    return title || "Untitled";
}

function slugifyFilename(str) {
    return str
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80) || "document";
}

function downloadHTML() {
    const raw = document.getElementById("editor").innerHTML;
    const cleaned = cleanEditorHTML(raw);

    const title = getProjectTitle();
    const filename = slugifyFilename(title) + "-pomodoro.html";

    const fullHTML = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${title}</title>
</head>
<body>

<h1>${title}</h1>

${cleaned}

</body>
</html>
`.trim();

    const blob = new Blob([fullHTML], { type: "text/html" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;

    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

const THEME_KEY = "pomodoro_writer_theme";

function setTheme(name){

    const theme = themes[name];
    if(!theme) return;

    Object.entries(theme).forEach(([key,value])=>{
        document.documentElement.style.setProperty(key,value);
    });

    localStorage.setItem(THEME_KEY,name);
}

function loadTheme(){

    const saved =
        localStorage.getItem(THEME_KEY) || "day";

    setTheme(saved);

    const selector =
        document.getElementById("themeSelector");

    if(selector){
        selector.value = saved;
    }
}

function selectAllContent() {

    if (textMode) {

        const textArea =
            document.getElementById("plaintext");

        textArea.focus();
        textArea.select();

        return;
    }

    const editor =
        document.getElementById("editor");

    const range =
        document.createRange();

    range.selectNodeContents(editor);

    const selection =
        window.getSelection();

    selection.removeAllRanges();
    selection.addRange(range);
}

let copyToastTimer;

function showCopyToast() {

    const toast =
        document.getElementById("copyToast");

    if (!toast) return;

    toast.classList.add("show");

    clearTimeout(copyToastTimer);

    copyToastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2000);
}

async function copyContent() {

    try {

        if (textMode) {

            await navigator.clipboard.writeText(
                document.getElementById("plaintext").value
            );

        } else {

            selectAllContent();

            const success =
                document.execCommand("copy");

            if (!success) {
                throw new Error("Copy failed");
            }
        }

        showCopyToast();

    } catch (err) {

        console.error(err);
    }
}
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
            [{ align: [] }],
            ['link'],
            ['clean']
        ]
    }
});

quill.clipboard.addMatcher(Node.ELEMENT_NODE, (node, delta) => {
    if (node.nodeType === 1) {
        node.removeAttribute('style');

        const cls = node.getAttribute('class');

        if (
            cls &&
            /^ql-align-(center|right|justify)$/.test(cls)
        ) {
            node.setAttribute('class', cls);
        } else {
            node.removeAttribute('class');
        }
    }

    return delta;
});

function cleanGoogleDocsHtml(html) {
    const parser = new DOMParser();
const doc = parser.parseFromString(html, 'text/html');
    // remove junk
    doc.querySelectorAll('meta, link, style').forEach(el => el.remove());
    // remove Google Docs classes/styles
    doc.querySelectorAll('*').forEach(el => {
        el.removeAttribute('id');
        if (el.hasAttribute('style')) {
            const style = el.getAttribute('style');
            // preserve only underline
            if (/text-decoration:\s*underline/i.test(style)) {
                el.style.textDecoration = 'underline';
            } else {
                el.removeAttribute('style');
            }
        }
        el.removeAttribute('class');
    });
    //
    // Fix "everything is bold"
    //
    // Google Docs frequently generates:
    //
    // <p><b>Entire paragraph...</b></p>
    //
    // even though visually it isn't bold.
    //
    doc.querySelectorAll('p,b,strong').forEach(node => {
        const parent = node.parentElement;
        if (
            (node.tagName === 'B' || node.tagName === 'STRONG') &&
            parent &&
            /^P|DIV|LI$/i.test(parent.tagName)
        ) {
            const onlyChild =
                parent.children.length === 1 &&
                parent.textContent.trim() === node.textContent.trim();
            if (onlyChild) {
                // unwrap fake paragraph-wide bold
                while (node.firstChild) {
                    parent.insertBefore(node.firstChild, node);
                }
                node.remove();
            }
        }
    });
    //
    // Preserve spaces around inline formatting
    //
    doc.querySelectorAll('i,em,b,strong,u').forEach(el => {
        const prev = el.previousSibling;
        const next = el.nextSibling;
        if (
            prev &&
            prev.nodeType === Node.TEXT_NODE &&
            !prev.textContent.endsWith(' ')
        ) {
            prev.textContent += ' ';
        }
        if (
            next &&
            next.nodeType === Node.TEXT_NODE &&
            !next.textContent.startsWith(' ')
        ) {
            next.textContent = ' ' + next.textContent;
        }
    });
    return doc.body.innerHTML;
}


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

    document.title = `${docTitle} • WRITE! (aroceu)` || 'Untitled • WRITE! (aroceu)';

    titleInput.addEventListener('input', (e) => {
        docTitle = e.target.value || 'Untitled';

         document.title = `${docTitle} • WRITE! (aroceu)` || 'Untitled • WRITE! (aroceu)';

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

const html = convertQuillAlignmentToMarkdownHTML(
    quill.root.innerHTML
);

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
document.title = `${docTitle} • WRITE! (aroceu)` || 'Untitled • WRITE! (aroceu)';
    localStorage.setItem('doc2_title', docTitle);
});

function convertQuillAlignmentToMarkdownHTML(html) {
    const container = document.createElement('div');
    container.innerHTML = html;

    container.querySelectorAll('.ql-align-center').forEach(el => {
        el.outerHTML =
            `<p align="center">${el.innerHTML}</p>`;
    });

    container.querySelectorAll('.ql-align-right').forEach(el => {
        el.outerHTML =
            `<p align="right">${el.innerHTML}</p>`;
    });

    container.querySelectorAll('.ql-align-justify').forEach(el => {
        el.outerHTML =
            `<p align="justify">${el.innerHTML}</p>`;
    });

    return container.innerHTML;
}

function syncToHtml() {
    if (isUpdating) return;

    const html = convertQuillAlignmentToMarkdownHTML(quill.root.innerHTML);
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
.replace(/<\/div>\s*<div[^>]*>/gi, '\n')
.replace(/<br\s*\/?>/gi, '\n')

        // cleanup empty paragraphs
        .replace(/<p>\s*<\/p>/gi, '')
        .replace(/<p>\s*<p>/g, '<p>')
        .replace(/<\/p>\s*<\/p>/g, '</p>');
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
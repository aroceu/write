function updateDerivedOutputs() {
    const html = quill.root.innerHTML;
    const cleanHtml = normalizeIncomingHTML(html);

    post('html_to_md', cleanHtml).then(res => {
        if (!isUpdating) md.value = res.result;
    });

    updateWordCount();
    updateAnalytics();
        localStorage.setItem('doc', JSON.stringify(quill.getContents()));
    localStorage.setItem('doc_title', docTitle);
    localStorage.setItem('doc_md', md.value);

}

quill.on('text-change', (delta, old, source) => {
    if (source !== Quill.sources.USER) return;
    if (isBooting) return;

     updateWordCount(); 
     updateAnalytics();
    syncToMarkdown();
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
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
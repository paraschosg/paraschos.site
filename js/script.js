// Generate line numbers
function setLineNumbers(fileId) {
    const content = document.querySelector(`#file-${fileId} .code-content`);
    const ln = document.getElementById(`ln-${fileId}`);
    if (!content || !ln) return;
    // Count lines
    const lines = content.innerHTML.split('\n').length + 5;
    ln.innerHTML = Array.from({length: lines}, (_, i) => i + 1).join('\n');
}

['profile','projects','skills','contact'].forEach(setLineNumbers);

// Tab switching
function switchTab(tabEl, fileId) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.file-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.sidebar-item').forEach(s => s.classList.remove('active'));
    tabEl.classList.add('active');
    document.getElementById('file-' + fileId).classList.add('active');
}

function switchTabById(fileId) {
    const tab = document.querySelector(`.tab[data-file="${fileId}"]`);
    if (tab) switchTab(tab, fileId);
    // Update sidebar
    document.querySelectorAll('.sidebar-item').forEach(s => s.classList.remove('active'));
    event.currentTarget.classList.add('active');
}

// Project expand/collapse
function toggleProject(header) {
    const body = header.nextElementSibling;
    const toggle = header.querySelector('.project-toggle');
    const isOpen = body.classList.contains('open');
    body.classList.toggle('open', !isOpen);
    toggle.classList.toggle('open', !isOpen);
    // Update + / -
    const typeEl = header.querySelector('.project-type');
    if (typeEl) {
        typeEl.textContent = typeEl.textContent.replace(/[+-]$/, isOpen ? '+' : '-');
    }
}
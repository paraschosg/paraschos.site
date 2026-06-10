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

// Typing animation για το titlebar
const typingEl = document.querySelector('.titlebar-available');
const fullText = 'available_for_hire: true';
typingEl.textContent = '';
typingEl.style.borderRight = '2px solid #4EC9B0';

let i = 0;
function typeChar() {
    if (i < fullText.length) {
        typingEl.textContent += fullText[i];
        i++;
        setTimeout(typeChar, 60);
    } else {
        // Σβήνει ο cursor μετά το τέλος
        setTimeout(() => typingEl.style.borderRight = 'none', 800);
    }
}

setTimeout(typeChar, 500); // Ξεκινάει μετά από 0.5s

// Visitor counter
async function loadVisitorCount() {
    try {
        const response = await fetch('https://api.counterapi.dev/v1/paraschos-site/visits/up');
        const data = await response.json();
        const count = data.count;

        const statusbar = document.querySelector('.statusbar');
        const counterEl = document.createElement('span');
        counterEl.textContent = `👁 ${count.toLocaleString()} visitors`;
        statusbar.insertBefore(counterEl, statusbar.querySelector('.statusbar-right'));
    } catch (e) {
        // Αν αποτύχει δεν εμφανίζει τίποτα
    }
}

loadVisitorCount();

// Copy email button
document.querySelectorAll("a[href='mailto:george@paraschos.site']").forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        navigator.clipboard.writeText('george@paraschos.site').then(() => {
            const original = link.textContent;
            link.textContent = '✓ Copied!';
            link.style.color = '#4EC9B0';
            setTimeout(() => {
                link.textContent = original;
                link.style.color = '';
            }, 2000);
        });
    });
});

// Keyboard shortcuts για tabs
document.addEventListener('keydown', (e) => {
    // Αγνόησε αν ο χρήστης πληκτρολογεί σε input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    const shortcuts = {
        '1': 'profile',
        '2': 'projects',
        '3': 'skills',
        '4': 'contact',
    };

    if (shortcuts[e.key]) {
        const fileId = shortcuts[e.key];
        const tab = document.querySelector(`.tab[data-file="${fileId}"]`);
        if (tab) switchTab(tab, fileId);
    }
});

// Terminal
const commands = {
    help: () => `
<span class="c">// Available commands:</span>
<span class="kw">about</span>      — who is George
<span class="kw">projects</span>   — view projects
<span class="kw">skills</span>     — tech stack
<span class="kw">contact</span>    — get in touch
<span class="kw">email</span>      — copy email to clipboard
<span class="kw">github</span>     — open GitHub profile
<span class="kw">clear</span>      — clear terminal
<span class="kw">hello</span>      — say hi
`,
    about: () => `
<span class="kw">const</span> <span class="ty">george</span> = {
  <span class="pr">university</span>: <span class="st">"University of the Aegean"</span>,
  <span class="pr">degree</span>:     <span class="st">"Information & Communication Systems Engineering"</span>,
  <span class="pr">status</span>:     <span class="st">"Final year"</span>,
  <span class="pr">available</span>:  <span class="kw">true</span>,
};`,
    projects: () => {
        const tab = document.querySelector('.tab[data-file="projects"]');
        if (tab) switchTab(tab, 'projects');
        return '<span class="c">// Opening projects.dir...</span>';
    },
    skills: () => {
        const tab = document.querySelector('.tab[data-file="skills"]');
        if (tab) switchTab(tab, 'skills');
        return '<span class="c">// Opening skills.json...</span>';
    },
    contact: () => {
        const tab = document.querySelector('.tab[data-file="contact"]');
        if (tab) switchTab(tab, 'contact');
        return '<span class="c">// Opening contact.sh...</span>';
    },
    email: () => {
        navigator.clipboard.writeText('george@paraschos.site');
        return '<span class="ty">✓ Copied george@paraschos.site to clipboard</span>';
    },
    github: () => {
        window.open('https://github.com/paraschosg', '_blank');
        return '<span class="c">// Opening github.com/paraschosg...</span>';
    },
    clear: () => {
        document.getElementById('terminal-output').innerHTML = '';
        return null;
    },
    hello: () => '<span class="st">"Hello! Thanks for visiting 👋"</span>',
};

const terminalInput = document.getElementById('terminal-input');
const terminalOutput = document.getElementById('terminal-output');
const history = [];
let historyIndex = -1;

if (terminalInput) {
    // Focus όταν ανοίγει το terminal tab
    document.querySelector('.tab[data-file="terminal"]')?.addEventListener('click', () => {
        setTimeout(() => terminalInput.focus(), 50);
    });

    terminalInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const input = terminalInput.value.trim().toLowerCase();
            if (!input) return;

            history.unshift(input);
            historyIndex = -1;

            // Εμφάνισε την εντολή
            const cmdLine = document.createElement('div');
            cmdLine.innerHTML = `<span style="color:#4EC9B0">george@paraschos.site:~$</span> <span style="color:#D4D4D4">${input}</span>`;
            terminalOutput.appendChild(cmdLine);

            // Εκτέλεσε την εντολή
            const fn = commands[input];
            const result = fn ? fn() : `<span style="color:#F44747">bash: ${input}: command not found</span><br><span class="c">// Type 'help' for available commands</span>`;

            if (result !== null) {
                const outputLine = document.createElement('div');
                outputLine.innerHTML = result;
                outputLine.style.marginBottom = '8px';
                terminalOutput.appendChild(outputLine);
            }

            terminalInput.value = '';
            terminalOutput.scrollTop = terminalOutput.scrollHeight;

        } else if (e.key === 'ArrowUp') {
            // History navigation
            if (historyIndex < history.length - 1) {
                historyIndex++;
                terminalInput.value = history[historyIndex];
            }
            e.preventDefault();
        } else if (e.key === 'ArrowDown') {
            if (historyIndex > 0) {
                historyIndex--;
                terminalInput.value = history[historyIndex];
            } else {
                historyIndex = -1;
                terminalInput.value = '';
            }
            e.preventDefault();
        }
    });
}

// Dark/Light mode toggle
const themeToggle = document.getElementById('theme-toggle');
const savedTheme = localStorage.getItem('theme') || 'dark';

if (savedTheme === 'light') {
    document.body.classList.add('light');
    themeToggle.textContent = '🌙';
}

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light');
    const isLight = document.body.classList.contains('light');
    themeToggle.textContent = isLight ? '🌙' : '☀';
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
});
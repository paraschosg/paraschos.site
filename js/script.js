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
    document.querySelectorAll('.file-section').forEach(s => {
        s.classList.remove('active');
        s.classList.remove('fade-in');
    });
    document.querySelectorAll('.sidebar-item').forEach(s => s.classList.remove('active'));
    tabEl.classList.add('active');
    const section = document.getElementById('file-' + fileId);
    section.classList.add('active');
    // Trigger animation
    requestAnimationFrame(() => {
        section.classList.add('fade-in');
    });
    setTimeout(renderMinimap, 50);
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

// Blog
async function loadBlog() {
    try {
        const res = await fetch('blog/posts.json');
        const posts = await res.json();
        renderBlogList(posts);
    } catch(e) {
        document.getElementById('blog-list').innerHTML =
            '<span class="c">// No posts found.</span>';
    }
}

function renderBlogList(posts) {
    const list = document.getElementById('blog-list');
    list.innerHTML = posts.map(post => `
    <div class="project-row" style="padding:10px 0; cursor:pointer"
      onclick="showBlogPost(${JSON.stringify(post).replace(/"/g, '&quot;')})">
      <div style="display:flex; align-items:center; gap:12px;">
        <span style="color:#858585; font-size:11px; min-width:80px">${post.date}</span>
        <span style="color:#DCDCAA; font-weight:500">${post.title}</span>
        <span style="color:#4EC9B0; font-size:11px; margin-left:auto">${post.tag}</span>
      </div>
      <div style="color:#858585; font-size:12px; margin-top:4px; padding-left:92px">
        ${post.preview}
      </div>
    </div>
  `).join('');
}

function showBlogPost(post) {
    document.getElementById('blog-list').style.display = 'none';
    document.getElementById('blog-post').style.display = 'block';

    const lines = post.content.split('\n').map(line =>
        `<span class="line"><span class="c">${line}</span></span>`
    ).join('');

    document.getElementById('blog-post-content').innerHTML = `
    <span class="line" style="font-size:16px; color:#D4D4D4; font-weight:500">${post.title}</span>
    <span class="line" style="color:#858585; margin-bottom:12px">${post.date} · ${post.tag}</span>
    <span class="line"></span>
    ${lines}
  `;
}

function showBlogList() {
    document.getElementById('blog-list').style.display = 'block';
    document.getElementById('blog-post').style.display = 'none';
}

loadBlog();

// Scroll progress bar
const progressBar = document.getElementById('scroll-progress');
document.querySelector('.editor').addEventListener('scroll', function() {
    const scrollTop = this.scrollTop;
    const scrollHeight = this.scrollHeight - this.clientHeight;
    const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    progressBar.style.width = progress + '%';
});

// Live GitHub Activity
async function loadGitHubActivity() {
    const container = document.getElementById('github-activity');
    if (!container) return;

    try {
        const res = await fetch('https://api.github.com/users/paraschosg/events/public');
        const events = await res.json();

        if (!Array.isArray(events) || events.length === 0) {
            container.innerHTML = '<span class="line" style="color:#858585">// No recent activity found.</span>';
            return;
        }

        const lines = events.slice(0, 20).map(event => {
            const date = new Date(event.created_at).toLocaleDateString('en-GB', {
                day: '2-digit', month: 'short', year: 'numeric'
            });
            const repo = event.repo.name.replace('paraschosg/', '');

            let icon = '⊙';
            let action = '';
            let color = '#858585';

            switch(event.type) {
                case 'PushEvent':
                    icon = '↑';
                    color = '#4EC9B0';
                    const commits = event.payload.commits || [];
                    const msg = commits.length > 0 ? commits[commits.length-1].message : 'pushed commits';
                    action = `<span style="color:#4EC9B0">push</span> to <span style="color:#DCDCAA">${repo}</span> <span style="color:#858585">— ${msg.split('\n')[0].slice(0,50)}</span>`;
                    break;
                case 'CreateEvent':
                    icon = '+';
                    color = '#569CD6';
                    action = `<span style="color:#569CD6">created</span> ${event.payload.ref_type} <span style="color:#DCDCAA">${event.payload.ref || repo}</span>`;
                    break;
                case 'WatchEvent':
                    icon = '★';
                    color = '#DCDCAA';
                    action = `<span style="color:#DCDCAA">starred</span> <span style="color:#9CDCFE">${repo}</span>`;
                    break;
                case 'ForkEvent':
                    icon = '⑂';
                    color = '#C586C0';
                    action = `<span style="color:#C586C0">forked</span> <span style="color:#9CDCFE">${repo}</span>`;
                    break;
                case 'IssuesEvent':
                    icon = '!';
                    color = '#F44747';
                    action = `<span style="color:#F44747">${event.payload.action} issue</span> in <span style="color:#DCDCAA">${repo}</span>`;
                    break;
                case 'PullRequestEvent':
                    icon = '⇄';
                    color = '#569CD6';
                    action = `<span style="color:#569CD6">${event.payload.action} PR</span> in <span style="color:#DCDCAA">${repo}</span>`;
                    break;
                default:
                    action = `<span style="color:#858585">${event.type.replace('Event','')} in ${repo}</span>`;
            }

            return `<div class="project-row" style="padding:6px 0">
        <span style="color:${color}; margin-right:8px">${icon}</span>
        <span style="color:#858585; font-size:11px; margin-right:12px">${date}</span>
        ${action}
      </div>`;
        }).join('');

        container.innerHTML = lines;
        setLineNumbers('activity');

    } catch(e) {
        container.innerHTML = `
      <span class="line" style="color:#F44747">// Error fetching GitHub activity</span>
      <span class="line" style="color:#858585">// GitHub API rate limit may have been reached.</span>
      <span class="line" style="color:#858585">// Try again in a few minutes.</span>
    `;
    }
}

loadGitHubActivity();

// Clock στο status bar
function updateClock() {
    const clock = document.getElementById('status-clock');
    if (!clock) return;
    const now = new Date();
    const time = now.toLocaleTimeString('en-GB', {
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
    clock.textContent = time;
}
updateClock();
setInterval(updateClock, 1000);

// Contributions Graph
async function loadContributions() {
    const container = document.getElementById('contributions-graph');
    if (!container) return;

    try {
        // GitHub doesn't have a public contributions API so we use a proxy service
        const username = 'paraschosg';
        const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=last`);
        const data = await res.json();

        const contributions = data.contributions;
        if (!contributions || contributions.length === 0) throw new Error('No data');

        // Group by week
        const weeks = [];
        let week = [];
        contributions.forEach((day, i) => {
            week.push(day);
            if (week.length === 7) {
                weeks.push(week);
                week = [];
            }
        });
        if (week.length > 0) weeks.push(week);

        const totalContributions = contributions.reduce((sum, d) => sum + d.count, 0);

        // Color scale
        const getColor = (count) => {
            if (count === 0) return '#161b22';
            if (count <= 3)  return '#0e4429';
            if (count <= 6)  return '#006d32';
            if (count <= 9)  return '#26a641';
            return '#39d353';
        };

        const days = ['Mon', '', 'Wed', '', 'Fri', '', ''];
        const months = [];
        let lastMonth = -1;
        weeks.forEach((week, wi) => {
            const firstDay = week.find(d => d);
            if (firstDay) {
                const month = new Date(firstDay.date).getMonth();
                if (month !== lastMonth) {
                    months.push({ week: wi, name: new Date(firstDay.date).toLocaleDateString('en-GB', { month: 'short' }) });
                    lastMonth = month;
                }
            }
        });

        // Build SVG
        const cellSize = 12;
        const gap = 3;
        const offsetX = 30;
        const offsetY = 28;
        const svgWidth = weeks.length * (cellSize + gap) + offsetX;
        const svgHeight = 7 * (cellSize + gap) + offsetY + 20;

        let svg = `<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg" style="font-family:'JetBrains Mono',monospace">`;

        // Month labels
        months.forEach(m => {
            const x = offsetX + m.week * (cellSize + gap);
            svg += `<text x="${x}" y="16" fill="#858585" font-size="10">${m.name}</text>`;
        });

        // Day labels
        days.forEach((day, i) => {
            if (!day) return;
            const y = offsetY + i * (cellSize + gap) + cellSize - 2;
            svg += `<text x="0" y="${y}" fill="#858585" font-size="10">${day}</text>`;
        });

        // Cells
        weeks.forEach((week, wi) => {
            week.forEach((day, di) => {
                const x = offsetX + wi * (cellSize + gap);
                const y = offsetY + di * (cellSize + gap);
                const color = getColor(day.count);
                svg += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" rx="2" fill="${color}">
          <title>${day.date}: ${day.count} contribution${day.count !== 1 ? 's' : ''}</title>
        </rect>`;
            });
        });

        svg += '</svg>';

        container.innerHTML = `
      <div style="margin-bottom:16px">
        <span style="color:#D4D4D4; font-size:14px">${totalContributions.toLocaleString()} contributions in the last year</span>
      </div>
      <div style="overflow-x:auto; padding-bottom:8px">${svg}</div>
      <div style="display:flex; align-items:center; gap:6px; margin-top:12px; font-size:11px; color:#858585">
        <span>Less</span>
        <rect style="width:12px;height:12px;background:#161b22;display:inline-block;border-radius:2px"></rect>
        <rect style="width:12px;height:12px;background:#0e4429;display:inline-block;border-radius:2px"></rect>
        <rect style="width:12px;height:12px;background:#006d32;display:inline-block;border-radius:2px"></rect>
        <rect style="width:12px;height:12px;background:#26a641;display:inline-block;border-radius:2px"></rect>
        <rect style="width:12px;height:12px;background:#39d353;display:inline-block;border-radius:2px"></rect>
        <span>More</span>
      </div>
    `;
        

    } catch(e) {
        container.innerHTML = `
      <span class="line" style="color:#F44747">// Error loading contributions</span>
      <span class="line" style="color:#858585">// Visit <a href="https://github.com/paraschosg" target="_blank" style="color:#4EC9B0">github.com/paraschosg</a> directly.</span>
    `;
    }
}

loadContributions();
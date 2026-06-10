// Generate line numbers
function setLineNumbers(fileId) {
    const content = document.querySelector(`#file-${fileId} .code-content`);
    const ln = document.getElementById(`ln-${fileId}`);
    if (!content || !ln) return;
    // Count lines
    const lines = content.innerHTML.split('\n').length + 5;
    ln.innerHTML = Array.from({length: lines}, (_, i) => i + 1).join('\n');
}

['profile','skills','contact'].forEach(setLineNumbers);

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
    // Reset line animations on tab switch
    const lines = section.querySelectorAll('.line');
    lines.forEach((line, i) => {
        line.style.animation = 'none';
        line.offsetHeight; // force reflow
        line.style.animation = '';
        line.style.animationDelay = `${i * 0.03}s`;
    });
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
        setTimeout(() => typingEl.style.borderRight = 'none', 800);
    }
}

setTimeout(typeChar, 500);

// Visitor counter
async function loadVisitorCount() {
    try {
        const response = await fetch('https://api.counterapi.dev/v1/paraschos-site/visits/up');
        const data = await response.json();
        const count = data.count;

        const statusbar = document.querySelector('.statusbar');
        const counterEl = document.createElement('span');
        counterEl.textContent = `👁 ${count.toLocaleString()} visits`;
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
<span class="kw">linkedin</span>   — open LinkedIn profile
<span class="kw">neofetch</span>   — system information
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
    linkedin: () => {
        window.open('https://www.linkedin.com/in/georgios-paraschos-1a366521b/', '_blank');
        return '<span class="c">// Opening linkedin.com/in/george-paraschos...</span>';
    },
    clear: () => {
        document.getElementById('terminal-output').innerHTML = '';
        return null;
    },
    hello: () => '<span class="st">"Hello! Thanks for visiting 👋"</span>',
    whoami: () => {
        const ua = navigator.userAgent;
        const browser = ua.includes('Chrome') ? 'Chrome' :
            ua.includes('Firefox') ? 'Firefox' :
                ua.includes('Safari') ? 'Safari' :
                    ua.includes('Edge') ? 'Edge' : 'Unknown';
        const os = ua.includes('Windows') ? 'Windows' :
            ua.includes('Mac') ? 'macOS' :
                ua.includes('Linux') ? 'Linux' :
                    ua.includes('Android') ? 'Android' :
                        ua.includes('iPhone') ? 'iOS' : 'Unknown';
        const lang = navigator.language || 'Unknown';
        const screen = `${window.screen.width}x${window.screen.height}`;
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

        return `
<span class="kw">const</span> <span class="ty">visitor</span> = {
  <span class="pr">browser</span>:  <span class="st">"${browser}"</span>,
  <span class="pr">os</span>:       <span class="st">"${os}"</span>,
  <span class="pr">language</span>: <span class="st">"${lang}"</span>,
  <span class="pr">screen</span>:   <span class="st">"${screen}"</span>,
  <span class="pr">timezone</span>: <span class="st">"${tz}"</span>,
};`;
    },
    woike: () => `<pre style="color:#4EC9B0; line-height:1.4; font-size:13px">
██╗    ██╗ ██████╗ ██╗██╗  ██╗███████╗
██║    ██║██╔═══██╗██║██║ ██╔╝██╔════╝
██║ █╗ ██║██║   ██║██║█████╔╝ █████╗  
██║███╗██║██║   ██║██║██╔═██╗ ██╔══╝  
╚███╔███╔╝╚██████╔╝██║██║  ██╗███████╗
 ╚══╝╚══╝  ╚═════╝ ╚═╝╚═╝  ╚═╝╚══════╝

<span style="color:#858585">// Easter egg unlocked. woike woike woike</span>
</pre>`,
    neofetch: () => `<pre style="line-height:1.6; font-size:12px">
<span style="color:#4EC9B0">    ██████</span>    <span style="color:#569CD6">george</span><span style="color:#D4D4D4">@</span><span style="color:#569CD6">paraschos.site</span>
<span style="color:#4EC9B0">  ████████</span>    <span style="color:#858585">──────────────────────</span>
<span style="color:#4EC9B0"> ████</span><span style="color:#569CD6">████</span><span style="color:#4EC9B0">█</span>    <span style="color:#569CD6">OS:</span>        <span style="color:#D4D4D4">paraschos.site v1.0</span>
<span style="color:#4EC9B0"> ████</span><span style="color:#569CD6">████</span><span style="color:#4EC9B0">█</span>    <span style="color:#569CD6">Host:</span>      <span style="color:#D4D4D4">GitHub Pages</span>
<span style="color:#4EC9B0"> █████████</span>    <span style="color:#569CD6">Kernel:</span>    <span style="color:#D4D4D4">HTML 5.0 / CSS 3.0</span>
<span style="color:#4EC9B0">  ███████</span>     <span style="color:#569CD6">Shell:</span>     <span style="color:#D4D4D4">bash (this terminal)</span>
<span style="color:#4EC9B0">    ████</span>      <span style="color:#569CD6">Editor:</span>    <span style="color:#D4D4D4">VS Code (obviously)</span>
<span style="color:#4EC9B0">     ██</span>       <span style="color:#569CD6">Lang:</span>      <span style="color:#D4D4D4">Java, Python, JavaScript</span>
              <span style="color:#569CD6">Backend:</span>   <span style="color:#D4D4D4">Spring Boot + JPA</span>
              <span style="color:#569CD6">DB:</span>        <span style="color:#D4D4D4">MySQL</span>
              <span style="color:#569CD6">University:</span><span style="color:#D4D4D4">University of the Aegean</span>
              <span style="color:#569CD6">Status:</span>    <span style="color:#4EC9B0">available_for_hire: true</span>
              <span style="color:#569CD6">Uptime:</span>    <span style="color:#D4D4D4">Final year</span>
              <span style="color:#569CD6">Email:</span>     <span style="color:#CE9178">george@paraschos.site</span>

              <span style="background:#F44747">   </span><span style="background:#FFBD2E">   </span><span style="background:#28C840">   </span><span style="background:#569CD6">   </span><span style="background:#C586C0">   </span><span style="background:#4EC9B0">   </span><span style="background:#D4D4D4">   </span>
</pre>`,
};

const terminalInput = document.getElementById('terminal-input');
const terminalOutput = document.getElementById('terminal-output');
const history = [];
let historyIndex = -1;

if (terminalInput) {
    document.querySelector('.tab[data-file="terminal"]')?.addEventListener('click', () => {
        setTimeout(() => terminalInput.focus(), 50);
    });

    terminalInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const input = terminalInput.value.trim().toLowerCase();
            if (!input) return;

            history.unshift(input);
            historyIndex = -1;

            const cmdLine = document.createElement('div');
            cmdLine.innerHTML = `<span style="color:#4EC9B0">george@paraschos.site:~$</span> <span style="color:#D4D4D4">${input}</span>`;
            terminalOutput.appendChild(cmdLine);

            const fn = commands[input];
            let result;
            if (fn) {
                result = fn();
            } else {
                result = `<span style="color:#F44747">bash: ${input}: command not found</span><br><span class="c">// Type 'help' for available commands</span>`;
                terminalInput.classList.add('shake');
                setTimeout(() => terminalInput.classList.remove('shake'), 400);
            }

            if (result !== null) {
                const outputLine = document.createElement('div');
                outputLine.innerHTML = result;
                outputLine.style.marginBottom = '8px';
                terminalOutput.appendChild(outputLine);
            }

            terminalInput.value = '';
            terminalOutput.scrollTop = terminalOutput.scrollHeight;

        } else if (e.key === 'ArrowUp') {
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

// Minimap
const minimapCanvas = document.getElementById('minimap-canvas');
const minimapSlider = document.getElementById('minimap-slider');
const minimap = document.getElementById('minimap');
const editorEl = document.getElementById('editor');
const SCALE = 0.1;

function renderMinimap() {
    const activeSection = document.querySelector('.file-section.active .code-content');
    if (!activeSection || !minimapCanvas) return;

    const fullHeight = activeSection.scrollHeight;
    const canvasHeight = Math.min(fullHeight * SCALE, minimap.clientHeight);

    minimapCanvas.width = minimap.clientWidth;
    minimapCanvas.height = canvasHeight;
    minimapCanvas.style.height = canvasHeight + 'px';

    const ctx = minimapCanvas.getContext('2d');
    ctx.clearRect(0, 0, minimapCanvas.width, canvasHeight);

    const lines = activeSection.querySelectorAll('.line');
    lines.forEach((line, i) => {
        const y = (i / lines.length) * canvasHeight;
        const text = line.textContent.trim();
        if (!text) return;

        let color = '#858585';
        if (line.querySelector('.kw')) color = '#569CD6';
        else if (line.querySelector('.st')) color = '#CE9178';
        else if (line.querySelector('.c'))  color = '#6A9955';
        else if (line.querySelector('.fn')) color = '#DCDCAA';
        else if (line.querySelector('.pr')) color = '#9CDCFE';

        const w = Math.min(text.length * 1.2, minimapCanvas.width - 4);
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.6;
        ctx.fillRect(2, y, w, 1.5);
    });

    updateMinimapSlider();
}

function updateMinimapSlider() {
    if (!minimapSlider || !editorEl) return;
    const scrollRatio = editorEl.scrollTop / (editorEl.scrollHeight - editorEl.clientHeight || 1);
    const viewRatio = editorEl.clientHeight / editorEl.scrollHeight;
    const sliderHeight = Math.max(viewRatio * minimap.clientHeight, 20);
    const sliderTop = scrollRatio * (minimap.clientHeight - sliderHeight);
    minimapSlider.style.height = sliderHeight + 'px';
    minimapSlider.style.top = sliderTop + 'px';
}

minimap?.addEventListener('click', (e) => {
    const ratio = e.offsetY / minimap.clientHeight;
    editorEl.scrollTop = ratio * (editorEl.scrollHeight - editorEl.clientHeight);
});

editorEl?.addEventListener('scroll', () => {
    updateMinimapSlider();
    const scrollTop = editorEl.scrollTop;
    const scrollHeight = editorEl.scrollHeight - editorEl.clientHeight;
    const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    if (progressBar) progressBar.style.width = progress + '%';
});

setTimeout(renderMinimap, 100);

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
        const username = 'paraschosg';
        const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=last`);
        const data = await res.json();

        const contributions = data.contributions;
        if (!contributions || contributions.length === 0) throw new Error('No data');

        const weeks = [];
        let week = [];
        contributions.forEach((day) => {
            week.push(day);
            if (week.length === 7) {
                weeks.push(week);
                week = [];
            }
        });
        if (week.length > 0) weeks.push(week);

        const totalContributions = contributions.reduce((sum, d) => sum + d.count, 0);

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

        const cellSize = 12;
        const gap = 3;
        const offsetX = 30;
        const offsetY = 28;
        const svgWidth = weeks.length * (cellSize + gap) + offsetX;
        const svgHeight = 7 * (cellSize + gap) + offsetY + 20;

        let svg = `<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg" style="font-family:'JetBrains Mono',monospace">`;

        months.forEach(m => {
            const x = offsetX + m.week * (cellSize + gap);
            svg += `<text x="${x}" y="16" fill="#858585" font-size="10">${m.name}</text>`;
        });

        days.forEach((day, i) => {
            if (!day) return;
            const y = offsetY + i * (cellSize + gap) + cellSize - 2;
            svg += `<text x="0" y="${y}" fill="#858585" font-size="10">${day}</text>`;
        });

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
        <span style="width:12px;height:12px;background:#161b22;display:inline-block;border-radius:2px"></span>
        <span style="width:12px;height:12px;background:#0e4429;display:inline-block;border-radius:2px"></span>
        <span style="width:12px;height:12px;background:#006d32;display:inline-block;border-radius:2px"></span>
        <span style="width:12px;height:12px;background:#26a641;display:inline-block;border-radius:2px"></span>
        <span style="width:12px;height:12px;background:#39d353;display:inline-block;border-radius:2px"></span>
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

// Loading screen
const loadingScreen = document.getElementById('loading-screen');
const loadingBar = document.getElementById('loading-bar');
const loadingMsg = document.getElementById('loading-msg');
const loadingPct = document.getElementById('loading-pct');

const loadingSteps = [
    { pct: 15,  msg: 'Loading extensions...' },
    { pct: 30,  msg: 'Reading file system...' },
    { pct: 50,  msg: 'Parsing syntax tree...' },
    { pct: 65,  msg: 'Fetching GitHub activity...' },
    { pct: 80,  msg: 'Building contributions graph...' },
    { pct: 92,  msg: 'Starting language server...' },
    { pct: 100, msg: 'Ready.' },
];

let stepIndex = 0;
function runLoadingStep() {
    if (stepIndex >= loadingSteps.length) {
        setTimeout(() => {
            loadingScreen.style.transition = 'opacity 0.4s ease';
            loadingScreen.style.opacity = '0';
            setTimeout(() => loadingScreen.remove(), 400);
        }, 300);
        return;
    }
    const step = loadingSteps[stepIndex];
    loadingBar.style.width = step.pct + '%';
    loadingMsg.textContent = step.msg;
    loadingPct.textContent = step.pct + '%';
    stepIndex++;
    setTimeout(runLoadingStep, stepIndex === loadingSteps.length ? 400 : 250);
}

setTimeout(runLoadingStep, 200);

// Typewriter mode
// const typewriterToggle = document.getElementById('typewriter-toggle');
// let typewriterActive = false;
//
// typewriterToggle.addEventListener('click', () => {
//     typewriterActive = !typewriterActive;
//     typewriterToggle.style.color = typewriterActive ? '#4EC9B0' : '#CCCCCC';
//
//     if (typewriterActive) {
//         document.body.classList.add('typewriter-mode');
//         const lines = document.querySelectorAll('.file-section.active .line');
//         lines.forEach((line, i) => {
//             line.style.animationDelay = `${i * 0.05}s`;
//         });
//     } else {
//         document.body.classList.remove('typewriter-mode');
//         document.querySelectorAll('.line').forEach(line => {
//             line.style.animationDelay = '';
//             line.style.opacity = '';
//         });
//     }
// });
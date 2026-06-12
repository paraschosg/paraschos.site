/* ════════════════════════════════════════════════
   CONSENT — analytics only run after explicit opt-in
   ════════════════════════════════════════════════ */
const CONSENT_KEY = 'analytics-consent'; // 'granted' | 'denied' | null

function getConsent() {
    return localStorage.getItem(CONSENT_KEY);
}

function analyticsAllowed() {
    return getConsent() === 'granted';
}

function loadGoogleAnalytics() {
    if (window.__gaLoaded) return;
    window.__gaLoaded = true;
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=G-7T6VM4DQBP';
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { dataLayer.push(arguments); };
    gtag('js', new Date());
    gtag('config', 'G-7T6VM4DQBP', { anonymize_ip: true });
}

function startAnalytics() {
    loadGoogleAnalytics();
    loadVisitorCount();
    updatePresence();
    presenceTimer = setInterval(updatePresence, 15000);
    trackEvent('pageview');
}

/* ════════════════════════════════════════════════
   LINE NUMBERS
   ════════════════════════════════════════════════ */
function setLineNumbers(fileId) {
    const content = document.querySelector(`#file-${fileId} .code-content`);
    const ln = document.getElementById(`ln-${fileId}`);
    if (!content || !ln) return;
    const lines = Math.max(content.querySelectorAll('.line').length, 1) + 5;
    ln.innerHTML = Array.from({ length: lines }, (_, i) => i + 1).join('\n');
}

const STATIC_TABS = ['profile', 'projects', 'skills', 'contact', 'terminal', 'blog', 'activity'];
STATIC_TABS.forEach(setLineNumbers);

/* ════════════════════════════════════════════════
   TAB SWITCHING (with one-time typewriter reveal)
   ════════════════════════════════════════════════ */
const revealedTabs = new Set(['profile']); // first tab is visible on load

function switchTab(tabEl, fileId) {
    document.querySelectorAll('.tab').forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
    });
    document.querySelectorAll('.file-section').forEach(s => {
        s.classList.remove('active', 'fade-in', 'reveal');
    });
    document.querySelectorAll('.sidebar-item').forEach(s => s.classList.remove('active'));

    if (tabEl) {
        tabEl.classList.add('active');
        tabEl.setAttribute('aria-selected', 'true');
    }
    const sidebarItem = document.querySelector(`.sidebar-item[data-file="${fileId}"]`);
    sidebarItem?.classList.add('active');

    const section = document.getElementById('file-' + fileId);
    if (!section) return;
    section.classList.add('active');

    trackEvent('tab_open', { tab: fileId });

    // Typewriter reveal only the first time a tab is opened
    if (!revealedTabs.has(fileId)) {
        revealedTabs.add(fileId);
        section.classList.add('reveal');
        section.querySelectorAll('.line').forEach((line, i) => {
            line.style.animationDelay = `${i * 0.03}s`;
        });
    }
    requestAnimationFrame(() => section.classList.add('fade-in'));
}

function switchTabById(fileId) {
    const tab = document.querySelector(`.tab[data-file="${fileId}"]`);
    switchTab(tab, fileId);
}

// Wire up tabs and sidebar items (click + keyboard)
function activate(el) {
    if (el.dataset.file) {
        switchTabById(el.dataset.file);
        if (el.dataset.file === 'terminal') {
            setTimeout(() => document.getElementById('terminal-input')?.focus(), 50);
        }
    } else if (el.dataset.href) {
        if (el.dataset.self) window.location.href = el.dataset.href;
        else window.open(el.dataset.href, '_blank', 'noopener');
    }
}

document.querySelectorAll('.tab, .sidebar-item').forEach(el => {
    el.addEventListener('click', () => activate(el));
    el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            activate(el);
        }
    });
});

/* ════════════════════════════════════════════════
   PROJECT EXPAND / COLLAPSE
   ════════════════════════════════════════════════ */
function toggleProject(header) {
    const body = header.nextElementSibling;
    const toggle = header.querySelector('.project-toggle');
    const isOpen = body.classList.contains('open');
    body.classList.toggle('open', !isOpen);
    toggle.classList.toggle('open', !isOpen);
    header.setAttribute('aria-expanded', String(!isOpen));
    const typeEl = header.querySelector('.project-type');
    if (typeEl) {
        typeEl.textContent = typeEl.textContent.replace(/[+-]$/, isOpen ? '+' : '-');
    }
}

document.querySelectorAll('.project-header').forEach(header => {
    header.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleProject(header);
        }
    });
});

/* ════════════════════════════════════════════════
   TITLEBAR TYPING ANIMATION
   ════════════════════════════════════════════════ */
const typingEl = document.querySelector('.titlebar-available');
if (typingEl) {
    const fullText = 'available_for_hire: true';
    const textSpan = document.createElement('span');
    textSpan.style.borderRight = '2px solid #4EC9B0';
    typingEl.appendChild(textSpan);
    let i = 0;
    function typeChar() {
        if (i < fullText.length) {
            textSpan.textContent += fullText[i];
            i++;
            setTimeout(typeChar, 60);
        } else {
            setTimeout(() => textSpan.style.borderRight = 'none', 800);
        }
    }
    setTimeout(typeChar, 500);
}

/* ════════════════════════════════════════════════
   VISITOR COUNTER (consent-gated, called from startAnalytics)
   ════════════════════════════════════════════════ */
async function loadVisitorCount() {
    try {
        const response = await fetch('https://api.counterapi.dev/v1/paraschos-site/visits/up');
        const data = await response.json();
        const count = data.count;
        const statusbar = document.querySelector('.statusbar');
        const counterEl = document.createElement('span');
        counterEl.textContent = `👁 ${count.toLocaleString()} visits`;
        statusbar.insertBefore(counterEl, statusbar.querySelector('.statusbar-right'));
    } catch (e) {}
}

/* ════════════════════════════════════════════════
   COPY EMAIL ON CLICK
   ════════════════════════════════════════════════ */
document.querySelectorAll("a[href='mailto:george@paraschos.site']").forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        navigator.clipboard.writeText('george@paraschos.site').then(() => {
            const original = link.textContent;
            link.textContent = '✓ Copied!';
            link.style.color = 'var(--accent)';
            setTimeout(() => {
                link.textContent = original;
                link.style.color = '';
            }, 2000);
        });
    });
});

/* ════════════════════════════════════════════════
   KEYBOARD SHORTCUTS FOR TABS
   ════════════════════════════════════════════════ */
document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    const shortcuts = { '1': 'profile', '2': 'projects', '3': 'skills', '4': 'contact' };
    if (shortcuts[e.key]) switchTabById(shortcuts[e.key]);
});

/* ════════════════════════════════════════════════
   TERMINAL
   ════════════════════════════════════════════════ */
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
<span class="kw">whoami</span>     — visitor information
<span class="kw">privacy</span>    — privacy notice
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
        switchTabById('projects');
        return '<span class="c">// Opening projects.dir...</span>';
    },
    skills: () => {
        switchTabById('skills');
        return '<span class="c">// Opening skills.json...</span>';
    },
    contact: () => {
        switchTabById('contact');
        return '<span class="c">// Opening contact.sh...</span>';
    },
    email: () => {
        navigator.clipboard.writeText('george@paraschos.site');
        return '<span class="ty">✓ Copied george@paraschos.site to clipboard</span>';
    },
    github: () => {
        window.open('https://github.com/paraschosg', '_blank', 'noopener');
        return '<span class="c">// Opening github.com/paraschosg...</span>';
    },
    linkedin: () => {
        window.open('https://www.linkedin.com/in/georgios-paraschos-1a366521b/', '_blank', 'noopener');
        return '<span class="c">// Opening linkedin.com/in/george-paraschos...</span>';
    },
    privacy: () => {
        window.location.href = '/privacy.html';
        return '<span class="c">// Opening privacy.md...</span>';
    },
    clear: () => {
        document.getElementById('terminal-output').innerHTML = '';
        return null;
    },
    hello: () => '<span class="st">"Hello! Thanks for visiting 👋"</span>',
    whoami: () => {
        const ua = navigator.userAgent;
        const browser = ua.includes('Chrome') ? 'Chrome' : ua.includes('Firefox') ? 'Firefox' : ua.includes('Safari') ? 'Safari' : ua.includes('Edge') ? 'Edge' : 'Unknown';
        const os = ua.includes('Windows') ? 'Windows' : ua.includes('Mac') ? 'macOS' : ua.includes('Linux') ? 'Linux' : ua.includes('Android') ? 'Android' : ua.includes('iPhone') ? 'iOS' : 'Unknown';
        const lang = navigator.language || 'Unknown';
        const scr = `${window.screen.width}x${window.screen.height}`;
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        return `
<span class="kw">const</span> <span class="ty">visitor</span> = {
  <span class="pr">browser</span>:  <span class="st">"${browser}"</span>,
  <span class="pr">os</span>:       <span class="st">"${os}"</span>,
  <span class="pr">language</span>: <span class="st">"${lang}"</span>,
  <span class="pr">screen</span>:   <span class="st">"${scr}"</span>,
  <span class="pr">timezone</span>: <span class="st">"${tz}"</span>,
};
<span class="c">// Computed in your browser. Nothing here is sent anywhere.</span>`;
    },
    woike: () => `<pre style="color:var(--accent); line-height:1.4; font-size:13px">
██╗    ██╗ ██████╗ ██╗██╗  ██╗███████╗
██║    ██║██╔═══██╗██║██║ ██╔╝██╔════╝
██║ █╗ ██║██║   ██║██║█████╔╝ █████╗  
██║███╗██║██║   ██║██║██╔═██╗ ██╔══╝  
╚███╔███╔╝╚██████╔╝██║██║  ██╗███████╗
 ╚══╝╚══╝  ╚═════╝ ╚═╝╚═╝  ╚═╝╚══════╝

<span style="color:var(--line-num)">// Easter egg unlocked. woike woike woike</span>
</pre>`,
    neofetch: () => `<pre style="line-height:1.6; font-size:12px">
<span style="color:var(--accent)">    ██████</span>    <span style="color:var(--accent2)">george</span><span style="color:var(--text)">@</span><span style="color:var(--accent2)">paraschos.site</span>
<span style="color:var(--accent)">  ████████</span>    <span style="color:var(--line-num)">──────────────────────</span>
<span style="color:var(--accent)"> ████</span><span style="color:var(--accent2)">████</span><span style="color:var(--accent)">█</span>    <span style="color:var(--accent2)">OS:</span>        <span style="color:var(--text)">paraschos.site v1.1</span>
<span style="color:var(--accent)"> ████</span><span style="color:var(--accent2)">████</span><span style="color:var(--accent)">█</span>    <span style="color:var(--accent2)">Host:</span>      <span style="color:var(--text)">GitHub Pages</span>
<span style="color:var(--accent)"> █████████</span>    <span style="color:var(--accent2)">Kernel:</span>    <span style="color:var(--text)">HTML 5.0 / CSS 3.0</span>
<span style="color:var(--accent)">  ███████</span>     <span style="color:var(--accent2)">Shell:</span>     <span style="color:var(--text)">bash (this terminal)</span>
<span style="color:var(--accent)">    ████</span>      <span style="color:var(--accent2)">Editor:</span>    <span style="color:var(--text)">VS Code (obviously)</span>
<span style="color:var(--accent)">     ██</span>       <span style="color:var(--accent2)">Lang:</span>      <span style="color:var(--text)">Java, Python, JavaScript</span>
              <span style="color:var(--accent2)">Backend:</span>   <span style="color:var(--text)">Spring Boot + JPA</span>
              <span style="color:var(--accent2)">DB:</span>        <span style="color:var(--text)">MySQL</span>
              <span style="color:var(--accent2)">University:</span><span style="color:var(--text)">University of the Aegean</span>
              <span style="color:var(--accent2)">Status:</span>    <span style="color:var(--accent)">available_for_hire: true</span>
              <span style="color:var(--accent2)">Uptime:</span>    <span style="color:var(--text)">Final year</span>
              <span style="color:var(--accent2)">Email:</span>     <span style="color:var(--accent3)">george@paraschos.site</span>

              <span style="background:#F44747">   </span><span style="background:#FFBD2E">   </span><span style="background:#28C840">   </span><span style="background:#569CD6">   </span><span style="background:#C586C0">   </span><span style="background:#4EC9B0">   </span><span style="background:#D4D4D4">   </span>
</pre>`,
};

const terminalInput = document.getElementById('terminal-input');
const terminalOutput = document.getElementById('terminal-output');
const cmdHistory = [];
let historyIndex = -1;

if (terminalInput) {
    terminalInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const input = terminalInput.value.trim().toLowerCase();
            if (!input) return;

            cmdHistory.unshift(input);
            historyIndex = -1;

            const cmdLine = document.createElement('div');
            cmdLine.innerHTML = `<span style="color:var(--accent)">george@paraschos.site:~$</span> <span style="color:var(--text)"></span>`;
            cmdLine.lastElementChild.textContent = input; // never inject raw user input as HTML
            terminalOutput.appendChild(cmdLine);

            const fn = commands[input];
            let result;
            if (fn) {
                result = fn();
                trackEvent('terminal_command', { command: input });
            } else {
                const safe = input.replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
                result = `<span style="color:var(--red)">bash: ${safe}: command not found</span><br><span class="c">// Type 'help' for available commands</span>`;
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
            const editorEl = document.getElementById('editor');
            if (editorEl) editorEl.scrollTop = editorEl.scrollHeight;

        } else if (e.key === 'ArrowUp') {
            if (historyIndex < cmdHistory.length - 1) {
                historyIndex++;
                terminalInput.value = cmdHistory[historyIndex];
            }
            e.preventDefault();
        } else if (e.key === 'ArrowDown') {
            if (historyIndex > 0) {
                historyIndex--;
                terminalInput.value = cmdHistory[historyIndex];
            } else {
                historyIndex = -1;
                terminalInput.value = '';
            }
            e.preventDefault();
        }
    });
}

/* ════════════════════════════════════════════════
   THEME TOGGLE
   ════════════════════════════════════════════════ */
const themeToggle = document.getElementById('theme-toggle');
const savedTheme = localStorage.getItem('theme') || 'dark';

if (savedTheme === 'light') {
    document.body.classList.add('light');
    if (themeToggle) themeToggle.textContent = '🌙';
}

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light');
        const isLight = document.body.classList.contains('light');
        themeToggle.textContent = isLight ? '🌙' : '☀';
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
    });
}

/* ════════════════════════════════════════════════
   BLOG (index-based clicks — safe for any post content)
   ════════════════════════════════════════════════ */
let blogPosts = [];

async function loadBlog() {
    try {
        const res = await fetch('blog/posts.json');
        blogPosts = await res.json();
        renderBlogList(blogPosts);
        setLineNumbers('blog');
    } catch (e) {
        const el = document.getElementById('blog-list');
        if (el) el.innerHTML = '<span class="c">// No posts found.</span>';
    }
}

function renderBlogList(posts) {
    const list = document.getElementById('blog-list');
    if (!list) return;
    list.innerHTML = posts.map((post, i) => `
    <div class="project-row" style="padding:10px 0; cursor:pointer" role="button" tabindex="0"
      onclick="showBlogPost(${i})" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();showBlogPost(${i})}">
      <div style="display:flex; align-items:center; gap:12px;">
        <span style="color:var(--line-num); font-size:11px; min-width:80px">${post.date}</span>
        <span style="color:var(--accent4); font-weight:500">${post.title}</span>
        <span style="color:var(--accent); font-size:11px; margin-left:auto">${post.tag}</span>
      </div>
      <div style="color:var(--line-num); font-size:12px; margin-top:4px; padding-left:92px">
        ${post.preview}
      </div>
    </div>
  `).join('');
}

function showBlogPost(index) {
    const post = blogPosts[index];
    if (!post) return;
    document.getElementById('blog-list').style.display = 'none';
    document.getElementById('blog-post').style.display = 'block';
    const lines = post.content.split('\n').map(line => {
        const span = document.createElement('span');
        span.className = 'c';
        span.textContent = line;
        return `<span class="line">${span.outerHTML}</span>`;
    }).join('');
    document.getElementById('blog-post-content').innerHTML = `
    <span class="line" style="font-size:16px; color:var(--text); font-weight:500">${post.title}</span>
    <span class="line" style="color:var(--line-num); margin-bottom:12px">${post.date} · ${post.tag}</span>
    <span class="line"></span>
    ${lines}
  `;
}

function showBlogList() {
    document.getElementById('blog-list').style.display = 'block';
    document.getElementById('blog-post').style.display = 'none';
}

loadBlog();

/* ════════════════════════════════════════════════
   SCROLL PROGRESS BAR
   ════════════════════════════════════════════════ */
const progressBar = document.getElementById('scroll-progress');
const editorEl = document.getElementById('editor');

editorEl?.addEventListener('scroll', () => {
    const scrollTop = editorEl.scrollTop;
    const scrollHeight = editorEl.scrollHeight - editorEl.clientHeight;
    const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    if (progressBar) progressBar.style.width = progress + '%';
});

/* ════════════════════════════════════════════════
   GITHUB ACTIVITY
   ════════════════════════════════════════════════ */
async function loadGitHubActivity() {
    const container = document.getElementById('github-activity');
    if (!container) return;
    try {
        const res = await fetch('https://api.github.com/users/paraschosg/events/public');
        const events = await res.json();
        if (!Array.isArray(events) || events.length === 0) {
            container.innerHTML = '<span class="line" style="color:var(--line-num)">// No recent activity found.</span>';
            return;
        }
        const lines = events.slice(0, 20).map(event => {
            const date = new Date(event.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
            const repo = event.repo.name.replace('paraschosg/', '');
            let icon = '⊙', action = '', color = 'var(--line-num)';
            switch (event.type) {
                case 'PushEvent':
                    icon = '↑'; color = 'var(--accent)';
                    const commits = event.payload.commits || [];
                    const msg = commits.length > 0 ? commits[commits.length - 1].message : 'pushed commits';
                    action = `<span style="color:var(--accent)">push</span> to <span style="color:var(--accent4)">${repo}</span> <span style="color:var(--line-num)">— ${msg.split('\n')[0].slice(0, 50)}</span>`;
                    break;
                case 'CreateEvent':
                    icon = '+'; color = 'var(--accent2)';
                    action = `<span style="color:var(--accent2)">created</span> ${event.payload.ref_type} <span style="color:var(--accent4)">${event.payload.ref || repo}</span>`;
                    break;
                case 'WatchEvent':
                    icon = '★'; color = 'var(--accent4)';
                    action = `<span style="color:var(--accent4)">starred</span> <span style="color:var(--prop)">${repo}</span>`;
                    break;
                case 'ForkEvent':
                    icon = '⑂'; color = 'var(--pink)';
                    action = `<span style="color:var(--pink)">forked</span> <span style="color:var(--prop)">${repo}</span>`;
                    break;
                case 'IssuesEvent':
                    icon = '!'; color = 'var(--red)';
                    action = `<span style="color:var(--red)">${event.payload.action} issue</span> in <span style="color:var(--accent4)">${repo}</span>`;
                    break;
                case 'PullRequestEvent':
                    icon = '⇄'; color = 'var(--accent2)';
                    action = `<span style="color:var(--accent2)">${event.payload.action} PR</span> in <span style="color:var(--accent4)">${repo}</span>`;
                    break;
                default:
                    action = `<span style="color:var(--line-num)">${event.type.replace('Event', '')} in ${repo}</span>`;
            }
            return `<div class="project-row" style="padding:6px 0">
        <span style="color:${color}; margin-right:8px">${icon}</span>
        <span style="color:var(--line-num); font-size:11px; margin-right:12px">${date}</span>
        ${action}
      </div>`;
        }).join('');
        container.innerHTML = lines;
        setLineNumbers('activity');
    } catch (e) {
        container.innerHTML = `
      <span class="line" style="color:var(--red)">// Error fetching GitHub activity</span>
      <span class="line" style="color:var(--line-num)">// GitHub API rate limit may have been reached.</span>
    `;
    }
}

loadGitHubActivity();

/* ════════════════════════════════════════════════
   STATUS BAR CLOCK
   ════════════════════════════════════════════════ */
function updateClock() {
    const clock = document.getElementById('status-clock');
    if (!clock) return;
    const now = new Date();
    clock.textContent = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
updateClock();
setInterval(updateClock, 1000);

/* ════════════════════════════════════════════════
   CONTRIBUTIONS GRAPH (theme-aware via CSS variables)
   ════════════════════════════════════════════════ */
async function loadContributions() {
    const container = document.getElementById('contributions-graph');
    if (!container) return;
    try {
        const res = await fetch(`https://github-contributions-api.jogruber.de/v4/paraschosg?y=last`);
        const data = await res.json();
        const contributions = data.contributions;
        if (!contributions || contributions.length === 0) throw new Error('No data');
        const weeks = [];
        let week = [];
        contributions.forEach(day => {
            week.push(day);
            if (week.length === 7) { weeks.push(week); week = []; }
        });
        if (week.length > 0) weeks.push(week);
        const totalContributions = contributions.reduce((sum, d) => sum + d.count, 0);
        const getColor = (count) => {
            if (count === 0) return 'var(--contrib-0)';
            if (count <= 3)  return 'var(--contrib-1)';
            if (count <= 6)  return 'var(--contrib-2)';
            if (count <= 9)  return 'var(--contrib-3)';
            return 'var(--contrib-4)';
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
        const cellSize = 12, gap = 3, offsetX = 30, offsetY = 28;
        const svgWidth = weeks.length * (cellSize + gap) + offsetX;
        const svgHeight = 7 * (cellSize + gap) + offsetY + 20;
        let svg = `<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg" style="font-family:'JetBrains Mono',monospace" role="img" aria-label="GitHub contributions in the last year">`;
        months.forEach(m => {
            svg += `<text x="${offsetX + m.week * (cellSize + gap)}" y="16" fill="var(--line-num)" font-size="10">${m.name}</text>`;
        });
        days.forEach((day, i) => {
            if (!day) return;
            svg += `<text x="0" y="${offsetY + i * (cellSize + gap) + cellSize - 2}" fill="var(--line-num)" font-size="10">${day}</text>`;
        });
        weeks.forEach((week, wi) => {
            week.forEach((day, di) => {
                const x = offsetX + wi * (cellSize + gap);
                const y = offsetY + di * (cellSize + gap);
                svg += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" rx="2" fill="${getColor(day.count)}"><title>${day.date}: ${day.count} contribution${day.count !== 1 ? 's' : ''}</title></rect>`;
            });
        });
        svg += '</svg>';
        container.innerHTML = `
      <div style="margin-bottom:16px"><span style="color:var(--text); font-size:14px">${totalContributions.toLocaleString()} contributions in the last year</span></div>
      <div style="overflow-x:auto; padding-bottom:8px">${svg}</div>
      <div style="display:flex; align-items:center; gap:6px; margin-top:12px; font-size:11px; color:var(--line-num)">
        <span>Less</span>
        <span style="width:12px;height:12px;background:var(--contrib-0);display:inline-block;border-radius:2px"></span>
        <span style="width:12px;height:12px;background:var(--contrib-1);display:inline-block;border-radius:2px"></span>
        <span style="width:12px;height:12px;background:var(--contrib-2);display:inline-block;border-radius:2px"></span>
        <span style="width:12px;height:12px;background:var(--contrib-3);display:inline-block;border-radius:2px"></span>
        <span style="width:12px;height:12px;background:var(--contrib-4);display:inline-block;border-radius:2px"></span>
        <span>More</span>
      </div>`;
    } catch (e) {
        container.innerHTML = `<span class="line" style="color:var(--red)">// Error loading contributions</span>`;
    }
}

loadContributions();

/* ════════════════════════════════════════════════
   LOADING SCREEN — only on the first visit of a session
   ════════════════════════════════════════════════ */
const loadingScreen = document.getElementById('loading-screen');

if (loadingScreen && sessionStorage.getItem('booted')) {
    loadingScreen.remove();
} else if (loadingScreen) {
    sessionStorage.setItem('booted', '1');
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
        setTimeout(runLoadingStep, stepIndex === loadingSteps.length ? 300 : 150);
    }
    setTimeout(runLoadingStep, 100);
}

/* ════════════════════════════════════════════════
   PRESENCE + EVENT TRACKING (Supabase, consent-gated)
   ════════════════════════════════════════════════ */
const SUPABASE_URL = 'https://kjnccezuxqfwqgwxkjzp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqbmNjZXp1eHFmd3Fnd3hranpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExMTU1MjgsImV4cCI6MjA5NjY5MTUyOH0.8fvlOTNhwqw2CHQ7hLSu33I-C6HBK-57GFtZfqxLPzE';
const visitorId = Math.random().toString(36).slice(2);
let presenceTimer = null;

async function trackEvent(event, data = {}) {
    if (!analyticsAllowed()) return;
    try {
        await fetch(`${SUPABASE_URL}/rest/v1/analytics`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ event, data })
        });
    } catch (e) {}
}

async function updatePresence() {
    if (!analyticsAllowed()) return;
    try {
        await fetch(`${SUPABASE_URL}/rest/v1/presence`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'resolution=merge-duplicates'
            },
            body: JSON.stringify({ id: visitorId, last_seen: new Date().toISOString() })
        });
        const since = new Date(Date.now() - 30000).toISOString();
        const res = await fetch(`${SUPABASE_URL}/rest/v1/presence?last_seen=gte.${since}&select=id`, {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
        });
        const data = await res.json();
        const count = Array.isArray(data) ? data.length : 1;
        let onlineEl = document.getElementById('online-count');
        if (!onlineEl) {
            onlineEl = document.createElement('span');
            onlineEl.id = 'online-count';
            const statusbar = document.querySelector('.statusbar');
            if (statusbar) statusbar.insertBefore(onlineEl, statusbar.querySelector('.statusbar-right'));
        }
        onlineEl.innerHTML = `<span style="color:#28C840">●</span> ${count} online`;
    } catch (e) {}
}

// sendBeacon can only POST, so use fetch + keepalive for a real DELETE.
window.addEventListener('pagehide', () => {
    if (!analyticsAllowed()) return;
    fetch(`${SUPABASE_URL}/rest/v1/presence?id=eq.${visitorId}`, {
        method: 'DELETE',
        keepalive: true,
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
    }).catch(() => {});
});

/* ════════════════════════════════════════════════
   3D PROFILE CARD
   ════════════════════════════════════════════════ */
const profileCard = document.querySelector('.profile-card');
profileCard?.addEventListener('mousemove', (e) => {
    const rect = profileCard.getBoundingClientRect();
    const rotateX = (((e.clientY - rect.top) / rect.height) - 0.5) * -24;
    const rotateY = (((e.clientX - rect.left) / rect.width) - 0.5) * 24;
    profileCard.style.transform = `perspective(400px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.04)`;
});
profileCard?.addEventListener('mouseleave', () => {
    profileCard.style.transform = 'perspective(400px) rotateX(0deg) rotateY(0deg) scale(1)';
});

/* ════════════════════════════════════════════════
   TAB FAVICON / TITLE ON BLUR
   ════════════════════════════════════════════════ */
const favicon = document.querySelector("link[rel='icon']");
if (favicon) {
    const originalFavicon = favicon.href;
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            favicon.href = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>💤</text></svg>";
            document.title = "Come back!";
        } else {
            favicon.href = originalFavicon;
            document.title = "George Paraschos — Software Engineer";
        }
    });
}

/* ════════════════════════════════════════════════
   SERVICE WORKER
   ════════════════════════════════════════════════ */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
    });
}

/* ════════════════════════════════════════════════
   AMBIENT MODE
   ════════════════════════════════════════════════ */
const ambientOverlay = document.getElementById('ambient-overlay');
const ambientCanvas = document.getElementById('ambient-canvas');
if (ambientOverlay && ambientCanvas) {
    const ambientCtx = ambientCanvas.getContext('2d');
    const codeSnippets = [
        'const x = 42;', 'import java.util.*;', 'git push origin main',
        'SELECT * FROM', 'System.out.println', '{ } => {}',
        'npm install', 'ssh george@paraschos.site', '#!/bin/bash',
        'docker run', 'while(true)', 'try { } catch',
        'O(log n)', 'public static void', 'git commit -m',
        '127.0.0.1', 'HTTP/2 200', 'async/await',
        'RSA encrypt', 'vector clock', 'mutex.lock()',
    ];
    let ambientParticles = [], ambientActive = false, idleTimer = null, animFrame = null;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function resizeAmbientCanvas() {
        ambientCanvas.width = window.innerWidth;
        ambientCanvas.height = window.innerHeight;
    }

    function spawnParticle() {
        const colors = ['#4EC9B0', '#569CD6', '#CE9178', '#6A9955', '#DCDCAA', '#C586C0'];
        ambientParticles.push({
            text: codeSnippets[Math.floor(Math.random() * codeSnippets.length)],
            x: Math.random() * window.innerWidth,
            y: window.innerHeight + 20,
            speed: 0.3 + Math.random() * 0.8,
            opacity: 0.1 + Math.random() * 0.4,
            size: 10 + Math.random() * 6,
            color: colors[Math.floor(Math.random() * colors.length)],
            drift: (Math.random() - 0.5) * 0.3,
        });
    }

    function drawAmbient() {
        ambientCtx.clearRect(0, 0, ambientCanvas.width, ambientCanvas.height);
        if (Math.random() < 0.05) spawnParticle();
        ambientParticles = ambientParticles.filter(p => p.y > -20);
        ambientParticles.forEach(p => {
            p.y -= p.speed; p.x += p.drift;
            ambientCtx.save();
            ambientCtx.globalAlpha = p.opacity;
            ambientCtx.fillStyle = p.color;
            ambientCtx.font = `${p.size}px 'JetBrains Mono', monospace`;
            ambientCtx.fillText(p.text, p.x, p.y);
            ambientCtx.restore();
        });
        if (ambientActive) animFrame = requestAnimationFrame(drawAmbient);
    }

    function enterAmbient() {
        if (ambientActive || reducedMotion) return;
        ambientActive = true;
        ambientParticles = [];
        resizeAmbientCanvas();
        ambientOverlay.classList.add('active');
        drawAmbient();
    }

    function exitAmbient() {
        if (!ambientActive) return;
        ambientActive = false;
        cancelAnimationFrame(animFrame);
        ambientOverlay.classList.remove('active');
        resetIdleTimer();
    }

    function resetIdleTimer() {
        clearTimeout(idleTimer);
        idleTimer = setTimeout(enterAmbient, 60000);
    }

    ambientOverlay.addEventListener('click', exitAmbient);
    ambientOverlay.addEventListener('mousemove', exitAmbient);
    document.addEventListener('keydown', (e) => {
        if (ambientActive) { exitAmbient(); return; }
        if (e.target.tagName !== 'INPUT') resetIdleTimer();
    });
    document.addEventListener('mousemove', () => {
        if (!ambientActive) resetIdleTimer();
    });
    window.addEventListener('resize', resizeAmbientCanvas);
    resizeAmbientCanvas();
    resetIdleTimer();
}

/* ════════════════════════════════════════════════
   ONLINE / OFFLINE BANNER
   ════════════════════════════════════════════════ */
const offlineBanner = document.getElementById('offline-banner');
if (offlineBanner) {
    window.addEventListener('offline', () => offlineBanner.style.display = 'block');
    window.addEventListener('online', () => offlineBanner.style.display = 'none');
    if (!navigator.onLine) offlineBanner.style.display = 'block';
}

/* ════════════════════════════════════════════════
   FOCUS MODE
   ════════════════════════════════════════════════ */
let focusMode = false;
document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key !== 'f' && e.key !== 'F') return;
    focusMode = !focusMode;
    document.body.classList.toggle('focus-mode', focusMode);
    const hint = document.createElement('div');
    hint.textContent = focusMode ? '// Focus mode ON — press F to exit' : '// Focus mode OFF';
    hint.style.cssText = `position:fixed;bottom:2rem;right:2rem;background:var(--tab-bg);border:1px solid var(--border);color:var(--line-num);font-family:'JetBrains Mono',monospace;font-size:11px;padding:0.5rem 1rem;border-radius:4px;z-index:9999;opacity:1;transition:opacity 0.5s;`;
    document.body.appendChild(hint);
    setTimeout(() => hint.style.opacity = '0', 1500);
    setTimeout(() => hint.remove(), 2000);
});

/* ════════════════════════════════════════════════
   RETURNING VISITOR — local only, no fingerprinting
   ════════════════════════════════════════════════ */
function checkReturningVisitor() {
    const visits = parseInt(localStorage.getItem('visit_count') || '0') + 1;
    const lastVisitRaw = localStorage.getItem('last_visit'); // read BEFORE writing
    localStorage.setItem('visit_count', String(visits));
    localStorage.setItem('last_visit', new Date().toISOString());

    if (visits > 1 && lastVisitRaw) {
        const days = Math.floor((Date.now() - new Date(lastVisitRaw)) / 86400000);
        setTimeout(() => {
            const notif = document.createElement('div');
            notif.innerHTML = `<span style="color:var(--accent)">// Welcome back!</span><br><span style="color:var(--line-num)">// Visit #${visits} · ${days === 0 ? 'today' : days === 1 ? 'yesterday' : days + ' days ago'}</span>`;
            notif.style.cssText = `position:fixed;bottom:2rem;right:2rem;background:var(--sidebar-bg);border:1px solid var(--border);border-left:2px solid var(--accent);font-family:'JetBrains Mono',monospace;font-size:11px;padding:0.8rem 1.2rem;border-radius:4px;z-index:9999;opacity:0;transition:opacity 0.3s;line-height:1.8;`;
            document.body.appendChild(notif);
            setTimeout(() => notif.style.opacity = '1', 100);
            setTimeout(() => notif.style.opacity = '0', 4000);
            setTimeout(() => notif.remove(), 4300);
        }, 2000);
    }
}

checkReturningVisitor();

/* ════════════════════════════════════════════════
   CONSENT INIT — runs last, after all declarations
   ════════════════════════════════════════════════ */
const consentBanner = document.getElementById('consent-banner');
if (consentBanner) {
    const choice = getConsent();
    if (choice === 'granted') {
        startAnalytics();
    } else if (choice === null) {
        consentBanner.style.display = 'block';
        document.getElementById('consent-accept')?.addEventListener('click', () => {
            localStorage.setItem(CONSENT_KEY, 'granted');
            consentBanner.style.display = 'none';
            startAnalytics();
        });
        document.getElementById('consent-decline')?.addEventListener('click', () => {
            localStorage.setItem(CONSENT_KEY, 'denied');
            consentBanner.style.display = 'none';
        });
    }
    // 'denied' → banner stays hidden, nothing loads.
}

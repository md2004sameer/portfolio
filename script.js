'use strict';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const svg = name => `<svg aria-hidden="true"><use href="#i-${esc(name)}"></use></svg>`;
const placeholder = value => !value || /^\[.*\]$/.test(String(value).trim()) || String(value).trim() === 'Backend only';
const validUrl = value => {
  if (placeholder(value)) return '';
  try { const url = new URL(value, location.href); return ['http:', 'https:'].includes(url.protocol) ? url.href : ''; } catch (_) { return ''; }
};
const profile = PORTFOLIO.profile;
const apps = {
  resume: ['Resume', 'resume', 820, 620, resumeApp], projects: ['Projects', 'folder', 820, 560, projectsApp],
  about: ['System Properties', 'user', 700, 500, aboutApp], skills: ['Control Panel · Skills', 'skills', 760, 560, skillsApp],
  experience: ['Experience', 'experience', 720, 540, experienceApp], education: ['Education', 'education', 720, 500, educationApp],
  contact: ['Windows Live Mail · Contact', 'contact', 760, 560, contactApp], notepad: ['Notepad', 'notepad', 560, 440, notepadApp],
  calculator: ['Calculator', 'calc', 300, 430, calculatorApp], browser: ['Internet Explorer', 'browser', 760, 540, browserApp],
  recycle: ['Recycle Bin', 'bin', 650, 440, recycleApp], personalize: ['Personalization', 'skills', 580, 390, personalizeApp]
};
const appOrder = Object.keys(apps).filter(key => key !== 'personalize');
const pinned = ['resume', 'projects', 'about', 'skills', 'contact'];
let wins = [], current = null, z = 20, phase = 'boot', timer, allPrograms = false, showDesk = false;
let items = [
  ['resume', 'Resume', 'resume', 'resume'], ['projects', 'Projects', 'folder', 'projects'], ['about', 'About Me', 'user', 'about'],
  ['skills', 'Skills', 'skills', 'skills'], ['experience', 'Experience', 'experience', 'experience'], ['education', 'Education', 'education', 'education'],
  ['contact', 'Contact', 'contact', 'contact'], ['github', 'GitHub', 'github', 'url', false, profile.links.github], ['linkedin', 'LinkedIn', 'linkedin', 'url', false, profile.links.linkedin],
  ['leetcode', 'LeetCode', 'leetcode', 'url', false, profile.links.leetcode],
  ['recycle', 'Recycle Bin', 'bin', 'recycle', true]
].map(([id, name, icon, app, system, url]) => ({ id, name, icon, app, system: Boolean(system), url }));
let bin = [
  { id: 'bugs', name: 'Bugs.txt', icon: 'notepad', text: 'Every build has a few bugs. Find them, learn from them, and ship a better version.' },
  { id: 'oldresume', name: 'Old_Resume_v1.docx', icon: 'resume', text: 'Archived draft. The current resume is Sameer_Resume.pdf.' }
];

function configFor(key, options) {
  if (key === 'project') {
    const project = PORTFOLIO.projects.find(item => item.slug === options.slug);
    return project && { key: `project:${project.slug}`, title: project.name, icon: 'folder', width: 680, height: 560, render: body => projectApp(body, project) };
  }
  const app = apps[key];
  return app && { key, title: app[0], icon: app[1], width: app[2], height: app[3], render: app[4] };
}
function launch(key, options = {}) {
  const config = configFor(key, options);
  if (!config) return;
  const open = wins.find(win => win.key === config.key);
  if (open) return focus(open);
  const el = $('#windowTemplate').content.firstElementChild.cloneNode(true), mobile = matchMedia('(max-width: 767px)').matches;
  const width = Math.min(config.width, innerWidth - 16), height = Math.min(config.height, innerHeight - 54), n = wins.length % 7 * 24;
  const win = { key: config.key, el, min: false, rect: null };
  Object.assign(el.style, { width: `${width}px`, height: `${height}px`, left: `${Math.max(4, Math.min(45 + n, innerWidth - width - 4))}px`, top: `${Math.max(4, Math.min(28 + n, innerHeight - height - 48))}px`, zIndex: ++z });
  if (mobile) el.classList.add('maximized');
  el.setAttribute('aria-label', config.title);
  $('.window-title', el).textContent = config.title;
  $('.window-icon use', el).setAttribute('href', `#i-${config.icon}`);
  win.task = document.createElement('button'); win.task.type = 'button'; win.task.className = 'task-button'; win.task.title = config.title;
  win.task.setAttribute('aria-label', config.title); win.task.innerHTML = `${svg(config.icon)}<span>${esc(config.title)}</span>`;
  win.task.onclick = () => win.min || current !== win ? focus(win) : minimize(win);
  $('#tasks').append(win.task); $('#windows').append(el); wins.push(win);
  $('.minimize', el).onclick = () => minimize(win);
  $('.maximize', el).onclick = () => maximize(win);
  $('.close', el).onclick = () => closeWindow(win);
  el.addEventListener('pointerdown', () => focus(win));
  $('.titlebar', el).ondblclick = e => { if (!e.target.closest('.window-controls')) maximize(win); };
  $('.titlebar', el).onpointerdown = e => drag(e, win);
  config.render($('.window-body', el), win, options);
  bindProfilePhotos(el);
  focus(win);
}
function focus(win) {
  if (!win) return;
  if (win.min) { win.min = false; win.el.hidden = false; win.el.classList.remove('minimized'); }
  wins.forEach(item => { item.el.classList.toggle('active', item === win); item.task.classList.toggle('active', item === win); });
  win.el.style.zIndex = ++z; current = win;
}
function minimize(win) {
  if (win.min) return;
  const a = win.task.getBoundingClientRect(), b = win.el.getBoundingClientRect();
  win.el.style.transformOrigin = `${a.left + a.width / 2 - b.left}px ${a.top - b.top}px`;
  win.min = true; win.el.classList.add('minimized'); win.task.classList.remove('active'); if (current === win) current = null;
  setTimeout(() => { if (win.min) win.el.hidden = true; }, 190);
}
function maximize(win) {
  if (win.el.classList.contains('maximized')) {
    win.el.classList.remove('maximized'); if (win.rect) Object.assign(win.el.style, win.rect);
  } else {
    const r = win.el.getBoundingClientRect(); win.rect = { width: `${r.width}px`, height: `${r.height}px`, left: `${r.left}px`, top: `${r.top}px` };
    win.el.classList.add('maximized');
  }
  focus(win);
}
function closeWindow(win) {
  wins = wins.filter(item => item !== win); win.task.remove(); win.el.classList.add('closing'); if (current === win) current = null;
  setTimeout(() => win.el.remove(), 150); renderIcons();
}
function drag(event, win) {
  if (event.button || event.target.closest('.window-controls') || win.el.classList.contains('maximized') || matchMedia('(max-width: 767px)').matches) return;
  const x = event.clientX, y = event.clientY, left = win.el.offsetLeft, top = win.el.offsetTop; let edge = false;
  const move = e => { win.el.style.left = `${Math.max(0, Math.min(innerWidth - win.el.offsetWidth, left + e.clientX - x))}px`; win.el.style.top = `${Math.max(0, Math.min(innerHeight - 48, top + e.clientY - y))}px`; edge = e.clientY < 5; };
  const up = () => { removeEventListener('pointermove', move); removeEventListener('pointerup', up); if (edge) maximize(win); };
  addEventListener('pointermove', move); addEventListener('pointerup', up, { once: true });
}
function setTitle(win, title) { $('.window-title', win.el).textContent = title; win.el.setAttribute('aria-label', title); win.task.title = title; $('span', win.task).textContent = title; }
function link(label, value, cls = 'action-button') {
  const url = validUrl(value);
  return url ? `<a class="${cls}" href="${esc(url)}" target="_blank" rel="noopener">${esc(label)}</a>` : `<button class="${cls}" type="button" disabled title="Coming soon">${esc(label)}</button>`;
}
function resumeMarkup() {
  return `<article class="resume-sheet"><header class="resume-header"><div><h1>${esc(profile.name)}</h1></div><div class="resume-contact"><a href="mailto:${esc(profile.email)}">${esc(profile.email)}</a><a href="tel:${esc(profile.phone.replace(/[^+\d]/g, ''))}">${esc(profile.phone)}</a><a href="${esc(profile.links.linkedin)}">linkedin.com/in/sameerog</a><a href="${esc(profile.links.github)}">github.com/md2004sameer</a><a href="${esc(profile.links.leetcode)}">leetcode.com/u/sameerog</a></div></header><section><h2>Summary</h2><p>${esc(profile.bio)}</p></section><section><h2>Education</h2>${PORTFOLIO.education.map(e => `<p><strong>${esc(e.institution)}${e.location ? `, ${esc(e.location)}` : ''}</strong> <span>${esc(e.dates)}</span><br>${esc(e.degree)}</p>`).join('')}</section>${PORTFOLIO.experience.length ? `<section><h2>Experience</h2>${PORTFOLIO.experience.map(e => `<p><strong>${esc(e.role)} · ${esc(e.company)}</strong> · ${esc(e.dates)}</p><ul>${e.bullets.map(b => `<li>${esc(b)}</li>`).join('')}</ul></section>`).join('')}` : ''}<section><h2>Projects</h2>${PORTFOLIO.projects.map(p => `<section><h3>${esc(p.name)}</h3><p>${link('GitHub', p.github, 'text-link')} ${link('Live project', p.live, 'text-link')}</p><ul>${p.description.map(line => `<li>${esc(line)}</li>`).join('')}</ul></section>`).join('')}</section><section><h2>Technical Skills</h2>${PORTFOLIO.skills.map(g => `<p><strong>${esc(g.category)}:</strong> ${g.items.map(esc).join(', ')}</p>`).join('')}</section><section><h2>Achievements</h2><ul>${PORTFOLIO.achievements.map(item => `<li>${esc(item)}</li>`).join('')}</ul></section></article>`;
}
function resumeApp(body) {
  body.innerHTML = `<div class="toolbar"><a class="tool-button" href="${esc(profile.resume)}" download>Download PDF</a><button class="tool-button print" type="button">Print</button><a class="tool-button" href="${esc(profile.resume)}" target="_blank" rel="noopener">Open in new tab</a><span class="toolbar-spacer"></span><button class="tool-button zoomout" type="button" aria-label="Zoom out">−</button><button class="tool-button zoomin" type="button" aria-label="Zoom in">+</button></div><div class="resume-scroll"><div class="resume-content">${resumeMarkup()}</div></div><div class="resume-footer">HTML resume preview works without the PDF. <a href="${esc(profile.resume)}" download>Download resume</a></div>`;
  let zoom = 1; const content = $('.resume-content', body);
  $('.zoomin', body).onclick = () => { zoom = Math.min(1.35, zoom + .1); content.style.fontSize = `${zoom}em`; };
  $('.zoomout', body).onclick = () => { zoom = Math.max(.7, zoom - .1); content.style.fontSize = `${zoom}em`; };
  $('.print', body).onclick = () => { const win = body.closest('.win'); win.classList.add('print-target'); print(); setTimeout(() => win.classList.remove('print-target'), 400); };
}
function readme(project) { return `${project.name}\n${'='.repeat(project.name.length)}\n\n${project.tagline}\n\n${project.description.map(line => `- ${line}`).join('\n')}\n\nTech stack: ${project.stack.join(', ')}\nStatus: ${project.status}\n`; }
function projectsApp(body) {
  let path = ['Computer', 'Projects'], back = [], forward = [], details = true;
  body.innerHTML = `<div class="explorer-toolbar"><button class="back" type="button" aria-label="Back">◀</button><button class="forward" type="button" aria-label="Forward">▶</button><div class="address"></div><span class="view-switch"><button class="details" type="button">Details</button><button class="large" type="button">Large icons</button></span></div><div class="explorer-layout"><aside class="navigation-pane"><strong>Favorites</strong><button data-nav="Projects">Projects</button><button data-nav="Computer">Computer</button></aside><div class="explorer-files"></div></div><footer class="explorer-status"></footer>`;
  const files = $('.explorer-files', body);
  const render = () => {
    $('.address', body).innerHTML = path.map((part, i) => `<button data-crumb="${i}" type="button">${esc(part)}</button>`).join('<b>›</b>');
    $('.back', body).disabled = !back.length; $('.forward', body).disabled = !forward.length; files.classList.toggle('large-view', !details);
    if (path.at(-1) === 'Projects') {
      files.innerHTML = PORTFOLIO.projects.map(p => `<button class="file-item" type="button" data-slug="${esc(p.slug)}">${svg('folder')}<span><strong>${esc(p.name)}</strong><small>${esc(p.status)}</small></span><span class="file-tagline">${esc(p.tagline)}</span></button>`).join('');
      $('.explorer-status', body).textContent = `${PORTFOLIO.projects.length} project folders`;
    } else {
      files.innerHTML = `<button class="file-item" data-open-projects type="button">${svg('folder')}<strong>Projects</strong></button>`;
      $('.explorer-status', body).textContent = '1 folder';
    }
  };
  const go = next => { back.push(path); path = next; forward = []; render(); };
  body.onclick = event => {
    const folder = event.target.closest('[data-slug]');
    if (folder) { $$('.file-item.selected', files).forEach(item => item.classList.remove('selected')); folder.classList.add('selected'); return; }
    if (event.target.closest('[data-open-projects]')) { go(['Computer', 'Projects']); return; }
    const nav = event.target.closest('[data-nav]'); if (nav) { go(nav.dataset.nav === 'Computer' ? ['Computer'] : ['Computer', 'Projects']); return; }
    const crumb = event.target.closest('[data-crumb]'); if (crumb) go(path.slice(0, Number(crumb.dataset.crumb) + 1));
  };
  $('.back', body).onclick = () => { if (back.length) { forward.push(path); path = back.pop(); render(); } };
  $('.forward', body).onclick = () => { if (forward.length) { back.push(path); path = forward.pop(); render(); } };
  $('.details', body).onclick = () => { details = true; render(); };
  $('.large', body).onclick = () => { details = false; render(); };
  files.ondblclick = event => { const folder = event.target.closest('[data-slug]'); if (folder) launch('project', { slug: folder.dataset.slug }); };
  render();
}
function projectApp(body, project) {
  body.innerHTML = `<article class="project-detail"><header class="project-heading"><p class="eyebrow">PROJECT FILE</p><h1>${esc(project.name)}</h1><span class="status-badge">${esc(project.status)}</span><p class="project-tagline">${esc(project.tagline)}</p></header><section><h2>Overview</h2><ul class="project-points">${project.description.map(line => `<li>${esc(line)}</li>`).join('')}</ul></section><section><h2>Technology</h2><div class="tag-list">${project.stack.map(tag => `<span>${esc(tag)}</span>`).join('')}</div></section><section class="project-actions">${link('Open Live Project', project.live)}${link('View on GitHub', project.github)}</section><div class="project-readme-file">${svg('notepad')}<span><strong>README.txt</strong><small>Text document</small></span><button class="readme-open" type="button">Open</button></div></article>`;
  $('.readme-open', body).onclick = () => launch('notepad', { title: `${project.name} · README.txt`, text: readme(project) });
}
function aboutApp(body) {
  const url = PORTFOLIO.experience[0]?.url;
  body.innerHTML = `<article class="system-properties"><header class="system-header"><span class="photo-placeholder avatar-wrap"><img data-profile-photo alt=""><span class="photo-fallback">S</span></span><div><p class="eyebrow">SYSTEM</p><h1>${esc(profile.name)}</h1><p>${esc(profile.role)}</p><span class="status-badge">${profile.openToRoles ? 'Open to SDE roles' : 'Building'}</span></div></header><section><h2>About</h2><p>${esc(profile.bio)}</p><dl class="property-list"><dt>Location</dt><dd>${esc(profile.location)}</dd><dt>Focus</dt><dd>Backend engineering · Java · Distributed systems</dd><dt>Product</dt><dd>${link('orbitbot.in', url, 'text-link')}</dd></dl><a class="action-button" href="${esc(profile.resume)}" download>Download Resume</a></section></article>`;
}
function skillsApp(body) {
  body.innerHTML = `<article class="control-panel"><p class="eyebrow">CONTROL PANEL</p><h1>Technical Skills</h1><div class="skill-groups">${PORTFOLIO.skills.map(group => `<section class="skill-group"><h2>${esc(group.category)}</h2><div class="tag-list">${group.items.map(item => `<span>${esc(item)}</span>`).join('')}</div></section>`).join('')}</div></article>`;
}
function timeline(body, entries, roleKey, titleKey) {
  body.innerHTML = `<article class="timeline-page"><p class="eyebrow">PORTFOLIO</p><h1>${esc(titleKey)}</h1>${entries.length ? `<div class="timeline">${entries.map(item => `<section class="timeline-entry"><div class="timeline-marker"></div><p class="eyebrow">${esc(item.dates)}</p><h2>${esc(item[roleKey])}</h2><h3>${esc(item[titleKey === 'Experience' ? 'company' : 'institution'])}</h3><p>${esc(item.location || '')}</p><ul>${item.bullets.map(line => `<li>${esc(line)}</li>`).join('')}</ul>${item.url ? link('Visit orbitBot', item.url, 'text-link') : ''}</section>`).join('')}</div>` : '<p>No experience details are listed on the latest resume.</p>'}</article>`;
}
function experienceApp(body) { timeline(body, PORTFOLIO.experience, 'role', 'Experience'); }
function educationApp(body) { timeline(body, PORTFOLIO.education, 'degree', 'Education'); }
function contactApp(body) {
  const email = placeholder(profile.email) ? '' : `mailto:${profile.email}`, phone = placeholder(profile.phone) ? '' : `tel:${profile.phone.replace(/[^+\d]/g, '')}`;
  body.innerHTML = `<div class="mail-layout"><aside class="mail-sidebar"><strong class="mail-brand">Windows Live Mail</strong><p>Contact Sameer</p><a ${email ? `href="${esc(email)}"` : 'aria-disabled="true"'}>${esc(profile.email)}</a><a ${phone ? `href="${esc(phone)}"` : 'aria-disabled="true"'}>${esc(profile.phone)}</a>${link('GitHub', profile.links.github, 'text-link')}${link('LinkedIn', profile.links.linkedin, 'text-link')}${link('LeetCode', profile.links.leetcode, 'text-link')}</aside><form class="compose-form"><h1>New message</h1><label>To<input name="to" value="${esc(profile.email)}" required></label><label>Subject<input name="subject" value="SDE opportunity" required></label><label>Message<textarea name="body" rows="7" placeholder="Hello Sameer,"></textarea></label><button class="action-button">Send message</button><small>Your email app opens to send this message.</small></form></div>`;
  $('.compose-form', body).onsubmit = event => { event.preventDefault(); const form = new FormData(event.currentTarget); location.href = `mailto:${encodeURIComponent(form.get('to'))}?subject=${encodeURIComponent(form.get('subject'))}&body=${encodeURIComponent(form.get('body'))}`; };
}
function notepadApp(body, win, options = {}) {
  const title = options.title || 'Notepad'; setTitle(win, title);
  body.innerHTML = `<div class="notepad-toolbar"><button class="save-note" type="button">Save as…</button><span>${esc(title)}</span></div><textarea class="notepad-editor" aria-label="Notepad text" spellcheck="false"></textarea>`;
  $('.notepad-editor', body).value = options.text || '';
  $('.save-note', body).onclick = () => { const url = URL.createObjectURL(new Blob([$('.notepad-editor', body).value], { type: 'text/plain;charset=utf-8' })); const a = document.createElement('a'); a.href = url; a.download = title.replace(/[^\w.-]+/g, '_'); a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); };
}
function calculatorApp(body) {
  const keys = ['C', '(', ')', '÷', '7', '8', '9', '×', '4', '5', '6', '−', '1', '2', '3', '+', '0', '.', '⌫', '='];
  body.innerHTML = `<input class="calc-display" aria-label="Calculator display" value="0" readonly><div class="calc-keys">${keys.map(key => `<button type="button" data-key="${esc(key)}">${esc(key)}</button>`).join('')}</div>`;
  let expression = ''; const display = $('.calc-display', body);
  $('.calc-keys', body).onclick = event => { const key = event.target.closest('[data-key]')?.dataset.key; if (!key) return;
    if (key === 'C') expression = ''; else if (key === '⌫') expression = expression.slice(0, -1);
    else if (key === '=') { const normalized = expression.replace(/[×]/g, '*').replace(/[÷]/g, '/').replace(/[−]/g, '-'); try { if (/^[\d+*/(). -]+$/.test(normalized) && normalized.trim()) expression = String(Number(Function(`"use strict";return (${normalized})`)()).toFixed(8)); } catch (_) { expression = 'Error'; } }
    else expression = (expression === 'Error' ? '' : expression) + key;
    display.value = expression || '0';
  };
}
function browserApp(body) {
  body.innerHTML = `<div class="browser-toolbar"><input class="browser-address" aria-label="Web address" value="https://example.com"><button class="browser-go" type="button">Go</button></div><article class="browser-page"><p class="eyebrow">INTERNET EXPLORER</p><h1>Welcome to the web</h1><p>This is an offline preview. Real websites open in a new tab.</p></article>`;
  const go = () => { let value = $('.browser-address', body).value.trim(); if (!/^https?:\/\//i.test(value)) value = `https://${value}`; const url = validUrl(value); if (url) window.open(url, '_blank', 'noopener'); };
  $('.browser-go', body).onclick = go; $('.browser-address', body).onkeydown = e => { if (e.key === 'Enter') go(); };
}
function recycleApp(body) {
  const render = () => { body.innerHTML = `<div class="recycle-toolbar"><button class="restore-all" type="button" ${bin.length ? '' : 'disabled'}>Restore all items</button><button class="empty-bin" type="button" ${bin.length ? '' : 'disabled'}>Empty Recycle Bin</button></div><div class="recycle-list">${bin.length ? bin.map(item => `<div class="recycle-row">${svg(item.icon)}<span>${esc(item.name)}</span><button type="button" data-restore="${esc(item.id)}">Restore</button></div>`).join('') : '<p class="empty-folder">The Recycle Bin is empty.</p>'}</div>`; };
  body.onclick = event => { const id = event.target.closest('[data-restore]')?.dataset.restore; if (id) restore(id); if (event.target.closest('.restore-all')) [...bin].forEach(item => restore(item.id)); if (event.target.closest('.empty-bin')) confirmBox('Permanently delete every item in the Recycle Bin?', () => { bin = []; render(); renderIcons(); }); };
  render();
}
function restore(id) { const index = bin.findIndex(item => item.id === id); if (index < 0) return; const item = bin.splice(index, 1)[0]; items.push({ ...item, id: `restored-${Date.now()}-${Math.random()}`, app: 'notepad' }); renderIcons(); wins.filter(win => win.key === 'recycle').forEach(win => recycleApp($('.window-body', win.el))); }
function personalizeApp(body) {
  const colors = [['Aero Blue', '#061c46', '#0d4c99', '#53a8e8'], ['Evergreen', '#092b2c', '#12615e', '#58b995'], ['Ruby', '#360c26', '#8d2948', '#e47779'], ['Silver', '#252e39', '#637587', '#a9c5d7']];
  body.innerHTML = `<article class="personalize"><p class="eyebrow">PERSONALIZATION</p><h1>Choose a desktop color</h1><div class="palette-grid">${colors.map((c, i) => `<button class="palette-swatch" data-color="${i}" style="--swatch-top:${c[1]};--swatch-mid:${c[2]};--swatch-light:${c[3]}"><span></span><b>${esc(c[0])}</b></button>`).join('')}</div></article>`;
  body.onclick = event => { const c = colors[Number(event.target.closest('[data-color]')?.dataset.color)]; if (!c) return; ['--wall-top', '--wall-mid', '--wall-light'].forEach((key, i) => document.documentElement.style.setProperty(key, c[i + 1])); };
}
function renderIcons() { $('#icons').innerHTML = items.map(item => `<div class="desktop-icon" role="button" tabindex="0" data-id="${esc(item.id)}" aria-label="${esc(item.name)}" title="${esc(item.name)}">${svg(item.app === 'recycle' && bin.length ? 'binfull' : item.icon)}<span>${esc(item.name)}</span></div>`).join(''); }
function bindProfilePhotos(root) {
  $$('[data-profile-photo]', root).forEach(image => {
    image.src = profile.photo;
    image.alt = profile.name;
    image.onerror = () => { image.hidden = true; };
  });
}
function openItem(item) { if (!item) return; if (item.url) { const url = validUrl(item.url); if (url) window.open(url, '_blank', 'noopener'); } else if (item.app === 'notepad') launch('notepad', { title: item.name, text: item.text }); else launch(item.app); }
function deleteSelected() { $$('.desktop-icon.selected').forEach(el => { const i = items.findIndex(item => String(item.id) === el.dataset.id); if (i >= 0 && !items[i].system) bin.push(...items.splice(i, 1)); }); renderIcons(); }
function confirmBox(message, action) {
  const overlay = document.createElement('div'); overlay.className = 'confirm-overlay'; overlay.innerHTML = `<section role="alertdialog" aria-modal="true" class="confirm-window"><h2>Confirm</h2><p>${esc(message)}</p><div><button data-yes type="button">Yes</button><button data-no type="button">No</button></div></section>`;
  overlay.onclick = e => { if (e.target.closest('[data-yes]')) { overlay.remove(); action(); } if (e.target.closest('[data-no]')) overlay.remove(); }; document.body.append(overlay); $('[data-no]', overlay).focus();
}
function menu(entries, x, y) {
  const root = document.createElement('div'); root.className = 'context-menu';
  entries.forEach(entry => { if (entry === '-') { root.append(document.createElement('hr')); return; } const row = document.createElement(entry.children ? 'div' : 'button'); row.className = `context-item${entry.children ? ' has-submenu' : ''}`; row.textContent = entry.label; if (entry.children) { const sub = document.createElement('div'); sub.className = 'context-menu'; entry.children.forEach(child => { const button = document.createElement('button'); button.className = 'context-item'; button.textContent = child.label; button.onclick = () => { closeMenus(); child.action(); }; sub.append(button); }); row.append(sub); } else { row.type = 'button'; row.onclick = () => { closeMenus(); entry.action(); }; } root.append(row); });
  closeMenus(); root.style.visibility = 'hidden'; document.body.append(root); root.style.left = `${Math.max(4, Math.min(x, innerWidth - root.offsetWidth - 4))}px`; root.style.top = `${Math.max(4, Math.min(y, innerHeight - root.offsetHeight - 48))}px`; root.style.visibility = '';
}
function closeMenus() { $$('.context-menu').forEach(el => el.remove()); }
function desktopMenu(x, y) { menu([{ label: 'View', children: [{ label: 'Large icons', action: () => $('#icons').classList.remove('small-icons') }, { label: 'Small icons', action: () => $('#icons').classList.add('small-icons') }] }, { label: 'Sort by', children: [{ label: 'Name', action: () => { items.sort((a, b) => a.name.localeCompare(b.name)); renderIcons(); } }] }, { label: 'Refresh', action: renderIcons }, '-', { label: 'Personalize', action: () => launch('personalize') }, { label: 'Open Resume', action: () => launch('resume') }, { label: 'Contact Me', action: () => launch('contact') }], x, y); }
function selectIcon(event) {
  const element = event.target.closest('.desktop-icon');
  if (element) { if (!event.ctrlKey) $$('.desktop-icon.selected').forEach(el => el.classList.remove('selected')); element.classList.add('selected'); if (event.pointerType === 'touch') { const item = items.find(value => String(value.id) === element.dataset.id); if (!item?.url) openItem(item); } return; }
  if (event.button !== 0 || event.target.closest('.win') || event.pointerType === 'touch') return;
  $$('.desktop-icon.selected').forEach(el => el.classList.remove('selected'));
  const area = $('#selection'), x = event.clientX, y = event.clientY; area.hidden = false;
  const move = e => { const left = Math.min(x, e.clientX), top = Math.min(y, e.clientY), width = Math.abs(x - e.clientX), height = Math.abs(y - e.clientY); Object.assign(area.style, { left: `${left}px`, top: `${top}px`, width: `${width}px`, height: `${height}px` }); $$('.desktop-icon').forEach(el => { const r = el.getBoundingClientRect(); el.classList.toggle('selected', r.left < left + width && r.right > left && r.top < top + height && r.bottom > top); }); };
  const up = () => { area.hidden = true; removeEventListener('pointermove', move); removeEventListener('pointerup', up); }; addEventListener('pointermove', move); addEventListener('pointerup', up, { once: true });
}
function renderStart() {
  const q = $('#search').value.trim().toLowerCase(), keys = q || allPrograms ? appOrder.filter(key => `${apps[key][0]} ${key}`.toLowerCase().includes(q)) : pinned;
  const results = keys.map(key => `<li><button data-app="${key}" type="button">${svg(apps[key][1])}<span>${esc(apps[key][0])}</span></button></li>`);
  PORTFOLIO.projects.filter(p => q && `${p.name} ${p.tagline} ${p.stack.join(' ')}`.toLowerCase().includes(q)).forEach(p => results.push(`<li><button data-project="${esc(p.slug)}" type="button">${svg('folder')}<span>${esc(p.name)} <small>Project</small></span></button></li>`));
  $('#plist').innerHTML = results.join('') || '<li class="no-matches">No matches found</li>';
}
function toggleStart() { const start = $('#start'); if (!start.hidden) { start.hidden = true; return; } closeMenus(); $('#calendar').hidden = true; start.hidden = false; $('#search').value = ''; allPrograms = false; renderStart(); $('#search').focus(); }
function updateClock() { const d = new Date(); $('#clock').innerHTML = `<span>${esc(d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }))}</span><small>${esc(d.toLocaleDateString())}</small>`; }
function calendar() { const d = new Date(), first = new Date(d.getFullYear(), d.getMonth(), 1).getDay(), days = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate(); $('#calendar').innerHTML = `<h2>${esc(d.toLocaleString([], { month: 'long', year: 'numeric' }))}</h2><div class="calendar-grid">${['S','M','T','W','T','F','S'].map(x => `<b>${x}</b>`).join('')}${'<i></i>'.repeat(first)}${Array.from({ length: days }, (_, i) => `<span class="${i + 1 === d.getDate() ? 'today' : ''}">${i + 1}</span>`).join('')}</div>`; }
function showDesktop() { if (!showDesk) { wins.filter(w => !w.min).forEach(minimize); showDesk = true; } else { const w = wins.find(item => item.min); if (w) focus(w); showDesk = false; } }
function chime() { try { const C = window.AudioContext || window.webkitAudioContext; if (!C) return; const c = new C(), t = c.currentTime; [523, 659, 784].forEach((f, i) => { const o = c.createOscillator(), g = c.createGain(); o.frequency.value = f; g.gain.setValueAtTime(.001, t + i * .15); g.gain.exponentialRampToValueAtTime(.07, t + i * .15 + .04); g.gain.exponentialRampToValueAtTime(.001, t + i * .15 + .5); o.connect(g).connect(c.destination); o.start(t + i * .15); o.stop(t + i * .15 + .55); }); setTimeout(() => c.close(), 1000); } catch (_) {} }
function firstVisit() { try { return localStorage.getItem('sameer-portfolio-welcomed') !== '1'; } catch (_) { return true; } }
function login() { if (phase !== 'login') return; phase = 'run'; $('#login').hidden = true; chime(); if (firstVisit()) { try { localStorage.setItem('sameer-portfolio-welcomed', '1'); } catch (_) {} launch('resume'); launch('notepad', { title: 'Welcome.txt - Notepad', text: `Welcome to ${profile.name}'s portfolio.\n\nOpen Resume for a quick overview. Browse Projects, or use Start to find skills, education, and contact details.\n\nThanks for stopping by.` }); } }
function showLogin() { if (phase !== 'boot') return; clearTimeout(timer); phase = 'login'; $('#boot').hidden = true; $('#login').hidden = false; $('#loginBtn').focus(); }
function boot() { clearTimeout(timer); phase = 'boot'; $('#powerScreen').hidden = true; $('#login').hidden = true; $('#boot').hidden = false; timer = setTimeout(showLogin, 900); }
function power(action) {
  closeMenus(); $('#start').hidden = true; const screen = $('#powerScreen'); screen.className = '';
  if (action === 'lock' || action === 'logoff') { if (action === 'logoff') [...wins].forEach(closeWindow); phase = 'login'; $('#login').hidden = false; return; }
  if (action === 'sleep') { phase = 'sleep'; screen.className = 'sleep-screen'; screen.textContent = 'Sleeping… click to wake'; screen.hidden = false; return; }
  phase = action; screen.textContent = action === 'restart' ? 'Restarting…' : 'Shutting down…'; screen.hidden = false;
  setTimeout(() => { if (action === 'restart') boot(); else { phase = 'off'; screen.className = 'shutdown-screen'; screen.innerHTML = 'Thanks for visiting.<br><small>Click to power on.</small>'; } }, 850);
}
function init() {
  $('#startName').textContent = profile.name; $('#loginName').textContent = profile.name;
  bindProfilePhotos(document);
  $('#startGithub').href = validUrl(profile.links.github) || '#'; $('#startLinkedin').href = validUrl(profile.links.linkedin) || '#';
  renderIcons(); updateClock(); setInterval(updateClock, 1000); boot();
  $('#icons').addEventListener('pointerdown', selectIcon); $('#desktop').addEventListener('pointerdown', selectIcon);
  $('#icons').onclick = e => { const item = items.find(value => String(value.id) === e.target.closest('.desktop-icon')?.dataset.id); if (e.detail === 1 && item?.url) openItem(item); };
  $('#icons').ondblclick = e => { const item = items.find(value => String(value.id) === e.target.closest('.desktop-icon')?.dataset.id); if (!item?.url) openItem(item); };
  $('#icons').onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openItem(items.find(item => String(item.id) === e.target.closest('.desktop-icon')?.dataset.id)); } };
  $('#desktop').oncontextmenu = e => { if (e.target.closest('.win')) return; e.preventDefault(); const el = e.target.closest('.desktop-icon'); if (!el) return desktopMenu(e.clientX, e.clientY); const item = items.find(value => String(value.id) === el.dataset.id); menu([{ label: 'Open', action: () => openItem(item) }, ...(item.system ? [] : [{ label: 'Delete', action: () => { el.classList.add('selected'); deleteSelected(); } }])], e.clientX, e.clientY); };
  $('#orb').onclick = toggleStart; $('#search').oninput = renderStart;
  $('#all').onclick = () => { allPrograms = !allPrograms; $('#all').textContent = allPrograms ? '◀ Back' : '▶ All Programs'; renderStart(); };
  $('#start').onclick = e => { const app = e.target.closest('[data-app]'), project = e.target.closest('[data-project]'); if (app) { $('#start').hidden = true; launch(app.dataset.app); } if (project) { $('#start').hidden = true; launch('project', { slug: project.dataset.project }); } };
  $('#pins').onclick = e => { const button = e.target.closest('[data-app]'); if (button) launch(button.dataset.app); };
  $('#shut').onclick = () => power('shutdown'); $('#shutArrow').onclick = e => { const r = e.currentTarget.getBoundingClientRect(); menu([{ label: 'Restart', action: () => power('restart') }, { label: 'Log off', action: () => power('logoff') }, { label: 'Lock', action: () => power('lock') }, { label: 'Sleep', action: () => power('sleep') }], r.right, r.top - 140); };
  $('#clock').onclick = () => { const el = $('#calendar'); if (!el.hidden) { el.hidden = true; return; } closeMenus(); $('#start').hidden = true; calendar(); el.hidden = false; };
  $('#peek').onclick = showDesktop; $('#boot').onclick = showLogin; $('#loginBtn').onclick = login;
  $('#powerScreen').onclick = () => { if (phase === 'off') boot(); else if (phase === 'sleep') { $('#powerScreen').hidden = true; phase = 'run'; } };
  document.addEventListener('pointerdown', e => { if (!e.target.closest('#start,#orb,.context-menu,#calendar,#clock')) { $('#start').hidden = true; $('#calendar').hidden = true; closeMenus(); } }, true);
  document.addEventListener('keydown', e => {
    if (phase === 'boot') { showLogin(); return; } if (phase === 'login') { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); login(); } return; }
    if (e.key === 'Meta') return;
    if ((e.metaKey && e.key.toLowerCase() === 'd') || (e.ctrlKey && e.key.toLowerCase() === 'd')) { e.preventDefault(); showDesktop(); }
    else if (e.ctrlKey && e.key === 'Escape') { e.preventDefault(); toggleStart(); }
    else if (e.altKey && e.key === 'F4') { e.preventDefault(); if (current) closeWindow(current); }
    else if (e.key === 'Escape') { $('#start').hidden = true; $('#calendar').hidden = true; closeMenus(); }
    else if (e.key === 'Delete' && !e.target.matches('input,textarea')) deleteSelected();
  });
  document.addEventListener('keyup', e => { if (e.key === 'Meta' && phase === 'run') toggleStart(); });
}
init();

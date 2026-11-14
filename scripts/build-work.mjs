import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const data = JSON.parse(await readFile(path.join(root, 'content/work-projects.json'), 'utf8'));
const home = await readFile(path.join(root, 'index.html'), 'utf8');
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
const ids = new Set();
for (const section of data.sections) {
  for (const project of section.projects) {
    if (ids.has(project.id)) throw new Error(`Project appears more than once: ${project.id}`);
    ids.add(project.id);
    if (!project.problem || !project.contribution || !project.status || !project.links?.length) throw new Error(`Incomplete project: ${project.id}`);
    for (const link of project.links) if (new URL(link.url).protocol !== 'https:') throw new Error(`Expected verified HTTPS evidence: ${project.id}`);
  }
}
const header = home.match(/<header\b[\s\S]*?<\/header>/)[0]
  .replace('<a href="projects.html">', '<a href="projects.html" class="active" aria-current="page">');
const externalLink = link => `<a class="${link.badge ? 'work-merged-link' : 'card-link'}" href="${escape(link.url)}" target="_blank" rel="noopener noreferrer">${escape(link.label)} <span aria-hidden="true">↗</span><span class="sr-only"> (opens in a new tab)</span></a>`;
const figure = image => image ? `<figure class="work-artifact"><img src="${escape(image.src)}" width="${image.width}" height="${image.height}" loading="lazy" alt="${escape(image.alt)}"><figcaption>${escape(image.caption)}</figcaption></figure>` : '';
function card(project, section) {
  return `<article class="work-card ${project.layout ? 'work-card--' + project.layout : ''}" id="${escape(project.id)}" aria-labelledby="${project.id}-title">
    <div class="work-card-heading"><div><p class="work-eyebrow">${escape(project.eyebrow)}</p><h3 id="${project.id}-title">${escape(project.title)}</h3></div><p class="work-status">${escape(project.status)}</p></div>
    ${project.date ? `<p class="work-date">${escape(project.date)}</p>` : ''}
    <div class="work-card-content"><div class="work-card-copy"><p class="work-question">${escape(project.problem)}</p><p class="work-contribution">${escape(project.contribution)}</p>
    ${project.highlights ? `<ul class="work-highlights">${project.highlights.map(item => `<li>${escape(item)}</li>`).join('')}</ul>` : ''}
    ${project.note ? `<p class="work-evidence-note">${escape(project.note)}</p>` : ''}</div>${figure(project.image)}</div>
    <div class="work-card-footer"><ul class="work-tags" aria-label="Secondary disciplines and methods">${project.tags.map(tag => `<li>${escape(tag)}</li>`).join('')}</ul><div class="work-links">${project.links.map(externalLink).join('')}</div></div>
  </article>`;
}
const sections = data.sections.map(section => `<section class="work-discipline work-discipline--${section.id}" id="${section.id}" aria-labelledby="${section.id}-title"><div class="container">
  <div class="discipline-heading"><span class="discipline-number" aria-hidden="true">${section.number}</span><div><p class="section-label">${escape(section.label)}</p><h2 id="${section.id}-title">${escape(section.title)}</h2><p class="discipline-intro">${escape(section.intro)}</p></div></div>
  <div class="work-collection work-collection--${section.id}">${section.projects.map(project => card(project, section)).join('')}</div>
  <a class="work-back-top" href="#work-top">Back to disciplines <span aria-hidden="true">↑</span></a>
  </div></section>`).join('\n');
const html = `<!DOCTYPE html><html lang="en" data-theme="dark"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Work — Janine Makorre</title><meta name="description" content="Selected work by Janine Makorre across service and product design, data science and analytics, and open source and research.">
<script>try{const t=localStorage.getItem('janine-theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t)}catch{}</script>
<link rel="stylesheet" href="style.css?v=phase1-review"><link rel="stylesheet" href="work.css?v=phase2-review">
</head><body class="work-page"><a class="skip-link" href="#main">Skip to content</a>${header}
<main id="main"><section class="work-intro" id="work-top"><div class="container"><span class="section-label">Selected projects</span><h1>My work</h1><p class="lead">I work across design, data, and open source. These projects show what I explored, contributed, and learned.</p>
<nav class="work-jump-nav" aria-label="Work disciplines">${data.sections.map(section => `<a href="#${section.id}"><span aria-hidden="true">${section.number}</span>${escape(section.title)}<span aria-hidden="true">↓</span></a>`).join('')}</nav></div></section>
${sections}</main>
<footer class="footer-cta phase-one-footer"><div class="container"><h2 class="cta-title">Want to talk about the work?</h2><p class="cta-desc">I'd be glad to hear what you're working on.</p><a class="btn btn-primary" href="mailto:janinemakorre@gmail.com">janinemakorre@gmail.com</a><div class="footer-bottom">&copy; 2026 Janine Robi Makorre.</div></div></footer>
<script src="components.js?v=phase1"></script></body></html>`;
await writeFile(path.join(root, 'projects.html'), html.replace(/[\t ]+$/gm, ''), 'utf8');
console.log(`Built Work: ${data.sections.length} separate disciplines, ${ids.size} unique projects, no placeholder cards.`);

document.addEventListener('DOMContentLoaded', () => {
  const projectDetail = document.getElementById('project-detail');
  const projectId = new URLSearchParams(window.location.search).get('id');
  const listLink = '<a class="project-back-link" href="index.html#proyek">Kembali ke daftar proyek</a>';

  if (!projectId) {
    showNotFound();
    return;
  }

  fetch('projects.json')
    .then(response => {
      if (!response.ok) throw new Error(response.statusText);
      return response.json();
    })
    .then(projects => {
      const project = projects.find(item => item.id === projectId);
      if (!project) {
        showNotFound();
        return;
      }

      document.title = project.title;
      projectDetail.innerHTML = createProjectPage(project);
      configureScaledEmbed();
    })
    .catch(() => {
      projectDetail.innerHTML = `
        <section class="project-detail-error">
          <h1>Detail proyek gagal dimuat</h1>
          <p>Pastikan file dibuka melalui server lokal, bukan langsung dari file://.</p>
          <a href="index.html#proyek">Kembali ke daftar proyek</a>
        </section>`;
    });

  function showNotFound() {
    projectDetail.innerHTML = `
      <section class="project-detail-error">
        ${listLink}
        <h1>Proyek tidak ditemukan</h1>
      </section>`;
  }

  function createProjectPage(project) {
    const title = escapeHTML(project.title);
    const links = project.links || {};
    const toolsHTML = (project.tools || [])
      .map(tool => `<span class="tool-badge">${escapeHTML(tool)}</span>`)
      .join('');
    const statusText = project.status === 'completed'
      ? 'Selesai'
      : 'Sedang dikerjakan';
    const previewActions = [
      links.liveDashboard
        ? `<a class="btn btn-primary project-action" href="${escapeHTML(links.liveDashboard)}" target="_blank" rel="noopener noreferrer">Buka di aplikasi aslinya</a>`
        : '',
      links.download
        ? `<a class="btn btn-secondary project-action" href="${escapeHTML(links.download)}" download>Unduh file</a>`
        : ''
    ].filter(Boolean).join('');

    const hasEmbed = Boolean(links.embed);
    const embedSize = links.embedSize
      && Number.isFinite(links.embedSize.width)
      && Number.isFinite(links.embedSize.height)
      && links.embedSize.width > 0
      && links.embedSize.height > 0
      ? links.embedSize
      : null;
    const images = Array.isArray(links.images) ? links.images : [];
    const previewHTML = hasEmbed || images.length
      ? `
        ${hasEmbed
          ? `<div class="project-preview-viewport"${embedSize ? ` data-embed-width="${embedSize.width}" data-embed-height="${embedSize.height}"` : ''}><iframe class="project-preview-frame${embedSize ? ' project-preview-frame-fixed' : ''}" src="${escapeHTML(links.embed)}" title="Dashboard ${title}" loading="lazy"${embedSize ? ` width="${embedSize.width}" height="${embedSize.height}"` : ''}></iframe></div>`
          : ''}
        ${images.length
          ? `<div class="project-preview-gallery">${images.map((image, index) =>
            `<img class="project-preview-image" src="${escapeHTML(image)}" alt="Pratinjau ${title}, gambar ${index + 1}" loading="lazy">`
          ).join('')}</div>`
          : ''}`
      : '<p class="project-preview-empty">Pratinjau belum tersedia</p>';

    const contentSections = [
      ['Masalah', project.problem],
      ['Proses', project.process],
      ['Hasil', project.result]
    ].filter(([, text]) => typeof text === 'string' && text.trim())
      .map(([heading, text]) => `
        <section class="project-detail-section">
          <h2>${heading}</h2>
          <p>${escapeHTML(text)}</p>
        </section>`)
      .join('');

    const insightsHTML = Array.isArray(project.insights) && project.insights.length
      ? `
        <section class="project-detail-section">
          <h2>Insight</h2>
          <ul class="project-detail-insights">
            ${project.insights.map(insight => `<li>${escapeHTML(insight)}</li>`).join('')}
          </ul>
        </section>`
      : '';

    return `
      <article>
        <div class="project-detail-copy">
          ${listLink}
          <header class="project-detail-header">
            <h1 class="project-detail-title">${title}</h1>
            <div class="project-detail-meta">
              <div class="project-detail-tools" aria-label="Tools">${toolsHTML}</div>
              <span class="project-detail-status">${statusText}</span>
              <time class="project-detail-date" datetime="${escapeHTML(project.date)}">${formatDate(project.date)}</time>
            </div>
            <p class="project-detail-summary">${escapeHTML(project.summary)}</p>
          </header>
        </div>
        <section class="project-preview" aria-label="Pratinjau proyek">
          <div class="project-preview-heading">
            ${hasEmbed ? '<span class="project-preview-label">Dashboard interaktif</span>' : ''}
            <div class="project-preview-actions">${previewActions}</div>
          </div>
          ${previewHTML}
        </section>
        <div class="project-detail-copy">
          ${contentSections}
          ${insightsHTML}
        </div>
      </article>`;
  }

  function configureScaledEmbed() {
    const viewport = document.querySelector('.project-preview-viewport[data-embed-width][data-embed-height]');
    if (!viewport) return;

    const iframe = viewport.querySelector('.project-preview-frame');
    const width = Number(viewport.dataset.embedWidth);
    const height = Number(viewport.dataset.embedHeight);
    iframe.style.width = `${width}px`;
    iframe.style.height = `${height}px`;
    const resizeFrame = () => {
      const scale = Math.min(viewport.clientWidth / width, 1);
      iframe.style.transform = `scale(${scale})`;
      viewport.style.height = `${height * scale}px`;
    };

    resizeFrame();
    new ResizeObserver(resizeFrame).observe(viewport);
  }

  function formatDate(dateStr) {
    const [year, month] = dateStr.split('-');
    const names = [
      'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
      'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'
    ];
    return names[parseInt(month, 10) - 1] + ' ' + year;
  }

  function escapeHTML(value) {
    const el = document.createElement('span');
    el.textContent = value;
    return el.innerHTML;
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const projectList = document.getElementById('project-list');
  const filterButtons = document.querySelectorAll('.filter-btn');
  let allProjects = [];

  // ── Fetch & render ──────────────────────────────────────
  fetch('projects.json')
    .then(response => {
      if (!response.ok) throw new Error(response.statusText);
      return response.json();
    })
    .then(projects => {
      allProjects = sortProjects(projects);
      renderProjects(allProjects);
    })
    .catch(() => {
      projectList.innerHTML =
        '<p class="load-error">Gagal memuat data proyek. Pastikan file dibuka melalui server lokal, bukan langsung dari file:// .</p>';
    });

  // ── Sort: newest date, then title ───────────────────────
  function sortProjects(projects) {
    return [...projects].sort((a, b) => {
      return b.date.localeCompare(a.date)
        || a.title.localeCompare(b.title, 'id', { sensitivity: 'base' });
    });
  }

  // ── Render ledger rows ──────────────────────────────────
  function renderProjects(projects) {
    if (projects.length === 0) {
      projectList.innerHTML =
        '<p class="empty-state">Belum ada proyek di kategori ini.</p>';
      return;
    }

    projectList.innerHTML = projects.map(createRow).join('');
  }

  function createRow(project) {
    const titleHTML = `<a href="project.html?id=${encodeURIComponent(project.id)}" class="project-link">${escapeHTML(project.title)}</a>`;

    const toolsHTML = project.tools
      .map(t => `<span class="tool-badge">${escapeHTML(t)}</span>`)
      .join('');

    const statusClass = project.status === 'completed'
      ? 'status-completed'
      : 'status-in-progress';

    const statusText = project.status === 'completed'
      ? 'Selesai'
      : 'Sedang dikerjakan';

    const dateText = formatDate(project.date);

    return `
      <div class="ledger-row" data-category="${escapeHTML(project.category)}">
        <div class="ledger-col-name">
          <div class="project-title-line">
            ${titleHTML}
          </div>
          <p class="project-summary">${escapeHTML(project.summary)}</p>
        </div>
        <div class="ledger-col-tools">${toolsHTML}</div>
        <div class="ledger-col-status">
          <span class="status-badge ${statusClass}">${statusText}</span>
        </div>
        <div class="ledger-col-date">${dateText}</div>
      </div>`;
  }

  // ── Date formatter ──────────────────────────────────────
  function formatDate(dateStr) {
    const [year, month] = dateStr.split('-');
    const names = [
      'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
      'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'
    ];
    return names[parseInt(month, 10) - 1] + ' ' + year;
  }

  // ── Escape HTML to prevent XSS ─────────────────────────
  function escapeHTML(str) {
    const el = document.createElement('span');
    el.textContent = str;
    return el.innerHTML;
  }

  // ── Tab filter ──────────────────────────────────────────
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');

      const category = btn.dataset.category;
      const filtered = category === 'all'
        ? allProjects
        : allProjects.filter(p => p.category === category);

      renderProjects(filtered);
    });
  });
});

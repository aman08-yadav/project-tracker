// ═══════════════════════════════════════════════════════════
//  UI.JS — Shared UI Utilities: Toast, Sidebar, Topbar
// ═══════════════════════════════════════════════════════════

// ── Toast System ────────────────────────────────────────────
export function initToast() {
  if (!document.getElementById('toast-container')) {
    const el = document.createElement('div');
    el.id = 'toast-container';
    document.body.appendChild(el);
  }
}

export function showToast(type = 'info', title = '', message = '') {
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type]}</span>
    <div class="toast-body">
      ${title ? `<div class="toast-title">${title}</div>` : ''}
      ${message ? `<div class="toast-msg">${message}</div>` : ''}
    </div>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('hiding');
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}

// ── Current User ─────────────────────────────────────────────
export function getUser() {
  try { return JSON.parse(localStorage.getItem('user')) || null; }
  catch { return null; }
}

export function getToken() {
  return localStorage.getItem('token');
}

export function requireAuth() {
  if (!getToken()) {
    window.location.href = 'login.html';
    return null;
  }
  return getUser();
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}

// ── Avatar Helper ─────────────────────────────────────────────
export function avatarInitials(name = '') {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export function buildAvatar(user, size = 36) {
  if (user?.avatar) {
    return `<img src="${user.avatar}" alt="${user.name}" style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover">`;
  }
  return `<div style="width:${size}px;height:${size}px;border-radius:50%;background:var(--gradient-brand);display:flex;align-items:center;justify-content:center;font-size:${size * 0.35}px;font-weight:600;color:white;flex-shrink:0;">${avatarInitials(user?.name)}</div>`;
}

// ── Sidebar Builder ───────────────────────────────────────────
export function buildSidebar(activePage = '') {
  const user = getUser();
  const isFaculty = user?.role === 'faculty';

  const navItems = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard', href: 'dashboard.html' },
    { id: 'projects', icon: '📁', label: 'Projects', href: 'project.html' },
    { id: 'tasks', icon: '✅', label: 'Tasks', href: 'tasks.html' },
    { id: 'upload', icon: '📎', label: 'Files', href: 'upload.html' },
    { id: 'analytics', icon: '🏆', label: 'Leaderboard', href: 'analytics.html' },
  ];

  const sidebarHTML = `
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-brand">
        <div class="sidebar-logo">🚀</div>
        <div>
          <div class="sidebar-brand-name">ProjectHub</div>
          <div class="sidebar-brand-sub">CONTRIBUTION TRACKER</div>
        </div>
      </div>
      <nav class="sidebar-nav">
        <div class="nav-section-label">Navigation</div>
        ${navItems.map(item => `
          <a href="${item.href}" class="nav-item ${activePage === item.id ? 'active' : ''}" id="nav-${item.id}">
            <span class="nav-icon">${item.icon}</span>
            <span>${item.label}</span>
          </a>
        `).join('')}
        ${isFaculty ? `
          <div class="nav-section-label" style="margin-top:8px;">Faculty</div>
          <a href="analytics.html" class="nav-item ${activePage === 'analytics' ? 'active' : ''}">
            <span class="nav-icon">📈</span>
            <span>Analytics</span>
          </a>
        ` : ''}
      </nav>
      <div class="sidebar-footer">
        <div class="sidebar-user">
          ${buildAvatar(user, 36)}
          <div class="sidebar-user-info">
            <div class="sidebar-user-name">${user?.name || 'User'}</div>
            <div class="sidebar-user-role">${user?.role || 'student'}</div>
          </div>
          <button onclick="window.uiLogout()" title="Logout" style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:1rem;padding:4px;">⏏</button>
        </div>
      </div>
    </aside>
    <div class="sidebar-overlay" id="sidebar-overlay"></div>
  `;

  document.body.insertAdjacentHTML('afterbegin', sidebarHTML);

  // Mobile toggle
  window.uiLogout = logout;
  const overlay = document.getElementById('sidebar-overlay');
  overlay?.addEventListener('click', () => {
    document.getElementById('sidebar').classList.remove('open');
    overlay.style.display = 'none';
  });
}

// ── Topbar Builder ────────────────────────────────────────────
export function buildTopbar(title = '') {
  const user = getUser();
  const topbarHTML = `
    <header class="topbar" id="topbar">
      <div style="display:flex;align-items:center;gap:12px;">
        <button class="hamburger" id="hamburger">☰</button>
        <span style="font-weight:600;font-size:1rem;color:var(--text-secondary)">${title}</span>
      </div>
      <div class="topbar-right">
        <button class="notif-btn" id="notif-btn" title="Notifications">
          🔔
          <span class="notif-badge" id="notif-badge" style="display:none">0</span>
        </button>
        <div class="user-menu">
          <div class="user-avatar">${user?.avatar ? `<img src="${user.avatar}" alt="">` : avatarInitials(user?.name)}</div>
          <span style="font-size:0.88rem;font-weight:500">${user?.name?.split(' ')[0] || 'User'}</span>
        </div>
      </div>
    </header>
  `;
  document.body.insertAdjacentHTML('afterbegin', topbarHTML);

  // Hamburger click
  document.getElementById('hamburger')?.addEventListener('click', () => {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    sidebar.classList.toggle('open');
    if (overlay) overlay.style.display = sidebar.classList.contains('open') ? 'block' : 'none';
  });
}

// ── Format Utilities ──────────────────────────────────────────
export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

// ── Animated Counter ──────────────────────────────────────────
export function animateCounter(el, target, duration = 1000) {
  let start = 0;
  const step = target / (duration / 16);
  const timer = setInterval(() => {
    start += step;
    if (start >= target) { el.textContent = target; clearInterval(timer); }
    else { el.textContent = Math.floor(start); }
  }, 16);
}

// ── Modal Helper ──────────────────────────────────────────────
export function openModal(html) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `<div class="modal">${html}</div>`;
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
  document.body.appendChild(overlay);
  overlay.querySelector('.modal-close')?.addEventListener('click', () => overlay.remove());
  return overlay;
}

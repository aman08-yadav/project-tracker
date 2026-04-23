// ═══════════════════════════════════════════════════════════
//  UI.JS — Shared UI Utilities: Toast, Sidebar, Topbar, Modals
// ═══════════════════════════════════════════════════════════

import { ApiClient } from './api.js';

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
  }, 4000);
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
  return `<div class="avatar-fallback" style="width:${size}px;height:${size}px;border-radius:50%;background:var(--gradient-brand);display:flex;align-items:center;justify-content:center;font-size:${size * 0.35}px;font-weight:600;color:white;flex-shrink:0;">${avatarInitials(user?.name)}</div>`;
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
        <div class="sidebar-brand-text">
          <div class="sidebar-brand-name">ProjectHub</div>
          <div class="sidebar-brand-sub">WORKSPACE</div>
        </div>
      </div>
      <nav class="sidebar-nav">
        <div class="nav-section-label">Main Menu</div>
        ${navItems.map(item => `
          <a href="${item.href}" class="nav-item ${activePage === item.id ? 'active' : ''}" id="nav-${item.id}">
            <span class="nav-icon">${item.icon}</span>
            <span>${item.label}</span>
          </a>
        `).join('')}
      </nav>
      <div class="sidebar-footer">
        <div class="sidebar-user">
          ${buildAvatar(user, 36)}
          <div class="sidebar-user-info">
            <div class="sidebar-user-name">${user?.name || 'User'}</div>
            <div class="sidebar-user-role">${user?.role || 'student'}</div>
          </div>
          <button onclick="window.uiLogout()" title="Logout" style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:1.2rem;padding:4px;transition:color 0.2s;" onmouseover="this.style.color='var(--rose)'" onmouseout="this.style.color='var(--text-muted)'">⏏</button>
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
      <div style="display:flex;align-items:center;gap:16px;">
        <button class="hamburger" id="hamburger">☰</button>
        <span style="font-weight:700;font-size:1.1rem;color:var(--text-primary);letter-spacing:0.02em;">${title}</span>
      </div>
      <div class="topbar-right">
        <button class="help-btn" id="help-btn" title="How to use ProjectHub (Shortcut: ?)">
          <span>💡</span> Help
        </button>
        <button class="notif-btn" id="notif-btn" title="Notifications">
          🔔
          <span class="notif-badge" id="notif-badge" style="display:none">0</span>
        </button>
        <div class="user-menu" title="Profile" id="profile-btn">
          <div class="user-avatar">${user?.avatar ? `<img src="${user.avatar}" alt="">` : avatarInitials(user?.name)}</div>
          <span style="font-size:0.9rem;font-weight:600;display:none;">${user?.name?.split(' ')[0] || 'User'}</span>
        </div>
      </div>
    </header>

    <!-- Notification Drawer -->
    <div class="notif-drawer-overlay" id="notif-overlay"></div>
    <div class="notif-drawer" id="notif-drawer">
      <div class="notif-drawer-header">
        <h3>Activity Notifications</h3>
        <button class="notif-drawer-close" id="notif-close">×</button>
      </div>
      <div class="notif-drawer-body" id="notif-list">
        <p class="text-muted text-sm" style="text-align:center;margin-top:20px;">No new notifications</p>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('afterbegin', topbarHTML);

  // Hamburger click
  document.getElementById('hamburger')?.addEventListener('click', () => {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    sidebar.classList.toggle('open');
    if (overlay) overlay.style.display = sidebar.classList.contains('open') ? 'block' : 'none';
  });

  // Setup Notifications
  initNotifications();

  // Setup Help Modal
  document.getElementById('help-btn')?.addEventListener('click', openHelpModal);

  // Setup Profile Modal
  document.getElementById('profile-btn')?.addEventListener('click', openProfileModal);

  // Setup Global Shortcuts
  initKeyboardShortcuts();
}

// ── Notifications System ──────────────────────────────────────
let unreadCount = 0;
const notifications = [];

function initNotifications() {
  const btn = document.getElementById('notif-btn');
  const overlay = document.getElementById('notif-overlay');
  const drawer = document.getElementById('notif-drawer');
  const close = document.getElementById('notif-close');

  const openDrawer = () => {
    drawer.classList.add('open');
    overlay.classList.add('open');
    unreadCount = 0;
    updateBadge();
    renderNotifications();
  };

  const closeDrawer = () => {
    drawer.classList.remove('open');
    overlay.classList.remove('open');
  };

  btn?.addEventListener('click', openDrawer);
  close?.addEventListener('click', closeDrawer);
  overlay?.addEventListener('click', closeDrawer);

  // Expose global function for Socket.IO events to call
  window.addNotification = (log) => {
    notifications.unshift({ ...log, unread: true });
    if (notifications.length > 20) notifications.pop();
    unreadCount++;
    updateBadge();
    if (drawer.classList.contains('open')) renderNotifications();
  };
}

function updateBadge() {
  const badge = document.getElementById('notif-badge');
  if (!badge) return;
  if (unreadCount > 0) {
    badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
    badge.style.display = 'flex';
  } else {
    badge.style.display = 'none';
  }
}

function renderNotifications() {
  const list = document.getElementById('notif-list');
  if (notifications.length === 0) {
    list.innerHTML = `<div class="empty-state"><div class="icon" style="font-size:2rem;margin-bottom:10px;">🔔</div><h3 style="font-size:0.95rem;">You're all caught up!</h3><p style="font-size:0.8rem;">No new activity yet.</p></div>`;
    return;
  }

  const icons = { task_created:'📝', task_updated:'🔄', task_completed:'✅', file_uploaded:'📎', member_added:'👤', project_created:'📁' };

  list.innerHTML = notifications.map(n => `
    <div class="notif-item ${n.unread ? 'unread' : ''}">
      <div class="notif-item-icon">${icons[n.action] || '⚡'}</div>
      <div class="notif-item-body">
        <div class="notif-item-text">
          <strong>${n.user?.name || 'Someone'}</strong> ${n.action.replace(/_/g,' ')}
          ${n.metadata?.title ? `— <em style="color:var(--accent-light);">${n.metadata.title}</em>` : ''}
        </div>
        <div class="notif-item-time">${timeAgo(n.createdAt || Date.now())} • ${n.project?.name || 'Project'}</div>
      </div>
    </div>
  `).join('');

  // Mark all read
  notifications.forEach(n => n.unread = false);
}

// ── Help Modal ────────────────────────────────────────────────
export function openHelpModal() {
  openModal(`
    <div class="modal-header">
      <h3>Welcome to ProjectHub</h3>
      <button class="modal-close">×</button>
    </div>
    <div class="help-section">
      <h4>How to Use</h4>
      <p>This is a real-time, full-stack application. Create projects, add registered users to your team using their email, and assign tasks. Any changes you make will instantly update for everyone on the team.</p>
    </div>
    <div class="help-section">
      <h4>Global Keyboard Shortcuts</h4>
      <ul>
        <li><span class="kbd">N</span> — Create a new task (on Tasks page)</li>
        <li><span class="kbd">P</span> — Go to Projects page</li>
        <li><span class="kbd">?</span> — Open this Help modal</li>
        <li><span class="kbd">Esc</span> — Close any modal or drawer</li>
      </ul>
    </div>
    <div class="help-section">
      <h4>Key Features</h4>
      <ul>
        <li><strong>Drag & Drop Kanban:</strong> Drag tasks between columns. Status updates instantly for everyone.</li>
        <li><strong>Live Notifications:</strong> Click the bell icon to see a real-time activity feed.</li>
        <li><strong>Leaderboard:</strong> Earn points by completing tasks and uploading files. Check the podium!</li>
      </ul>
    </div>
    <button class="btn btn-primary" style="width:100%" onclick="document.querySelector('.modal-close').click()">Got it, thanks!</button>
  `);
}

// ── Profile Modal ─────────────────────────────────────────────
export function openProfileModal() {
  const user = getUser();
  const overlay = openModal(`
    <div class="modal-header">
      <h3>My Profile</h3>
      <button class="modal-close">×</button>
    </div>
    <div style="display:flex;flex-direction:column;align-items:center;margin-bottom:24px;">
      <div style="width:80px;height:80px;margin-bottom:12px;font-size:2rem;">
        ${buildAvatar(user, 80)}
      </div>
      <h4 style="margin:0;font-size:1.1rem;color:var(--text-primary);">${user.name}</h4>
      <p style="margin:0;font-size:0.85rem;color:var(--text-muted);text-transform:capitalize;">${user.role}</p>
    </div>
    <form id="profile-form" style="margin-bottom:24px;">
      <div class="form-group">
        <label>Full Name</label>
        <input type="text" id="profile-name" class="form-control" value="${user.name}" required>
      </div>
      <div class="form-group">
        <label>Email Address</label>
        <input type="email" class="form-control" value="${user.email}" disabled style="opacity:0.6;cursor:not-allowed;">
      </div>
      <div class="form-group" style="margin-bottom:32px;">
        <label>New Password (Optional)</label>
        <input type="password" id="profile-pwd" class="form-control" placeholder="Leave blank to keep current">
      </div>
      <button type="submit" class="btn btn-primary" style="width:100%;margin-bottom:12px;">Update Profile</button>
      <button type="button" class="btn btn-danger" style="width:100%;" onclick="window.uiLogout()">⏏ Log Out</button>
    </form>
  `);

  document.getElementById('profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.submitter || e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Updating...';

    try {
      const name = document.getElementById('profile-name').value;
      const pwd = document.getElementById('profile-pwd').value;

      const res = await ApiClient.put(\`/users/profile/\${user.id}\`, { name, password: pwd });
      
      // Update local storage
      const updatedUser = { ...user, name: res.user.name };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      showToast('success', 'Success', 'Profile updated successfully!');
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      showToast('error', 'Error', err.message || 'Failed to update profile.');
      btn.disabled = false;
      btn.textContent = 'Update Profile';
    }
  });
}

// ── Keyboard Shortcuts ────────────────────────────────────────
function initKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ignore if typing in an input/textarea
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    if (e.key === '?') {
      openHelpModal();
    } else if (e.key.toLowerCase() === 'p') {
      if (!window.location.href.includes('project.html')) window.location.href = 'project.html';
    } else if (e.key.toLowerCase() === 'n') {
      // If on tasks page, trigger new task
      const newTaskBtn = document.getElementById('new-task-btn');
      if (newTaskBtn) newTaskBtn.click();
    } else if (e.key === 'Escape') {
      // Close modals
      document.querySelectorAll('.modal-overlay').forEach(el => el.remove());
      // Close notif drawer
      const drawer = document.getElementById('notif-drawer');
      const overlay = document.getElementById('notif-overlay');
      if (drawer) drawer.classList.remove('open');
      if (overlay) overlay.classList.remove('open');
    }
  });
}

// ── Confetti Utility ──────────────────────────────────────────
export function fireConfetti() {
  const colors = ['#7c3aed', '#06b6d4', '#10b981', '#f43f5e', '#fbbf24'];
  for (let i = 0; i < 50; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    el.style.left = Math.random() * 100 + 'vw';
    el.style.top = -10 + 'px';
    const duration = Math.random() * 2 + 1; // 1 to 3 seconds
    el.style.animationDuration = duration + 's';
    el.style.animationDelay = Math.random() * 0.5 + 's';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), (duration + 0.5) * 1000);
  }
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
export function animateCounter(el, target, duration = 1500) {
  if (!el) return;
  const targetNum = parseInt(target) || 0;
  if (targetNum === 0) { el.textContent = '0'; return; }

  let start = 0;
  const fps = 60;
  const step = targetNum / (duration / (1000 / fps));

  const timer = setInterval(() => {
    start += step;
    if (start >= targetNum) {
      el.textContent = targetNum;
      clearInterval(timer);
    } else {
      el.textContent = Math.floor(start);
    }
  }, 1000 / fps);
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

import { ApiClient } from './api.js';
import { AuthService } from './auth.js';
import { Project, ActivityLog } from './types.js';

// @ts-ignore - Socket.IO is loaded via CDN in HTML
const io = (window as any).io;

document.addEventListener('DOMContentLoaded', () => {
  AuthService.checkAuth();
  AuthService.setupLogoutButton();
  AuthService.renderUserInfo();

  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get('id');

  if (!projectId) {
    window.location.href = '/html/dashboard.html';
    return;
  }

  // Update nav links
  const taskLink = document.getElementById('nav-tasks') as HTMLAnchorElement;
  const uploadLink = document.getElementById('nav-upload') as HTMLAnchorElement;
  const analyticsLink = document.getElementById('nav-analytics') as HTMLAnchorElement;
  if (taskLink) taskLink.href = `/html/tasks.html?id=${projectId}`;
  if (uploadLink) uploadLink.href = `/html/upload.html?id=${projectId}`;
  if (analyticsLink) analyticsLink.href = `/html/analytics.html?id=${projectId}`;

  loadProjectDetail(projectId);
  loadActivity(projectId);
  setupSocket(projectId);
});

async function loadProjectDetail(projectId: string) {
  try {
    const res = await ApiClient.get<{ success: boolean; project: Project }>(`/projects/${projectId}`);
    const project = res.project;
    
    const titleEl = document.getElementById('project-title');
    const descEl = document.getElementById('project-desc');
    if (titleEl) titleEl.textContent = project.name;
    if (descEl) descEl.textContent = project.description;

    const membersList = document.getElementById('members-list');
    if (membersList) {
      membersList.innerHTML = project.members.map(m => `
        <div class="member-item">
          <div class="member-avatar">${m.user.name.charAt(0).toUpperCase()}</div>
          <div class="member-info">
            <div class="member-name">${m.user.name}</div>
            <div class="member-role">${m.role}</div>
          </div>
        </div>
      `).join('');
    }

    const user = AuthService.getUser();
    const addMemberForm = document.getElementById('add-member-form');
    if (addMemberForm) {
      if (user?.role === 'faculty' || project.owner._id === user?.id) {
        addMemberForm.style.display = 'flex';
        addMemberForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const emailInput = document.getElementById('new-member-email') as HTMLInputElement;
          try {
            await ApiClient.post(`/projects/${projectId}/members`, { email: emailInput.value });
            emailInput.value = '';
            loadProjectDetail(projectId);
          } catch (err: any) {
            alert(err.message);
          }
        });
      } else {
        addMemberForm.style.display = 'none';
      }
    }
  } catch (err) {
    console.error(err);
  }
}

async function loadActivity(projectId: string) {
  const container = document.getElementById('activity-feed');
  if (!container) return;

  try {
    const res = await ApiClient.get<{ success: boolean; logs: ActivityLog[] }>(`/analytics/activity?projectId=${projectId}`);
    if (res.logs.length === 0) {
      container.innerHTML = '<div class="empty-state">No activity yet.</div>';
      return;
    }

    container.innerHTML = res.logs.map(log => {
      let icon = '📝';
      if (log.action.includes('file')) icon = '📁';
      if (log.action.includes('task')) icon = '✅';
      if (log.action.includes('member')) icon = '👤';

      const date = new Date(log.createdAt).toLocaleString();
      let detail = log.action;
      if (log.metadata?.title) detail += `: ${log.metadata.title}`;
      if (log.metadata?.originalName) detail += `: ${log.metadata.originalName}`;
      if (log.metadata?.addedUser) detail += `: ${log.metadata.addedUser}`;

      return `
        <div class="activity-item">
          <div class="activity-icon">${icon}</div>
          <div class="activity-content">
            <p><strong>${log.user.name}</strong> ${detail.replace(/_/g, ' ')}</p>
            <span class="activity-time">${date}</span>
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    container.innerHTML = '<div class="error-state">Failed to load activity.</div>';
  }
}

function setupSocket(projectId: string) {
  const socket = io();
  
  socket.on('connect', () => {
    socket.emit('join:project', projectId);
  });

  socket.on('task:updated', () => loadActivity(projectId));
  socket.on('task:created', () => loadActivity(projectId));
  socket.on('file:uploaded', () => loadActivity(projectId));
}

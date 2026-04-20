import { ApiClient } from './api.js';
import { AuthService } from './auth.js';
import { Project, ApiResponse } from './types.js';

document.addEventListener('DOMContentLoaded', () => {
  AuthService.checkAuth();
  AuthService.setupLogoutButton();
  AuthService.renderUserInfo();

  const user = AuthService.getUser();
  const createProjectBtn = document.getElementById('create-project-btn');
  const createProjectModal = document.getElementById('create-project-modal');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const createProjectForm = document.getElementById('create-project-form') as HTMLFormElement;

  if (user?.role !== 'faculty' && createProjectBtn) {
    createProjectBtn.style.display = 'none';
  } else if (createProjectBtn && createProjectModal && closeModalBtn) {
    createProjectBtn.addEventListener('click', () => {
      createProjectModal.classList.add('active');
    });
    closeModalBtn.addEventListener('click', () => {
      createProjectModal.classList.remove('active');
    });
  }

  if (createProjectForm) {
    createProjectForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = (document.getElementById('project-name') as HTMLInputElement).value;
      const description = (document.getElementById('project-desc') as HTMLTextAreaElement).value;

      try {
        await ApiClient.post('/projects', { name, description });
        createProjectModal?.classList.remove('active');
        loadProjects();
      } catch (err: any) {
        alert(err.message);
      }
    });
  }

  loadProjects();
});

async function loadProjects() {
  const container = document.getElementById('projects-container');
  if (!container) return;

  try {
    container.innerHTML = '<div class="loader">Loading projects...</div>';
    const res = await ApiClient.get<{ success: boolean; projects: Project[] }>('/projects');
    
    if (res.projects.length === 0) {
      container.innerHTML = '<div class="empty-state">No projects found.</div>';
      return;
    }

    container.innerHTML = '';
    res.projects.forEach(project => {
      const card = document.createElement('div');
      card.className = 'card project-card';
      card.innerHTML = `
        <div class="card-header">
          <h3>${project.name}</h3>
          <span class="badge ${project.status}">${project.status}</span>
        </div>
        <p class="card-desc">${project.description || 'No description provided.'}</p>
        <div class="card-footer">
          <span>Members: ${project.members.length}</span>
          <a href="/html/project.html?id=${project._id}" class="btn btn-primary btn-sm">View Project</a>
        </div>
      `;
      container.appendChild(card);
    });
  } catch (err: any) {
    container.innerHTML = `<div class="error-state">${err.message}</div>`;
  }
}

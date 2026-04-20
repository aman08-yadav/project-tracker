import { ApiClient } from './api.js';
import { AuthService } from './auth.js';
import { FileMetadata } from './types.js';

let projectId: string;

document.addEventListener('DOMContentLoaded', () => {
  AuthService.checkAuth();
  AuthService.setupLogoutButton();
  AuthService.renderUserInfo();

  const urlParams = new URLSearchParams(window.location.search);
  projectId = urlParams.get('id') || '';

  if (!projectId) {
    window.location.href = '/html/dashboard.html';
    return;
  }

  const backLink = document.getElementById('back-to-project') as HTMLAnchorElement;
  if (backLink) backLink.href = `/html/project.html?id=${projectId}`;

  loadFiles();

  const form = document.getElementById('upload-form') as HTMLFormElement;
  const fileInput = document.getElementById('file-input') as HTMLInputElement;
  const statusDiv = document.getElementById('upload-status');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      if (!fileInput.files || fileInput.files.length === 0) {
        alert('Please select a file');
        return;
      }

      const formData = new FormData();
      formData.append('file', fileInput.files[0]);
      formData.append('projectId', projectId);
      
      const descInput = document.getElementById('file-desc') as HTMLInputElement;
      if (descInput.value) formData.append('description', descInput.value);

      try {
        if(statusDiv) {
          statusDiv.textContent = 'Uploading...';
          statusDiv.className = 'status-info';
        }

        await ApiClient.post('/files/upload', formData, true);
        
        form.reset();
        if(statusDiv) {
          statusDiv.textContent = 'File uploaded successfully!';
          statusDiv.className = 'status-success';
        }
        
        loadFiles();
        setTimeout(() => { if(statusDiv) statusDiv.textContent = ''; }, 3000);
      } catch (err: any) {
        if(statusDiv) {
          statusDiv.textContent = err.message;
          statusDiv.className = 'status-error';
        }
      }
    });
  }
});

async function loadFiles() {
  const container = document.getElementById('files-list');
  if (!container) return;

  try {
    const res = await ApiClient.get<{ success: boolean; files: FileMetadata[] }>(`/files/project/${projectId}`);
    
    if (res.files.length === 0) {
      container.innerHTML = '<div class="empty-state">No files uploaded yet.</div>';
      return;
    }

    container.innerHTML = res.files.map(file => {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      const date = new Date(file.createdAt).toLocaleDateString();
      
      return `
        <div class="file-item card">
          <div class="file-info">
            <span class="file-icon">📄</span>
            <div>
              <p class="file-name">${file.originalName}</p>
              <p class="file-meta">${sizeMB} MB • Uploaded by ${file.uploadedBy.name} on ${date}</p>
            </div>
          </div>
          <div class="file-actions">
            <a href="/api/v1/files/download/${file._id}" class="btn btn-secondary btn-sm" download>Download</a>
            <button class="btn btn-danger btn-sm" onclick="deleteFile('${file._id}')">Delete</button>
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error(err);
    container.innerHTML = '<div class="error-state">Failed to load files.</div>';
  }
}

// @ts-ignore - Exporting to global scope for the inline onclick handler
(window as any).deleteFile = async (fileId: string) => {
  if (!confirm('Are you sure you want to delete this file?')) return;
  try {
    await ApiClient.delete(`/files/${fileId}`);
    loadFiles();
  } catch (err: any) {
    alert(err.message);
  }
};

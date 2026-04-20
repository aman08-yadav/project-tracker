import { ApiClient } from './api.js';
import { AuthService } from './auth.js';
// @ts-ignore
const io = window.io;
let projectId;
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
    // Update back link
    const backLink = document.getElementById('back-to-project');
    if (backLink)
        backLink.href = `/html/project.html?id=${projectId}`;
    loadTasks();
    setupSocket();
    setupDragAndDrop();
    const addTaskForm = document.getElementById('add-task-form');
    if (addTaskForm) {
        addTaskForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = document.getElementById('task-title').value;
            const description = document.getElementById('task-desc').value;
            try {
                await ApiClient.post('/tasks', { title, description, projectId });
                addTaskForm.reset();
                loadTasks();
            }
            catch (err) {
                alert(err.message);
            }
        });
    }
});
async function loadTasks() {
    try {
        const res = await ApiClient.get(`/tasks?projectId=${projectId}`);
        const columns = {
            'pending': document.getElementById('col-pending'),
            'in-progress': document.getElementById('col-in-progress'),
            'completed': document.getElementById('col-completed')
        };
        Object.values(columns).forEach(col => { if (col)
            col.innerHTML = ''; });
        res.tasks.forEach(task => {
            const el = document.createElement('div');
            el.className = 'task-card';
            el.draggable = true;
            el.dataset.id = task._id;
            el.innerHTML = `
        <h4>${task.title}</h4>
        <p>${task.description || ''}</p>
        <div class="task-meta">
          <span class="badge ${task.priority}">${task.priority}</span>
          ${task.assignedTo ? `<span>👤 ${task.assignedTo.name}</span>` : ''}
        </div>
      `;
            el.addEventListener('dragstart', (e) => {
                if (e.dataTransfer) {
                    e.dataTransfer.setData('text/plain', task._id);
                    setTimeout(() => el.classList.add('dragging'), 0);
                }
            });
            el.addEventListener('dragend', () => el.classList.remove('dragging'));
            const col = columns[task.status];
            if (col)
                col.appendChild(el);
        });
    }
    catch (err) {
        console.error('Failed to load tasks', err);
    }
}
function setupDragAndDrop() {
    const columns = document.querySelectorAll('.task-column-body');
    columns.forEach(col => {
        col.addEventListener('dragover', (e) => {
            e.preventDefault();
            col.classList.add('drag-over');
        });
        col.addEventListener('dragleave', () => {
            col.classList.remove('drag-over');
        });
        col.addEventListener('drop', async (e) => {
            var _a;
            e.preventDefault();
            col.classList.remove('drag-over');
            const taskId = (_a = e.dataTransfer) === null || _a === void 0 ? void 0 : _a.getData('text/plain');
            const newStatus = col.dataset.status;
            if (taskId && newStatus) {
                try {
                    await ApiClient.patch(`/tasks/${taskId}/status`, { status: newStatus });
                    loadTasks(); // Optimistic UI could be used here, but full reload is safer
                }
                catch (err) {
                    alert(err.message);
                }
            }
        });
    });
}
function setupSocket() {
    const socket = io();
    socket.on('connect', () => socket.emit('join:project', projectId));
    socket.on('task:updated', () => loadTasks());
    socket.on('task:created', () => loadTasks());
}

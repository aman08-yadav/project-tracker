import { ApiClient } from './api.js';
import { AuthService } from './auth.js';

let projectId: string;

document.addEventListener('DOMContentLoaded', () => {
  AuthService.checkAuth();
  AuthService.checkRole(['faculty']); // Only faculty can view this
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

  loadAnalytics();
});

async function loadAnalytics() {
  try {
    const res = await ApiClient.get<any>(`/analytics/project/${projectId}`);
    const { project, memberStats } = res.analytics;

    // Render summary boxes
    const summaryContainer = document.getElementById('summary-boxes');
    if (summaryContainer) {
      summaryContainer.innerHTML = `
        <div class="stat-box">
          <h4>Total Members</h4>
          <p>${project?.memberCount || memberStats.length}</p>
        </div>
        <div class="stat-box">
          <h4>Total Uploads</h4>
          <p>${project?.totalUploads || 0}</p>
        </div>
        <div class="stat-box">
          <h4>Completed Tasks</h4>
          <p>${project?.completedTasks || 0} / ${project?.totalTasks || 0}</p>
        </div>
      `;
    }

    // Render detailed table
    const tableBody = document.getElementById('analytics-table-body');
    if (tableBody) {
      tableBody.innerHTML = memberStats.map((stat: any) => `
        <tr>
          <td>${stat.user.name}</td>
          <td>${stat.user.role}</td>
          <td>${stat.uploads}</td>
          <td>${stat.tasksCompleted} / ${stat.tasksTotal}</td>
          <td>${stat.activityCount}</td>
        </tr>
      `).join('');
    }

    // Draw charts using Canvas API
    drawChart('chart-uploads', memberStats, 'uploads', 'File Uploads per Member', '#4f46e5');
    drawChart('chart-tasks', memberStats, 'tasksCompleted', 'Completed Tasks per Member', '#10b981');

  } catch (err: any) {
    console.error(err);
    alert(err.message || 'Failed to load analytics.');
  }
}

function drawChart(canvasId: string, data: any[], dataKey: string, title: string, color: string) {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;
  const padding = 40;

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  if (data.length === 0) {
    ctx.fillText('No data available', width / 2 - 40, height / 2);
    return;
  }

  const maxVal = Math.max(...data.map(d => d[dataKey]), 1); // Avoid div by 0
  const barWidth = (width - padding * 2) / data.length - 10;

  // Title
  ctx.fillStyle = '#111827';
  ctx.font = '16px Inter';
  ctx.fillText(title, padding, 20);

  // Draw axes
  ctx.beginPath();
  ctx.moveTo(padding, height - padding);
  ctx.lineTo(width - padding, height - padding);
  ctx.lineTo(width - padding, padding);
  ctx.strokeStyle = '#e5e7eb';
  ctx.stroke();

  // Draw bars
  data.forEach((item, i) => {
    const val = item[dataKey];
    const barHeight = (val / maxVal) * (height - padding * 2 - 20);
    const x = padding + 10 + i * (barWidth + 10);
    const y = height - padding - barHeight;

    ctx.fillStyle = color;
    ctx.fillRect(x, y, barWidth, barHeight);

    // Value label
    ctx.fillStyle = '#374151';
    ctx.font = '12px Inter';
    ctx.fillText(val.toString(), x + barWidth / 2 - 5, y - 5);

    // X-axis label (truncate long names)
    let name = item.user.name;
    if (name.length > 8) name = name.substring(0, 6) + '..';
    ctx.fillText(name, x + barWidth / 2 - 15, height - padding + 15);
  });
}

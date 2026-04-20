import { ApiClient } from './api.js';
import { User, ApiResponse } from './types.js';

export class AuthService {
  static isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  static getUser(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  static async logout(): Promise<void> {
    try {
      await ApiClient.post('/auth/logout', {});
    } catch (e) {
      console.error('Logout error', e);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/html/login.html';
    }
  }

  static checkAuth(): void {
    if (!this.isAuthenticated()) {
      window.location.href = '/html/login.html';
    }
  }

  static checkRole(allowedRoles: string[]): void {
    const user = this.getUser();
    if (!user || !allowedRoles.includes(user.role)) {
      alert('Access denied. You do not have permission to view this page.');
      window.location.href = '/html/dashboard.html';
    }
  }

  static setupLogoutButton(): void {
    const btn = document.getElementById('logout-btn');
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.logout();
      });
    }
  }

  static renderUserInfo(): void {
    const user = this.getUser();
    if (user) {
      const nameEl = document.getElementById('user-name');
      const roleEl = document.getElementById('user-role');
      if (nameEl) nameEl.textContent = user.name;
      if (roleEl) roleEl.textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
      
      // Hide faculty-only links for students
      if (user.role !== 'faculty') {
        const facultyLinks = document.querySelectorAll('.faculty-only');
        facultyLinks.forEach((el) => {
          (el as HTMLElement).style.display = 'none';
        });
      }
    }
  }
}

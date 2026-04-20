import { ApiClient } from './api.js';
export class AuthService {
    static isAuthenticated() {
        return !!localStorage.getItem('token');
    }
    static getUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }
    static async logout() {
        try {
            await ApiClient.post('/auth/logout', {});
        }
        catch (e) {
            console.error('Logout error', e);
        }
        finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/html/login.html';
        }
    }
    static checkAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = '/html/login.html';
        }
    }
    static checkRole(allowedRoles) {
        const user = this.getUser();
        if (!user || !allowedRoles.includes(user.role)) {
            alert('Access denied. You do not have permission to view this page.');
            window.location.href = '/html/dashboard.html';
        }
    }
    static setupLogoutButton() {
        const btn = document.getElementById('logout-btn');
        if (btn) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }
    }
    static renderUserInfo() {
        const user = this.getUser();
        if (user) {
            const nameEl = document.getElementById('user-name');
            const roleEl = document.getElementById('user-role');
            if (nameEl)
                nameEl.textContent = user.name;
            if (roleEl)
                roleEl.textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
            // Hide faculty-only links for students
            if (user.role !== 'faculty') {
                const facultyLinks = document.querySelectorAll('.faculty-only');
                facultyLinks.forEach((el) => {
                    el.style.display = 'none';
                });
            }
        }
    }
}

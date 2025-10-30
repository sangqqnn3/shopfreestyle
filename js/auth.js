// Authentication Manager
class Auth {
    constructor() {
        this.currentUser = this.getCurrentUser();
        this.init();
    }

    init() {
        // Check if user is logged in
        if (this.currentUser) {
            this.showLoggedInMenu(this.currentUser);
        } else {
            this.showLoginMenu();
        }
    }

    getCurrentUser() {
        const userId = localStorage.getItem('currentUserId');
        if (userId) {
            return db.getUserById(userId);
        }
        return null;
    }

    showLoggedInMenu(user) {
        document.getElementById('userMenu').classList.add('hidden');
        const loggedInMenu = document.getElementById('loggedInMenu');
        loggedInMenu.classList.remove('hidden');
        document.getElementById('userName').textContent = user.name || user.email;
        
        // Show admin link if user is admin
        if (user.role === 'admin') {
            document.getElementById('adminLink').classList.remove('hidden');
        }
    }

    showLoginMenu() {
        document.getElementById('userMenu').classList.remove('hidden');
        document.getElementById('loggedInMenu').classList.add('hidden');
    }

    login(email, password) {
        const user = db.getUserByEmail(email);
        if (!user) {
            return { success: false, message: 'User not found' };
        }
        
        // Simple password check (in production, use hashing)
        if (user.password !== password) {
            return { success: false, message: 'Invalid password' };
        }

        localStorage.setItem('currentUserId', user.id);
        this.currentUser = user;
        this.showLoggedInMenu(user);
        return { success: true, user: user };
    }

    register(userData) {
        // Check if email already exists
        if (db.getUserByEmail(userData.email)) {
            return { success: false, message: 'Email already registered' };
        }

        const newUser = db.addUser({
            name: userData.name,
            email: userData.email,
            password: userData.password,
            role: 'customer'
        });

        // Auto login after registration
        localStorage.setItem('currentUserId', newUser.id);
        this.currentUser = newUser;
        this.showLoggedInMenu(newUser);
        
        return { success: true, user: newUser };
    }

    logout() {
        localStorage.removeItem('currentUserId');
        this.currentUser = null;
        this.showLoginMenu();
        return true;
    }

    isLoggedIn() {
        return this.currentUser !== null;
    }

    isAdmin() {
        return this.currentUser && this.currentUser.role === 'admin';
    }
}

// Initialize auth
const auth = new Auth();

// User icon click handler
document.addEventListener('DOMContentLoaded', function() {
    const userIcon = document.getElementById('userIcon');
    const userDropdown = document.getElementById('userDropdown');
    const logoutBtn = document.getElementById('logoutBtn');

    if (userIcon) {
        userIcon.addEventListener('click', function(e) {
            e.stopPropagation();
            userDropdown.classList.toggle('hidden');
        });
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!userDropdown.contains(e.target) && !userIcon.contains(e.target)) {
            userDropdown.classList.add('hidden');
        }
    });

    // Logout handler
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            auth.logout();
            window.location.href = 'index.html';
        });
    }
});


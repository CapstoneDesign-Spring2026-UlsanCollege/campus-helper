/* ======================================================
   ULSAN COLLEGE CAMPUS HELPER - Enhanced Script
   Features: Login/Register/ForgotPw, Nav, Checklist,
             Scroll effects, Animations
   ====================================================== */

'use strict';

// ── Mock User DB (in-memory) ─────────────────────────
const USERS_KEY = 'campusHelperUsers';
const SESSION_KEY = 'campusHelperSession';
const CHECKLIST_KEY = 'campusHelperChecklist';

function getUsers() {
    const raw = localStorage.getItem(USERS_KEY);
    const users = raw ? JSON.parse(raw) : {};
    // Seed default demo user
    if (!users['student001']) {
        users['student001'] = { password: 'pass1234', name: 'Demo Student', email: 'demo@ulsan.ac.kr', dept: 'Computer Engineering' };
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
    return users;
}

function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getSession() {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
}

function saveSession(data) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(data));
}

function clearSession() {
    localStorage.removeItem(SESSION_KEY);
}

// ── Toast ─────────────────────────────────────────────
function showToast(msg, type = '') {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = 'toast show' + (type ? ' ' + type : '');
    clearTimeout(t._timer);
    t._timer = setTimeout(() => { t.className = 'toast'; }, 3000);
}

// ── Modal helpers ─────────────────────────────────────
function openModal() {
    const overlay = document.getElementById('loginOverlay');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    const first = overlay.querySelector('input, select');
    if (first) setTimeout(() => first.focus(), 150);
}

function closeModal() {
    document.getElementById('loginOverlay').classList.remove('open');
    document.body.style.overflow = '';
    clearAllErrors();
}

// ── Tab switching ─────────────────────────────────────
function switchTab(id) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

    const tabBtn = document.querySelector(`.tab-btn[data-tab="${id}"]`);
    const tabContent = document.getElementById('tab-' + id);
    if (tabBtn) tabBtn.classList.add('active');
    if (tabContent) tabContent.classList.add('active');
    clearAllErrors();
}

// ── Field validation helpers ──────────────────────────
function showFieldError(id, msg) {
    const el = document.getElementById(id + '-error');
    const input = document.getElementById(id);
    if (el) el.textContent = msg;
    if (input) input.classList.add('invalid');
}

function clearFieldError(id) {
    const el = document.getElementById(id + '-error');
    const input = document.getElementById(id);
    if (el) el.textContent = '';
    if (input) input.classList.remove('invalid');
}

function clearAllErrors() {
    document.querySelectorAll('.field-error').forEach(el => el.textContent = '');
    document.querySelectorAll('.input-wrapper input, .input-wrapper select').forEach(el => el.classList.remove('invalid'));
    ['loginErrorMsg', 'registerErrorMsg', 'forgotMsg'].forEach(id => {
        const el = document.getElementById(id);
        if (el) { el.className = el.className.replace(' show', ''); el.textContent = ''; }
    });
}

function showFormError(id, msg) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
}

// ── Login submit ──────────────────────────────────────
function handleLogin(e) {
    e.preventDefault();
    clearAllErrors();

    const id = document.getElementById('studentId').value.trim();
    const pw = document.getElementById('password').value;
    const remember = document.getElementById('rememberMe').checked;
    let valid = true;

    if (!id) { showFieldError('studentId', 'Student ID is required.'); valid = false; }
    if (!pw) { showFieldError('password', 'Password is required.'); valid = false; }
    if (!valid) return;

    // Simulate async login
    const btn = document.getElementById('loginBtn');
    btn.disabled = true;
    document.getElementById('btnSpinner').style.display = 'inline';
    btn.querySelector('.btn-text').textContent = 'Signing in…';

    setTimeout(() => {
        btn.disabled = false;
        document.getElementById('btnSpinner').style.display = 'none';
        btn.querySelector('.btn-text').textContent = 'Sign In';

        const users = getUsers();
        const user = users[id];

        if (!user || user.password !== pw) {
            showFormError('loginErrorMsg', '❌ Incorrect Student ID or password. Try: student001 / pass1234');
            document.getElementById('password').classList.add('invalid');
            return;
        }

        // Success
        saveSession({ id, name: user.name, dept: user.dept, remember });
        closeModal();
        updateAuthUI(user.name);
        showToast('👋 Welcome back, ' + user.name + '!', 'success');
    }, 900);
}

// ── Register submit ───────────────────────────────────
function handleRegister(e) {
    e.preventDefault();
    clearAllErrors();

    const name = document.getElementById('regName').value.trim();
    const id = document.getElementById('regStudentId').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const dept = document.getElementById('regDept').value;
    const pw = document.getElementById('regPw').value;
    let valid = true;

    if (!name) { showFieldError('regName', 'Full name is required.'); valid = false; }
    if (!id)   { showFieldError('regStudentId', 'Student ID is required.'); valid = false; }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showFieldError('regEmail', 'Enter a valid email address.'); valid = false;
    }
    if (!dept) { showFieldError('regDept', 'Please select your department.'); valid = false; }
    if (!pw || pw.length < 8) { showFieldError('regPw', 'Password must be at least 8 characters.'); valid = false; }
    if (!valid) return;

    const users = getUsers();
    if (users[id]) {
        showFieldError('regStudentId', 'This Student ID is already registered.');
        showFormError('registerErrorMsg', '⚠️ An account with this Student ID already exists.');
        return;
    }

    // Save & log in
    users[id] = { password: pw, name, email, dept };
    saveUsers(users);
    saveSession({ id, name, dept });
    closeModal();
    updateAuthUI(name);
    showToast('🎉 Account created! Welcome, ' + name + '!', 'success');
}

// ── Forgot password submit ────────────────────────────
function handleForgotPw(e) {
    e.preventDefault();
    clearAllErrors();

    const email = document.getElementById('resetEmail').value.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showFieldError('resetEmail', 'Enter a valid email address.');
        return;
    }

    const msgEl = document.getElementById('forgotMsg');
    msgEl.textContent = '✅ If an account exists for ' + email + ', a reset link has been sent. Please check your inbox.';
    msgEl.classList.add('show');
    document.getElementById('resetEmail').value = '';
}

// ── Auth UI update ────────────────────────────────────
function updateAuthUI(name) {
    const loginBtn = document.getElementById('loginNavBtn');
    const userArea = document.getElementById('userArea');
    const greeting = document.getElementById('userGreeting');

    if (name) {
        loginBtn.style.display = 'none';
        userArea.style.display = 'flex';
        greeting.textContent = '👤 ' + name.split(' ')[0];
    } else {
        loginBtn.style.display = 'inline-flex';
        userArea.style.display = 'none';
    }
}

// ── Password strength ─────────────────────────────────
function calcStrength(pw) {
    let score = 0;
    if (pw.length >= 8)  score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
}

// ── Navigation active link ────────────────────────────
function updateActiveNavLink() {
    const sections = document.querySelectorAll('.section, .hero');
    const navLinks = document.querySelectorAll('.nav-link');
    let current = 'home';

    sections.forEach(section => {
        if (window.pageYOffset >= section.offsetTop - 180) {
            current = section.getAttribute('id') || current;
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
            link.classList.add('active');
        }
    });
}

// ── Smooth scroll ─────────────────────────────────────
function initSmoothScroll() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.getElementById(this.getAttribute('href').substring(1));
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });

            // Close mobile menu
            const menu = document.getElementById('navMenu');
            if (menu.classList.contains('open')) menu.classList.remove('open');
        });
    });
}

// ── Checklist persistence ─────────────────────────────
function saveChecklistState() {
    const items = document.querySelectorAll('.checklist-item input[type="checkbox"]');
    const state = {};
    items.forEach((item, i) => { state[i] = item.checked; });
    localStorage.setItem(CHECKLIST_KEY, JSON.stringify(state));
}

function loadChecklistState() {
    const saved = localStorage.getItem(CHECKLIST_KEY);
    if (!saved) return;
    const state = JSON.parse(saved);
    document.querySelectorAll('.checklist-item input[type="checkbox"]').forEach((item, i) => {
        if (state[i]) {
            item.checked = true;
            applyChecklistStyle(item.parentElement, true);
        }
    });
}

function applyChecklistStyle(el, checked) {
    el.style.opacity = checked ? '0.55' : '1';
    el.style.textDecoration = checked ? 'line-through' : 'none';
}

// ── Card entrance animation ───────────────────────────
function animateCards() {
    if (!('IntersectionObserver' in window)) return;

    const cards = document.querySelectorAll(
        '.building-card, .canteen-card, .facility-card, .info-card, .contact-card, .tips-card, .note-card'
    );
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.45s ease, transform 0.45s ease';
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08 });

    cards.forEach(card => observer.observe(card));
}

// ── Main init ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {

    // Restore session
    const session = getSession();
    if (session && session.id) updateAuthUI(session.name);

    // Modal triggers
    const loginNavBtn  = document.getElementById('loginNavBtn');
    const heroLoginBtn = document.getElementById('heroLoginBtn');
    const modalClose   = document.getElementById('modalClose');
    const loginOverlay = document.getElementById('loginOverlay');

    loginNavBtn && loginNavBtn.addEventListener('click', openModal);
    heroLoginBtn && heroLoginBtn.addEventListener('click', openModal);
    modalClose && modalClose.addEventListener('click', closeModal);

    loginOverlay && loginOverlay.addEventListener('click', (e) => {
        if (e.target === loginOverlay) closeModal();
    });

    // Logout
    document.getElementById('logoutBtn') && document.getElementById('logoutBtn').addEventListener('click', () => {
        clearSession();
        updateAuthUI(null);
        showToast('👋 Logged out successfully.');
    });

    // Tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // Forgot password link
    document.getElementById('forgotLink') && document.getElementById('forgotLink').addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        document.getElementById('tab-forgot').classList.add('active');
        clearAllErrors();
    });

    // Back to login
    document.getElementById('backToLogin') && document.getElementById('backToLogin').addEventListener('click', () => {
        switchTab('login');
    });

    // Form submissions
    document.getElementById('loginForm')    && document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm') && document.getElementById('registerForm').addEventListener('submit', handleRegister);
    document.getElementById('forgotForm')   && document.getElementById('forgotForm').addEventListener('submit', handleForgotPw);

    // Password show/hide
    const togglePw = document.getElementById('togglePw');
    const pwInput  = document.getElementById('password');
    if (togglePw && pwInput) {
        togglePw.addEventListener('click', () => {
            const shown = pwInput.type === 'text';
            pwInput.type = shown ? 'password' : 'text';
            document.getElementById('eyeIcon').innerHTML = shown
                ? '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>'
                : '<path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>';
        });
    }

    // Password strength meter
    const regPw = document.getElementById('regPw');
    if (regPw) {
        regPw.addEventListener('input', () => {
            const score = calcStrength(regPw.value);
            const fill  = document.getElementById('strengthFill');
            const label = document.getElementById('strengthLabel');
            const pct   = (score / 5) * 100;
            const colors = ['#e53e3e','#dd6b20','#ecc94b','#48bb78','#38a169'];
            const labels = ['Weak','Fair','Good','Strong','Very Strong'];
            fill.style.width = pct + '%';
            fill.style.background = colors[Math.min(score - 1, 4)] || '#e53e3e';
            label.textContent = score > 0 ? labels[Math.min(score - 1, 4)] : 'Strength';
        });
    }

    // Clear field errors on input
    document.querySelectorAll('.input-wrapper input, .input-wrapper select').forEach(el => {
        el.addEventListener('input', () => {
            el.classList.remove('invalid');
            const errEl = document.getElementById(el.id + '-error');
            if (errEl) errEl.textContent = '';
        });
    });

    // Escape key closes modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });

    // Hamburger menu
    const hamburger = document.getElementById('hamburger');
    const navMenu   = document.getElementById('navMenu');
    hamburger && hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('open');
    });

    // Smooth scroll
    initSmoothScroll();

    // Checklist
    document.querySelectorAll('.checklist-item input[type="checkbox"]').forEach(item => {
        item.addEventListener('change', function () {
            applyChecklistStyle(this.parentElement, this.checked);
            saveChecklistState();
        });
    });
    loadChecklistState();

    // Card animations
    animateCards();

    // Scroll: navbar shadow + active link
    window.addEventListener('scroll', () => {
        const navbar = document.getElementById('navbar');
        if (navbar) {
            navbar.classList.toggle('scrolled', window.pageYOffset > 60);
        }
        updateActiveNavLink();
    });

    // Print buttons
    document.querySelectorAll('.print-btn').forEach(btn => btn.addEventListener('click', () => window.print()));

    console.log('%c🎓 Welcome to Ulsan College Campus Helper!', 'font-size: 16px; color: #1a4080; font-weight: bold;');
    console.log('%cVersion 2.0 | Spring 2026 Capstone Design', 'font-size: 12px; color: #e9a825;');
});
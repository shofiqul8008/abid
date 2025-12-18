// Mobile Menu Toggle
const menuToggle = document.getElementById('menuToggle');
const mobileNav = document.getElementById('mobileNav');
const overlay = document.getElementById('overlay');
const scrollToTop = document.getElementById('scrollToTop');

// Toggle mobile menu - Fast transition
menuToggle.addEventListener('click', function() {
    this.classList.toggle('active');
    mobileNav.classList.toggle('active');
    overlay.classList.toggle('active');
    document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
});

// Close mobile menu when clicking on overlay
overlay.addEventListener('click', function() {
    menuToggle.classList.remove('active');
    mobileNav.classList.remove('active');
    this.classList.remove('active');
    document.body.style.overflow = '';
});

// Close mobile menu when clicking on a link
const mobileLinks = document.querySelectorAll('.mobile-nav a, .mobile-website-link');
mobileLinks.forEach(link => {
    link.addEventListener('click', function() {
        // Only close menu if it's not an external contact link
        if (!this.getAttribute('href').includes('content/contact/contact.html')) {
            menuToggle.classList.remove('active');
            mobileNav.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
});

// Scroll to Top functionality
window.addEventListener('scroll', function() {
    if (window.pageYOffset > 300) {
        scrollToTop.classList.add('visible');
    } else {
        scrollToTop.classList.remove('visible');
    }
});

scrollToTop.addEventListener('click', function() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Dark/Light Mode Toggle
const themeToggle = document.getElementById('themeToggle');
const mobileThemeToggle = document.getElementById('mobileThemeToggle');
const body = document.body;

// Check for saved theme preference or default to dark
const currentTheme = localStorage.getItem('theme') || 'dark';
body.setAttribute('data-theme', currentTheme);

function toggleTheme() {
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

themeToggle.addEventListener('click', toggleTheme);
mobileThemeToggle.addEventListener('click', toggleTheme);

// Enable text selection
document.body.style.userSelect = 'text';
document.body.style.webkitUserSelect = 'text';
document.body.style.mozUserSelect = 'text';
document.body.style.msUserSelect = 'text';

// Enable right-click
document.addEventListener('contextmenu', function(e) {
    // Allow right-click
});

// Enable drag and drop for images
document.addEventListener('dragstart', function(e) {
    // Allow drag and drop
});

// Enable keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Allow all keyboard shortcuts
});


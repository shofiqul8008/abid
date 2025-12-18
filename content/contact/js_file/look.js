
// DOM Ready check
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded - initializing scripts');
    
    // Get all DOM elements
    const menuToggle = document.getElementById('menuToggle');
    const mobileNav = document.getElementById('mobileNav');
    const overlay = document.getElementById('overlay');
    const scrollToTop = document.getElementById('scrollToTop');
    const themeToggle = document.getElementById('themeToggle');
    const mobileThemeToggle = document.getElementById('mobileThemeToggle');
    const body = document.body;
    
    // Debug logging
    console.log('Elements found:', {
        menuToggle: menuToggle ? 'Yes' : 'No',
        mobileNav: mobileNav ? 'Yes' : 'No',
        overlay: overlay ? 'Yes' : 'No',
        scrollToTop: scrollToTop ? 'Yes' : 'No',
        themeToggle: themeToggle ? 'Yes' : 'No',
        mobileThemeToggle: mobileThemeToggle ? 'Yes' : 'No'
    });
    
    // ========== MOBILE MENU FUNCTIONALITY ==========
    if (menuToggle && mobileNav && overlay) {
        console.log('Mobile menu elements found, adding event listeners');
        
        // Toggle mobile menu
        menuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            console.log('Menu toggle clicked - current state:', this.classList.contains('active'));
            
            const isActive = this.classList.contains('active');
            
            if (!isActive) {
                // Open menu
                this.classList.add('active');
                mobileNav.classList.add('active');
                overlay.classList.add('active');
                document.body.style.overflow = 'hidden';
                console.log('Menu opened');
            } else {
                // Close menu
                this.classList.remove('active');
                mobileNav.classList.remove('active');
                overlay.classList.remove('active');
                document.body.style.overflow = '';
                console.log('Menu closed');
            }
        });
        
        // Close mobile menu when clicking on overlay
        overlay.addEventListener('click', function() {
            console.log('Overlay clicked, closing menu');
            menuToggle.classList.remove('active');
            mobileNav.classList.remove('active');
            this.classList.remove('active');
            document.body.style.overflow = '';
        });
        
        // Close mobile menu when clicking on a link
        const mobileLinks = document.querySelectorAll('.mobile-nav a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                // Don't prevent default for external links
                if (this.getAttribute('href') === 'https://shofiqul8008.github.io/profile/') {
                    e.preventDefault();
                    // Add a small delay before navigation
                    setTimeout(() => {
                        window.location.href = 'https://shofiqul8008.github.io/profile/';
                    }, 300);
                }
                
                console.log('Mobile link clicked, closing menu');
                menuToggle.classList.remove('active');
                mobileNav.classList.remove('active');
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
        
        // Close menu when pressing ESC key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && mobileNav.classList.contains('active')) {
                console.log('ESC pressed, closing menu');
                menuToggle.classList.remove('active');
                mobileNav.classList.remove('active');
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
        
        // Close menu when clicking outside on mobile
        document.addEventListener('click', function(e) {
            if (mobileNav.classList.contains('active') && 
                !mobileNav.contains(e.target) && 
                !menuToggle.contains(e.target)) {
                console.log('Clicked outside, closing menu');
                menuToggle.classList.remove('active');
                mobileNav.classList.remove('active');
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    } else {
        console.error('Some mobile menu elements are missing:');
        if (!menuToggle) console.error('menuToggle not found');
        if (!mobileNav) console.error('mobileNav not found');
        if (!overlay) console.error('overlay not found');
    }
    
    // ========== SCROLL TO TOP FUNCTIONALITY ==========
    if (scrollToTop) {
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
    }
    
    // ========== THEME TOGGLE FUNCTIONALITY ==========
    // Check for saved theme preference or default to dark
    const savedTheme = localStorage.getItem('theme');
    const currentTheme = savedTheme || 'dark';
    
    if (currentTheme === 'light') {
        body.setAttribute('data-theme', 'light');
        console.log('Theme set to: light');
    } else {
        body.setAttribute('data-theme', 'dark');
        console.log('Theme set to: dark');
    }
    
    // Theme toggle function
    function toggleTheme() {
        const currentTheme = body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        console.log('Toggling theme from', currentTheme, 'to', newTheme);
        
        body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    }
    
    // Add event listeners to theme toggles
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    if (mobileThemeToggle) {
        mobileThemeToggle.addEventListener('click', function() {
            toggleTheme();
            // Optional: Close mobile menu after changing theme
            if (menuToggle && mobileNav && overlay) {
                menuToggle.classList.remove('active');
                mobileNav.classList.remove('active');
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
    
    // ========== ENABLE USER INTERACTIONS ==========
    // Enable text selection
    document.body.style.userSelect = 'text';
    document.body.style.webkitUserSelect = 'text';
    document.body.style.mozUserSelect = 'text';
    document.body.style.msUserSelect = 'text';
    
    console.log('All scripts initialized successfully');
});






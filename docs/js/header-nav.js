// Header Navigation Functionality

document.addEventListener('DOMContentLoaded', function() {
    // Get navigation elements
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('[data-nav-planet]');
    
    // Handle legacy site navigation explicitly
    const legacyLink = document.getElementById('legacy-site-link');
    if (legacyLink) {
        legacyLink.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent default to handle it ourselves
            
            // Close mobile menu if open
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                
                // Reset hamburger icon
                const spans = navToggle.querySelectorAll('span');
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
            
            // Navigate to the legacy site (Jekyll GitHub Pages site)
            window.location.href = 'https://advikara.github.io';
        });
    }
    
    // Toggle mobile menu
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            
            // Animate hamburger to X
            const spans = navToggle.querySelectorAll('span');
            if (navLinks.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 6px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(5px, -6px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
    }
    
    // Handle navigation clicks
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get the planet name from data attribute
            const planetName = this.getAttribute('data-nav-planet');
            
            // Close mobile menu if open
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                
                // Reset hamburger icon
                const spans = navToggle.querySelectorAll('span');
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
            
            // Navigate to the planet using the existing navigateToPlanet function
            if (typeof window.navigateToPlanet === 'function') {
                window.navigateToPlanet(planetName);
            } else {
                console.error('navigateToPlanet function not found');
            }
        });
    });
    
    // Update active navigation item based on current planet
    // This function can be called from the main script when changing planets
    window.updateNavActive = function(planetName) {
        navItems.forEach(item => {
            const itemPlanet = item.getAttribute('data-nav-planet');
            if (itemPlanet === planetName) {
                item.classList.add('active');
                // Also add active class to the anchor tag
                const anchor = item.tagName === 'A' ? item : item.querySelector('a');
                if (anchor) anchor.classList.add('active');
            } else {
                item.classList.remove('active');
                // Also remove active class from the anchor tag
                const anchor = item.tagName === 'A' ? item : item.querySelector('a');
                if (anchor) anchor.classList.remove('active');
            }
        });
    };
    
    // Hide header when scrolling down, show when scrolling up
    let lastScrollTop = 0;
    const header = document.querySelector('.nav-header');
    
    window.addEventListener('scroll', function() {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop) {
            // Scrolling down
            header.style.transform = 'translateY(-100%)';
        } else {
            // Scrolling up
            header.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
    });
});

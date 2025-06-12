document.addEventListener('DOMContentLoaded', () => {
    // Get all sections and navigation elements
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-link');
    const progressIndicators = document.querySelectorAll('.progress-indicator');
    
    // Set up Intersection Observer to detect when sections are in view
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // When a section comes into view
            if (entry.isIntersecting) {
                const currentSection = entry.target;
                const sectionId = currentSection.getAttribute('id');
                
                // Add visible class for animation
                currentSection.classList.add('visible');
                
                // Update navigation
                updateNavigation(sectionId);
                
                // Update progress indicators
                updateProgressIndicators(sectionId);
            }
        });
    }, observerOptions);
    
    // Observe all sections
    sections.forEach(section => {
        observer.observe(section);
    });
    
    // Function to update navigation active state
    function updateNavigation(sectionId) {
        navLinks.forEach(link => {
            // Remove active class from all links
            link.classList.remove('active');
            
            // Add active class to the current section's link
            if (link.getAttribute('href') === `#${sectionId}`) {
                link.classList.add('active');
            }
        });
    }
    
    // Function to update progress indicators
    function updateProgressIndicators(sectionId) {
        progressIndicators.forEach(indicator => {
            // Remove active class from all indicators
            indicator.classList.remove('active');
            
            // Add active class to the current section's indicator
            if (indicator.getAttribute('data-section') === sectionId) {
                indicator.classList.add('active');
            }
        });
    }
    
    // Handle navigation click events
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            // Smooth scroll to the target section
            window.scrollTo({
                top: targetSection.offsetTop - 100, // Offset for header
                behavior: 'smooth'
            });
        });
    });
    
    // Handle progress indicator click events
    progressIndicators.forEach(indicator => {
        indicator.addEventListener('click', () => {
            const targetId = indicator.getAttribute('data-section');
            const targetSection = document.getElementById(targetId);
            
            // Smooth scroll to the target section
            window.scrollTo({
                top: targetSection.offsetTop - 100, // Offset for header
                behavior: 'smooth'
            });
        });
    });
    
    // Initially set the first section as visible
    if (sections.length > 0) {
        sections[0].classList.add('visible');
    }
});

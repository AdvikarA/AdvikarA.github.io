// Sidebar navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    const sections = document.querySelectorAll('section');
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    // Set the first item as active by default
    timelineItems[0].classList.add('active');
    
    // Add click event listeners to timeline items
    timelineItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetSection = item.getAttribute('data-section');
            const targetElement = document.getElementById(targetSection) || 
                                 document.querySelector(`.${targetSection}`);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 100,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Update active state on scroll
    window.addEventListener('scroll', () => {
        let current = '';
        const scrollPosition = window.scrollY + 300;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                const sectionId = section.getAttribute('id') || section.classList[0];
                current = sectionId;
            }
        });
        
        timelineItems.forEach(item => {
            item.classList.remove('active');
            const itemSection = item.getAttribute('data-section');
            
            if (itemSection === current) {
                item.classList.add('active');
            }
        });
    });
    
    // Trigger scroll event once to set the active state initially
    window.dispatchEvent(new Event('scroll'));
});

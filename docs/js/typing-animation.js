// Typing Animation Script

// Initialize the animation when the panel becomes visible
function initTypingAnimation() {
    console.log('Initializing typing animation');
    // Animate the massive name
    const nameElement = document.getElementById('massive-name');
    if (!nameElement) {
        console.error('Could not find massive-name element');
        return;
    }
    
    // Reset animation state
    const nameLetters = nameElement.querySelectorAll('span');
    nameLetters.forEach(letter => {
        letter.style.opacity = '0';
        letter.style.transform = 'translateY(20px)';
    });
    
    // Force a reflow to ensure animations restart
    void nameElement.offsetWidth;
    
    // Staggered animation for each letter
    nameLetters.forEach((letter, index) => {
        letter.style.animationName = 'fadeInUp';
        letter.style.animationDuration = '0.5s';
        letter.style.animationDelay = `${index * 0.15}s`;
    });
    
    // Set the name element to be visible after all letters are animated
    setTimeout(() => {
        nameElement.style.opacity = '1';
    }, 100);
    
    // Typing animation for cycling text
    const typedTextElement = document.getElementById('typed-text');
    const textOptions = [
        "a developer",
        "your favorite coder's favorite coder",
        "confused",
        "a wannabe start up founder",
        "unemployed"
    ];
    
    let currentTextIndex = 0;
    let currentCharIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100; // Base typing speed in ms
    
    function typeText() {
        const currentText = textOptions[currentTextIndex];
        
        if (isDeleting) {
            // Deleting text
            typedTextElement.textContent = currentText.substring(0, currentCharIndex - 1);
            currentCharIndex--;
            typingSpeed = 50; // Faster when deleting
        } else {
            // Typing text
            typedTextElement.textContent = currentText.substring(0, currentCharIndex + 1);
            currentCharIndex++;
            typingSpeed = 100; // Normal speed when typing
        }
        
        // Add/remove typing class for cursor animation
        if (currentCharIndex === currentText.length && !isDeleting) {
            typedTextElement.classList.remove('typing');
            // Pause at the end of typing
            typingSpeed = 2000; // Wait 2 seconds before deleting
            isDeleting = true;
        } else if (currentCharIndex === 0 && isDeleting) {
            typedTextElement.classList.add('typing');
            isDeleting = false;
            // Move to next text option
            currentTextIndex = (currentTextIndex + 1) % textOptions.length;
            // Pause before typing next option
            typingSpeed = 500;
        }
        
        // Continue the typing animation
        setTimeout(typeText, typingSpeed);
    }
    
    // Start the typing animation after the name animation completes
    setTimeout(() => {
        if (typedTextElement) {
            typedTextElement.classList.add('typing');
            typeText();
        }
    }, nameLetters.length * 150 + 500); // Wait for name animation plus a little extra
}

// Run the animation when the document is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, checking for home panel visibility');
    // Check if the home panel is visible
    const homePanel = document.querySelector('.home-panel');
    if (homePanel && homePanel.classList.contains('active')) {
        console.log('Home panel is active, initializing animation');
        setTimeout(initTypingAnimation, 500); // Delay to ensure DOM is fully ready
    }
    
    // Also initialize when navigating to the home planet
    const homePlanetLink = document.querySelector('li[data-planet="home"]');
    if (homePlanetLink) {
        homePlanetLink.addEventListener('click', function() {
            console.log('Home planet clicked, initializing animation');
            setTimeout(initTypingAnimation, 800); // Wait for panel transition
        });
    }
    
    // Add a global function to reset and start the animation
    window.resetAndStartTypingAnimation = function() {
        console.log('Resetting and starting typing animation');
        // Stop any existing animation
        const typedTextElement = document.getElementById('typed-text');
        if (typedTextElement) {
            typedTextElement.textContent = '';
        }
        // Restart the animation
        setTimeout(initTypingAnimation, 300);
    };
});

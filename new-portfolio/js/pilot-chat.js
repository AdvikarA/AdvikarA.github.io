// Pilot chat bubble functionality
// Wait for the document to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    const chatBubble = document.getElementById('pilot-chat-bubble');
    const typewriterElement = document.getElementById('typewriter');
    const pilotChatButton = document.getElementById('pilot-chat-button');
    
    // Array of pilot messages
    const pilotMessages = [
        "Ummm... I don't think this solar system follows any of newton's or kepler's laws....",
        "Are we there yet?",
        "Yo who is driving this thing",
        "Something something AI something something vibe coded *mumble mumble*",
        "Cross cross tween spin moveee pump fake spin step through lay meeee",
        "ngl ts pmo just hire me"
    ];
    
    let currentMessageIndex = 0;
    let isTyping = false;
    let typingTimeout;
    let displayTimeout;
    let currentCharIndex = 0;
    let inPlanetView = false; // Track if user is visiting a planet
    
    // Function to show the chat bubble
    function showChatBubble() {
        // Don't show if we're in planet view
        if (isInPlanetView()) {
            alert('Pilot is busy navigating around this planet. Try again when back in space!');
            return;
        }
        
        // Set the message text directly (no typing animation)
        typewriterElement.textContent = pilotMessages[currentMessageIndex];
        
        // Make bubble visible with fade in
        chatBubble.style.display = 'block';
        setTimeout(() => {
            chatBubble.classList.add('visible');
        }, 10);
        
        // Set timeout to hide the bubble after a few seconds
        displayTimeout = setTimeout(() => {
            hideChatBubble();
        }, 8000); // Show for 8 seconds
        
        // Move to next message for next time
        currentMessageIndex = (currentMessageIndex + 1) % pilotMessages.length;
    }
    
    // Function to hide the chat bubble
    function hideChatBubble() {
        chatBubble.classList.remove('visible');
        clearTimeout(typingTimeout);
        clearTimeout(displayTimeout);
        isTyping = false;
        
        // Hide after transition
        setTimeout(() => {
            chatBubble.style.display = 'none';
        }, 300);
    }
    
    // No longer needed - we're using fade in instead of typewriter effect
    
    // Make the chat bubble clickable
    chatBubble.addEventListener('click', () => {
        hideChatBubble();
    });
    
    // Function to check if we're in planet view
    function isInPlanetView() {
        // Check if planet info popup is visible
        const planetInfoPopup = document.querySelector('.planet-info-popup');
        const exitButton = document.getElementById('exit-planet-view');
        
        if ((planetInfoPopup && window.getComputedStyle(planetInfoPopup).display !== 'none' && 
             window.getComputedStyle(planetInfoPopup).opacity > 0.1) ||
            document.body.classList.contains('in-planet-view') ||
            (exitButton && window.getComputedStyle(exitButton).display !== 'none')) {
            return true;
        }
        return false;
    }
    
    // Add click event to the pilot chat button
    pilotChatButton.addEventListener('click', function() {
        // Show a new message
        showChatBubble();
    });
    
    // Make the chat bubble clickable to dismiss it
    chatBubble.addEventListener('click', function() {
        hideChatBubble();
    });
    
    // Add a pulsing effect to the button occasionally to draw attention
    function addPulseEffect() {
        // Add pulse class
        pilotChatButton.classList.add('pulse');
        
        // Remove after 3 seconds
        setTimeout(() => {
            pilotChatButton.classList.remove('pulse');
        }, 3000);
        
        // Schedule next pulse in 30-60 seconds
        setTimeout(addPulseEffect, 30000 + Math.random() * 30000);
    }
    
    // Start the pulse effect after a delay
    setTimeout(addPulseEffect, 15000);
    
    // Check planet view status periodically to hide chat if needed
    function checkPlanetView() {
        // Update the planet view status
        inPlanetView = isInPlanetView();
        
        // If in planet view and chat is visible, hide it
        if (inPlanetView && chatBubble.classList.contains('visible')) {
            hideChatBubble();
        }
    }
    
    // Check planet view status periodically
    setInterval(checkPlanetView, 500);
    
    // Also check when window is resized
    window.addEventListener('resize', checkPlanetView);
    
    console.log('Pilot chat initialized');
});

// Initialize VANTA.NET background effect
document.addEventListener('DOMContentLoaded', function() {
  VANTA.NET({
    el: "#background",
    mouseControls: true,
    touchControls: true,
    gyroControls: false,
    minHeight: 200.00,
    minWidth: 200.00,
    scale: 1.00,
    scaleMobile: 1.00,
    color: 0xffffff,      // White lines
    backgroundColor: 0x000000, // Black background
    points: 8.00,        // Fewer points for minimalist look
    maxDistance: 20.00,  // Shorter connections
    spacing: 25.00,      // More space between points
    showDots: true,          // Show connection points
    mouseEase: true,         // Enable smooth mouse following
    mouseCoeffX: 0.7,        // Horizontal sensitivity to mouse
    mouseCoeffY: 0.7         // Vertical sensitivity to mouse
  });
  
  // Add additional mousemove event listener for more responsive movement
  document.addEventListener('mousemove', function(event) {
    if (window._vantaEffect && window._vantaEffect.onMouseMove) {
      const x = event.clientX / window.innerWidth;
      const y = event.clientY / window.innerHeight;
      window._vantaEffect.onMouseMove(x, y);
    }
  });
});

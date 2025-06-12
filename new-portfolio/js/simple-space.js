import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/loaders/GLTFLoader.js';
import { gsap } from 'https://cdn.skypack.dev/gsap@3.9.1';
import { createSun, createOrbitLine, setupOrbitalMovement, updateOrbits, updateMinimap } from './orbit-system.js';
import { EffectComposer } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/postprocessing/UnrealBloomPass.js';

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000814);

// Listen for navigation requests from header-nav.js
document.addEventListener('requestPlanetNavigation', function(event) {
    const planetName = event.detail.planet;
    if (typeof window.navigateToPlanet === 'function') {
        window.navigateToPlanet(planetName);
    }
});

// Loading screen handling
document.addEventListener('DOMContentLoaded', () => {
    // Hide loading screen after a delay AND once DOM is ready
    setTimeout(() => {
        const loadingScreen = document.querySelector('.loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
        // Don't show info panel yet - it will be shown after welcome popup is closed
    }, 1000); // Keep the 1s delay for loading screen aesthetics
});

let welcomePopupShown = false;
// Create planets
const planets = {};

// Create a sun at the center
const sun = createSun(scene);

// Create orbit lines
const orbitLines = [];
const orbitRadii = [40, 60, 80, 100, 120, 140];
orbitRadii.forEach(radius => {
    const orbitLine = createOrbitLine(radius, scene);
    orbitLines.push(orbitLine);
});

/**
 * Calculates the position of an object in orbit
 * @param {THREE.Vector3} centerPosition - Center of the orbit
 * @param {number} radius - Radius of the orbit
 * @param {number} angle - Current angle in radians
 * @returns {THREE.Vector3} - The calculated position
 */
function calculateOrbitalPosition(centerPosition, radius, angle) {
    const x = centerPosition.x + radius * Math.cos(angle);
    const y = 0; // Keep all planets at y=0 (coplanar)
    const z = centerPosition.z + radius * Math.sin(angle);
    return new THREE.Vector3(x, y, z);
}

/**
 * Creates particle effects for collisions
 * @param {THREE.Vector3} position - Position of the collision
 * @param {number} color - Color of particles in hex format
 * @param {number} count - Number of particles to generate
 * @param {number} duration - Duration of the effect in milliseconds
 * @returns {THREE.Points} - The particle system
 */
function createCollisionParticles(position, color = 0xffffff, count = 50, duration = 1000) {
    // Create particle geometry
    const particlesGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(count * 3);
    const particleSizes = new Float32Array(count);
    const particleColors = new Float32Array(count * 3);
    
    // Set random positions in a sphere around the collision point
    for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        // Random direction
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        const radius = Math.random() * 2;
        
        // Convert spherical to cartesian coordinates
        particlePositions[i3] = position.x + radius * Math.sin(phi) * Math.cos(theta);
        particlePositions[i3 + 1] = position.y + radius * Math.sin(phi) * Math.sin(theta);
        particlePositions[i3 + 2] = position.z + radius * Math.cos(phi);
        
        // Random sizes
        particleSizes[i] = Math.random() * 0.3 + 0.1;
        
        // Set colors with slight variation
        const r = ((color >> 16) & 255) / 255;
        const g = ((color >> 8) & 255) / 255;
        const b = (color & 255) / 255;
        
        // Add some variation to the color
        particleColors[i3] = r * (0.8 + Math.random() * 0.4);
        particleColors[i3 + 1] = g * (0.8 + Math.random() * 0.4);
        particleColors[i3 + 2] = b * (0.8 + Math.random() * 0.4);
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particlesGeometry.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));
    
    // Create particle material with glow effect
    const particleMaterial = new THREE.PointsMaterial({
        size: 0.5,
        transparent: true,
        opacity: 1,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
        depthWrite: false
    });
    
    // Create the particle system
    const particleSystem = new THREE.Points(particlesGeometry, particleMaterial);
    
    // Add velocities for animation
    particleSystem.userData.velocities = [];
    for (let i = 0; i < count; i++) {
        // Random velocity in all directions
        particleSystem.userData.velocities.push({
            x: (Math.random() - 0.5) * 0.2,
            y: (Math.random() - 0.5) * 0.2,
            z: (Math.random() - 0.5) * 0.2
        });
    }
    
    // Add to scene
    scene.add(particleSystem);
    
    // Set up animation
    const startTime = Date.now();
    const animate = () => {
        const positions = particleSystem.geometry.attributes.position.array;
        const sizes = particleSystem.geometry.attributes.size.array;
        const colors = particleSystem.geometry.attributes.color.array;
        const elapsedTime = Date.now() - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        
        // Update positions based on velocities
        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            positions[i3] += particleSystem.userData.velocities[i].x;
            positions[i3 + 1] += particleSystem.userData.velocities[i].y;
            positions[i3 + 2] += particleSystem.userData.velocities[i].z;
            
            // Fade out particles
            sizes[i] *= 0.98;
            colors[i3 + 0] *= 0.99;
            colors[i3 + 1] *= 0.99;
            colors[i3 + 2] *= 0.99;
        }
        
        particleSystem.geometry.attributes.position.needsUpdate = true;
        particleSystem.geometry.attributes.size.needsUpdate = true;
        particleSystem.geometry.attributes.color.needsUpdate = true;
        
        // Fade out material opacity
        particleSystem.material.opacity = 1 - progress;
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            // Remove from scene when animation is complete
            scene.remove(particleSystem);
            particleSystem.geometry.dispose();
            particleSystem.material.dispose();
        }
    };
    
    // Start animation
    animate();
    
    return particleSystem;
}

/**
 * Creates ambient particle effects around a planet
 * @param {THREE.Mesh} planet - The planet mesh
 * @param {number} color - Color of particles in hex format
 * @param {number} count - Number of particles to generate
 * @param {number} size - Size of each particle
 * @param {number} speed - Animation speed of particles
 * @returns {THREE.Points} - The particle system
 */
function createPlanetParticles(planet, color, count = 50, size = 0.1, speed = 0.02) {
    // Create particle geometry
    const particlesGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(count * 3);
    
    // Create particle material with glow effect
    const particleMaterial = new THREE.PointsMaterial({
        color: color,
        size: size,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true
    });
    
    // Calculate planet radius (assuming it's a sphere)
    const planetRadius = planet.geometry.parameters.radius;
    
    // Create particles in a sphere around the planet
    for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const radius = planetRadius * 1.2 + Math.random() * planetRadius * 0.5;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        
        // Convert spherical to cartesian coordinates
        particlePositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
        particlePositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        particlePositions[i3 + 2] = radius * Math.cos(phi);
    }
    
    // Add positions attribute to geometry
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    
    // Create the particle system
    const particleSystem = new THREE.Points(particlesGeometry, particleMaterial);
    
    // Store original positions for animation
    particleSystem.userData.originalPositions = particlePositions.slice();
    particleSystem.userData.speed = speed;
    particleSystem.userData.time = 0;
    
    // Add the particle system to the planet
    planet.add(particleSystem);
    
    return particleSystem;
}

/**
 * Clears all running typing animations and their timers
 */
function clearTypingAnimations() {
    // Find all typing animation elements
    const typedTextElements = document.querySelectorAll('.typed-text');
    const nameElements = document.querySelectorAll('.massive-name span');
    
    // Clear classes and content
    typedTextElements.forEach(element => {
        element.textContent = '';
        element.classList.remove('typing');
    });
    
    nameElements.forEach(element => {
        element.classList.remove('visible');
    });
    
    // Clear any running timers
    const timers = window.setTimeout(function() {}, 0);
    for (let i = 0; i <= timers; i++) {
        window.clearTimeout(i);
    }
}

/**
 * Creates a text label for a planet
 * @param {string} name - Name of the planet
 * @param {THREE.Vector3} position - Position for the label
 * @param {boolean} isProjectPlanet - Whether this is a project planet
 * @returns {THREE.Object3D} - The label object
 */
function createPlanetLabel(name, position, isProjectPlanet = false) {
    // Create canvas for the label
    const canvas = document.createElement('canvas');
    canvas.width = 512; // Increased width to 512 to ensure text doesn't get cut off
    canvas.height = 160; // Increased height for better spacing
    const context = canvas.getContext('2d');
    
    // Set background to transparent
    context.fillStyle = 'rgba(0, 0, 0, 0)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw text - use different font sizes for main planets vs project planets
    if (isProjectPlanet) {
        context.font = 'bold 30px Orbitron, Arial'; // Smaller font for project planets
    } else {
        context.font = 'bold 42px Orbitron, Arial'; // Slightly larger font for main planets
    }
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    
    // Add letter spacing by drawing each character individually
    const letters = name.toUpperCase().split('');
    const letterSpacing = isProjectPlanet ? 3 : 5; // More spacing for main planets
    
    // Create gradient for text
    const gradient = context.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, '#5d9cec');
    gradient.addColorStop(0.5, '#ffffff');
    gradient.addColorStop(1, '#5d9cec');
    context.fillStyle = gradient;
    
    // Add glow effect
    context.shadowColor = '#5d9cec';
    context.shadowBlur = 15;
    
    // Calculate total width of text with spacing
    let totalWidth = 0;
    for (let i = 0; i < letters.length; i++) {
        totalWidth += context.measureText(letters[i]).width + (i < letters.length - 1 ? letterSpacing : 0);
    }
    
    // Start position for drawing text
    let x = (canvas.width - totalWidth) / 2;
    
    // Draw each letter with spacing
    for (let i = 0; i < letters.length; i++) {
        context.fillText(letters[i], x + context.measureText(letters[i]).width / 2, canvas.height / 2);
        x += context.measureText(letters[i]).width + letterSpacing;
    }
    
    // Create texture from canvas
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    
    // Create sprite material
    const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthTest: false
    });
    
    // Create sprite - use different scales for main planets vs project planets
    const sprite = new THREE.Sprite(material);
    if (isProjectPlanet) {
        sprite.scale.set(6, 3, 1); // Smaller scale for project planets
        sprite.position.copy(position);
        sprite.position.y += 6; // Smaller vertical offset for project planets
    } else {
        sprite.scale.set(8, 4, 1); // Original larger scale for main planets
        sprite.position.copy(position);
        sprite.position.y += 8; // Original larger vertical offset for main planets
    }
    
    // Add to scene
    scene.add(sprite);
    
    return sprite;
}

// Load textures for planets
const textureLoader = new THREE.TextureLoader();

// Home planet - Earth-like with oceans and atmosphere
const homePlanetGeometry = new THREE.IcosahedronGeometry(5, 1); // Low-poly triangular geometry

// Create a simple material with good color for Earth
const homePlanetMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x2980b9,
    roughness: 0.5,
    metalness: 0.2,
    clearcoat: 0.3,
    clearcoatRoughness: 0.25,
    envMapIntensity: 1.0,
    emissive: 0x0984e3,
    emissiveIntensity: 0.2,
    flatShading: true // Enable flat shading for low-poly look
});

// Create a simple canvas texture for Earth with land and water
const earthCanvas = document.createElement('canvas');
const earthContext = earthCanvas.getContext('2d');
earthCanvas.width = 512;
earthCanvas.height = 512;

// Fill with blue for water
earthContext.fillStyle = '#1a73e8';
earthContext.fillRect(0, 0, earthCanvas.width, earthCanvas.height);

// Add some green/brown landmasses
earthContext.fillStyle = '#2e7d32';

// Draw random continent-like shapes
for (let i = 0; i < 8; i++) {
    const x = Math.random() * earthCanvas.width;
    const y = Math.random() * earthCanvas.height;
    const size = 30 + Math.random() * 100;
    earthContext.beginPath();
    earthContext.arc(x, y, size, 0, Math.PI * 2);
    earthContext.fill();
}

// Create texture from canvas
const earthTexture = new THREE.CanvasTexture(earthCanvas);
homePlanetMaterial.map = earthTexture;

const homePlanet = new THREE.Mesh(homePlanetGeometry, homePlanetMaterial);
homePlanet.position.set(0, 0, 0);
scene.add(homePlanet);
planets['home'] = homePlanet;

// Add particle effects to home planet
const homeParticles = createPlanetParticles(homePlanet, 0x5d9cec, 100, 0.15, 0.01);

// Add label to home planet
const homeLabel = createPlanetLabel('Home', homePlanet.position);

// Projects hub planet - Mars-like with detailed surface
const projectsGeometry = new THREE.IcosahedronGeometry(5, 1); // Low-poly triangular geometry

// Create a simple material with good color for Mars
const projectsMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xc0392b,
    roughness: 0.7,
    metalness: 0.1,
    clearcoat: 0.2,
    clearcoatRoughness: 0.4,
    envMapIntensity: 0.8,
    emissive: 0xe74c3c,
    emissiveIntensity: 0.2,
    flatShading: true // Enable flat shading for low-poly look
});

// Create a simple canvas texture for Mars with craters and surface details
const marsCanvas = document.createElement('canvas');
const marsContext = marsCanvas.getContext('2d');
marsCanvas.width = 512;
marsCanvas.height = 512;

// Fill with reddish base color
marsContext.fillStyle = '#e74c3c';
marsContext.fillRect(0, 0, marsCanvas.width, marsCanvas.height);

// Add darker areas for terrain variation
marsContext.fillStyle = '#c0392b';

// Draw random terrain patterns
for (let i = 0; i < 30; i++) {
    const x = Math.random() * marsCanvas.width;
    const y = Math.random() * marsCanvas.height;
    const size = 10 + Math.random() * 50;
    marsContext.beginPath();
    marsContext.arc(x, y, size, 0, Math.PI * 2);
    marsContext.fill();
}

// Add some crater-like details
marsContext.fillStyle = '#a93226';
for (let i = 0; i < 20; i++) {
    const x = Math.random() * marsCanvas.width;
    const y = Math.random() * marsCanvas.height;
    const size = 5 + Math.random() * 20;
    marsContext.beginPath();
    marsContext.arc(x, y, size, 0, Math.PI * 2);
    marsContext.fill();
}

// Create texture from canvas
const marsTexture = new THREE.CanvasTexture(marsCanvas);
projectsMaterial.map = marsTexture;

const projectsPlanet = new THREE.Mesh(projectsGeometry, projectsMaterial);
projectsPlanet.position.set(40, 0, 40);
scene.add(projectsPlanet);
planets['projects'] = projectsPlanet;

// Add particle effects to projects planet
const projectsParticles = createPlanetParticles(projectsPlanet, 0xe74c3c, 80, 0.12, 0.015);

// Add label to projects hub planet
const projectsLabel = createPlanetLabel('Projects Hub', projectsPlanet.position);

// Activities planet - Venus-like with active surface
const workGeometry = new THREE.IcosahedronGeometry(3.5, 1); // Low-poly triangular geometry

// Create a simple material with good color for Venus
const workMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xf39c12,
    roughness: 0.6,
    metalness: 0.3,
    clearcoat: 0.4,
    clearcoatRoughness: 0.3,
    envMapIntensity: 0.9,
    emissive: 0xf1c40f,
    emissiveIntensity: 0.2,
    flatShading: true // Enable flat shading for low-poly look
});

// Create a simple canvas texture for Venus with volcanic features
const venusCanvas = document.createElement('canvas');
const venusContext = venusCanvas.getContext('2d');
venusCanvas.width = 512;
venusCanvas.height = 512;

// Fill with base color
venusContext.fillStyle = '#f39c12';
venusContext.fillRect(0, 0, venusCanvas.width, venusCanvas.height);

// Add swirling cloud patterns
venusContext.fillStyle = '#e67e22';

// Create swirling patterns
for (let i = 0; i < 10; i++) {
    const centerX = Math.random() * venusCanvas.width;
    const centerY = Math.random() * venusCanvas.height;

    // Draw swirling pattern
    for (let j = 0; j < 5; j++) {
        const radius = 20 + j * 15;
        const startAngle = Math.random() * Math.PI * 2;
        const endAngle = startAngle + Math.PI * (1 + Math.random());

        venusContext.beginPath();
        venusContext.arc(centerX, centerY, radius, startAngle, endAngle);
        venusContext.lineWidth = 10 + Math.random() * 10;
        venusContext.stroke();
    }
}

// Add some volcanic spots
venusContext.fillStyle = '#d35400';
for (let i = 0; i < 15; i++) {
    const x = Math.random() * venusCanvas.width;
    const y = Math.random() * venusCanvas.height;
    const size = 5 + Math.random() * 15;
    venusContext.beginPath();
    venusContext.arc(x, y, size, 0, Math.PI * 2);
    venusContext.fill();
}

// Create texture from canvas
const venusTexture = new THREE.CanvasTexture(venusCanvas);
workMaterial.map = venusTexture;

const workPlanet = new THREE.Mesh(workGeometry, workMaterial);
workPlanet.position.set(-30, 0, 35);
scene.add(workPlanet);
planets['work'] = workPlanet;

// Add particle effects to work planet
const workParticles = createPlanetParticles(workPlanet, 0xf39c12, 70, 0.1, 0.018);

// Add label to work planet - with extra width for the text
const workCanvas = document.createElement('canvas');
workCanvas.width = 768; // Extra wide canvas
workCanvas.height = 160;
const workContext = workCanvas.getContext('2d');

// Clear background
workContext.fillStyle = 'rgba(0, 0, 0, 0)';
workContext.fillRect(0, 0, workCanvas.width, workCanvas.height);

// Draw text
workContext.fillStyle = '#ffffff';
workContext.font = 'bold 42px Orbitron, Arial';
workContext.textAlign = 'center';
workContext.textBaseline = 'middle';
workContext.fillText('Work', workCanvas.width / 2, workCanvas.height / 2);

// Create texture
const workTexture = new THREE.CanvasTexture(workCanvas);

// Create material
const workLabelMaterial = new THREE.SpriteMaterial({
    map: workTexture,
    transparent: true
});

// Create sprite
const workLabel = new THREE.Sprite(workLabelMaterial);
workLabel.scale.set(15, 5, 1); // Extra wide scale

// Position label directly above planet
workLabel.position.set(0, 8, 0);
workPlanet.add(workLabel);

// Create individual project planets
const projectPlanets = {};

// AI/ML Projects
const ampleHarvestGeometry = new THREE.IcosahedronGeometry(1.5, 1); // Low-poly triangular geometry
const ampleHarvestMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x0097e6,
    roughness: 0.5,
    metalness: 0.4,
    clearcoat: 0.3,
    clearcoatRoughness: 0.25,
    emissive: 0x0984e3,
    emissiveIntensity: 0.2,
    flatShading: true // Enable flat shading for low-poly look
});

// Create a canvas texture for AmpleHarvest with digital patterns
const ampleCanvas = document.createElement('canvas');
const ampleContext = ampleCanvas.getContext('2d');
ampleCanvas.width = 512;
ampleCanvas.height = 512;

// Fill with base blue color
ampleContext.fillStyle = '#0097e6';
ampleContext.fillRect(0, 0, ampleCanvas.width, ampleCanvas.height);

// Add digital pattern - grid lines
ampleContext.strokeStyle = '#00a8ff';
ampleContext.lineWidth = 2;

// Horizontal grid lines
for (let i = 0; i < 20; i++) {
    const y = i * (ampleCanvas.height / 20);
    ampleContext.beginPath();
    ampleContext.moveTo(0, y);
    ampleContext.lineTo(ampleCanvas.width, y);
    ampleContext.stroke();
}

// Vertical grid lines
for (let i = 0; i < 20; i++) {
    const x = i * (ampleCanvas.width / 20);
    ampleContext.beginPath();
    ampleContext.moveTo(x, 0);
    ampleContext.lineTo(x, ampleCanvas.height);
    ampleContext.stroke();
}

// Add some data points/nodes
ampleContext.fillStyle = '#ffffff';
for (let i = 0; i < 50; i++) {
    const x = Math.random() * ampleCanvas.width;
    const y = Math.random() * ampleCanvas.height;
    const size = 2 + Math.random() * 4;
    ampleContext.beginPath();
    ampleContext.arc(x, y, size, 0, Math.PI * 2);
    ampleContext.fill();
}

// Create texture from canvas
const ampleHarvestTexture = new THREE.CanvasTexture(ampleCanvas);
ampleHarvestMaterial.map = ampleHarvestTexture;

const ampleHarvestPlanet = new THREE.Mesh(ampleHarvestGeometry, ampleHarvestMaterial);

// Set initial orbital position
// Calculate the angle for even spacing (0/8 of the circle)
const ampleHarvestOrbit = {
    center: projectsPlanet.position.clone(),
    radius: 15,
    angle: 0 * Math.PI * 2 / 8, // 0 degrees (0/8 * 2π)
    speed: 0.002 // This is now replaced by baseOrbitSpeed * deltaTime
};
ampleHarvestPlanet.position.copy(calculateOrbitalPosition(
    ampleHarvestOrbit.center,
    ampleHarvestOrbit.radius,
    ampleHarvestOrbit.angle
));

scene.add(ampleHarvestPlanet);
projectPlanets['ampleharvest'] = ampleHarvestPlanet;
ampleHarvestPlanet.userData.orbit = ampleHarvestOrbit;
planets['ampleharvest'] = ampleHarvestPlanet;
const ampleHarvestLabel = createPlanetLabel('AmpleHarvest', ampleHarvestPlanet.position, true);

// QAOA Project - Quantum computing themed planet
const qaoaGeometry = new THREE.IcosahedronGeometry(1.5, 1); // Low-poly triangular geometry
const qaoaMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x00cec9,
    roughness: 0.5,
    metalness: 0.4,
    clearcoat: 0.3,
    clearcoatRoughness: 0.25,
    emissive: 0x00b894,
    emissiveIntensity: 0.2,
    flatShading: true // Enable flat shading for low-poly look
});

// Create a canvas texture for QAOA with quantum circuit patterns
const qaoaCanvas = document.createElement('canvas');
const qaoaContext = qaoaCanvas.getContext('2d');
qaoaCanvas.width = 512;
qaoaCanvas.height = 512;

// Fill with base teal color
qaoaContext.fillStyle = '#00cec9';
qaoaContext.fillRect(0, 0, qaoaCanvas.width, qaoaCanvas.height);

// Add quantum circuit patterns
qaoaContext.strokeStyle = '#81ecec';
qaoaContext.lineWidth = 3;

// Draw quantum circuit lines
for (let i = 0; i < 10; i++) {
    const y = 50 + i * 40;
    qaoaContext.beginPath();
    qaoaContext.moveTo(0, y);
    qaoaContext.lineTo(qaoaCanvas.width, y);
    qaoaContext.stroke();

    // Add quantum gates
    for (let j = 0; j < 8; j++) {
        const x = 60 + j * 60;

        // Randomly choose gate type
        const gateType = Math.floor(Math.random() * 3);

        if (gateType === 0) {
            // Draw H gate (box)
            qaoaContext.fillStyle = '#74b9ff';
            qaoaContext.fillRect(x - 15, y - 15, 30, 30);

            // Add H label
            qaoaContext.fillStyle = '#ffffff';
            qaoaContext.font = '16px Arial';
            qaoaContext.fillText('H', x - 5, y + 5);
        } else if (gateType === 1) {
            // Draw X gate (circle)
            qaoaContext.fillStyle = '#0984e3';
            qaoaContext.beginPath();
            qaoaContext.arc(x, y, 15, 0, Math.PI * 2);
            qaoaContext.fill();

            // Add X label
            qaoaContext.fillStyle = '#ffffff';
            qaoaContext.font = '16px Arial';
            qaoaContext.fillText('X', x - 5, y + 5);
        } else {
            // Draw CNOT (control point and target)
            qaoaContext.fillStyle = '#dfe6e9';
            qaoaContext.beginPath();
            qaoaContext.arc(x, y, 5, 0, Math.PI * 2);
            qaoaContext.fill();

            // Draw control line to next qubit
            if (i < 9) {
                qaoaContext.beginPath();
                qaoaContext.moveTo(x, y);
                qaoaContext.lineTo(x, y + 40);
                qaoaContext.stroke();

                // Draw target on next qubit
                qaoaContext.beginPath();
                qaoaContext.arc(x, y + 40, 15, 0, Math.PI * 2);
                qaoaContext.stroke();

                // Draw X through target
                qaoaContext.beginPath();
                qaoaContext.moveTo(x - 10, y + 30);
                qaoaContext.lineTo(x + 10, y + 50);
                qaoaContext.moveTo(x + 10, y + 30);
                qaoaContext.lineTo(x - 10, y + 50);
                qaoaContext.stroke();
            }
        }
    }
}

// Create texture from canvas
const qaoaTexture = new THREE.CanvasTexture(qaoaCanvas);
qaoaMaterial.map = qaoaTexture;

const qaoaPlanet = new THREE.Mesh(qaoaGeometry, qaoaMaterial);

// Set initial orbital position
// Calculate the angle for even spacing (1/8 of the circle)
const qaoaOrbit = {
    center: projectsPlanet.position.clone(),
    radius: 15,
    angle: 1 * Math.PI * 2 / 8, // 45 degrees (1/8 * 2π)
    speed: 0.002 // This is now replaced by baseOrbitSpeed * deltaTime
};
qaoaPlanet.position.copy(calculateOrbitalPosition(
    qaoaOrbit.center,
    qaoaOrbit.radius,
    qaoaOrbit.angle
));

scene.add(qaoaPlanet);
projectPlanets['qaoa'] = qaoaPlanet;
qaoaPlanet.userData.orbit = qaoaOrbit;
planets['qaoa'] = qaoaPlanet;
const qaoaLabel = createPlanetLabel('QAOA', qaoaPlanet.position, true);

// Facies Predictor - Geological data planet
const faciesGeometry = new THREE.IcosahedronGeometry(1.5, 1); // Low-poly triangular geometry
const faciesMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x74b9ff,
    roughness: 0.5,
    metalness: 0.3,
    clearcoat: 0.2,
    clearcoatRoughness: 0.3,
    emissive: 0x0984e3,
    emissiveIntensity: 0.2,
    flatShading: true // Enable flat shading for low-poly look
});

// Create a canvas texture for Facies Predictor with geological patterns
const faciesCanvas = document.createElement('canvas');
const faciesContext = faciesCanvas.getContext('2d');
faciesCanvas.width = 512;
faciesCanvas.height = 512;

// Fill with base blue color
faciesContext.fillStyle = '#74b9ff';
faciesContext.fillRect(0, 0, faciesCanvas.width, faciesCanvas.height);

// Create geological layer patterns
const layers = [
    { color: '#0984e3', y: faciesCanvas.height * 0.1, height: faciesCanvas.height * 0.15 },
    { color: '#6c5ce7', y: faciesCanvas.height * 0.25, height: faciesCanvas.height * 0.1 },
    { color: '#fdcb6e', y: faciesCanvas.height * 0.35, height: faciesCanvas.height * 0.12 },
    { color: '#e17055', y: faciesCanvas.height * 0.47, height: faciesCanvas.height * 0.08 },
    { color: '#d63031', y: faciesCanvas.height * 0.55, height: faciesCanvas.height * 0.13 },
    { color: '#6c5ce7', y: faciesCanvas.height * 0.68, height: faciesCanvas.height * 0.1 },
    { color: '#00b894', y: faciesCanvas.height * 0.78, height: faciesCanvas.height * 0.22 }
];

// Draw the geological layers
layers.forEach(layer => {
    faciesContext.fillStyle = layer.color;
    faciesContext.fillRect(0, layer.y, faciesCanvas.width, layer.height);
});

// Add some rock texture details
faciesContext.fillStyle = 'rgba(255, 255, 255, 0.1)';
for (let i = 0; i < 200; i++) {
    const x = Math.random() * faciesCanvas.width;
    const y = Math.random() * faciesCanvas.height;
    const size = 1 + Math.random() * 3;
    faciesContext.beginPath();
    faciesContext.arc(x, y, size, 0, Math.PI * 2);
    faciesContext.fill();
}

// Create texture from canvas
const faciesTexture = new THREE.CanvasTexture(faciesCanvas);
faciesMaterial.map = faciesTexture;

const faciesPlanet = new THREE.Mesh(faciesGeometry, faciesMaterial);

// Set initial orbital position
// Calculate the angle for even spacing (2/8 of the circle)
const faciesOrbit = {
    center: projectsPlanet.position.clone(),
    radius: 15,
    angle: 2 * Math.PI * 2 / 8, // 90 degrees (2/8 * 2π)
    speed: 0.002 // This is now replaced by baseOrbitSpeed * deltaTime
};
faciesPlanet.position.copy(calculateOrbitalPosition(
    faciesOrbit.center,
    faciesOrbit.radius,
    faciesOrbit.angle
));

scene.add(faciesPlanet);
projectPlanets['facies'] = faciesPlanet;
faciesPlanet.userData.orbit = faciesOrbit;
planets['facies'] = faciesPlanet;
const faciesLabel = createPlanetLabel('Facies Predictor', faciesPlanet.position, true);

// Boulder Detection - Rocky surface planet
const boulderGeometry = new THREE.IcosahedronGeometry(1.5, 1); // Low-poly triangular geometry
const boulderMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xa29bfe,
    roughness: 0.7,
    metalness: 0.1,
    clearcoat: 0.1,
    clearcoatRoughness: 0.5,
    emissive: 0x6c5ce7,
    emissiveIntensity: 0.2,
    flatShading: true // Enable flat shading for low-poly look
});

// Create a canvas texture for Boulder Detection with rocky surface
const boulderCanvas = document.createElement('canvas');
const boulderContext = boulderCanvas.getContext('2d');
boulderCanvas.width = 512;
boulderCanvas.height = 512;

// Fill with base purple color
boulderContext.fillStyle = '#a29bfe';
boulderContext.fillRect(0, 0, boulderCanvas.width, boulderCanvas.height);

// Add rocky texture - create craters
for (let i = 0; i < 30; i++) {
    const x = Math.random() * boulderCanvas.width;
    const y = Math.random() * boulderCanvas.height;
    const size = 10 + Math.random() * 40;

    // Create crater gradient
    const gradient = boulderContext.createRadialGradient(x, y, 0, x, y, size);
    gradient.addColorStop(0, '#8c7ae6');
    gradient.addColorStop(0.7, '#9c88ff');
    gradient.addColorStop(1, '#a29bfe');

    // Draw crater
    boulderContext.fillStyle = gradient;
    boulderContext.beginPath();
    boulderContext.arc(x, y, size, 0, Math.PI * 2);
    boulderContext.fill();

    // Add crater rim highlight
    boulderContext.strokeStyle = '#7158e2';
    boulderContext.lineWidth = 2;
    boulderContext.beginPath();
    boulderContext.arc(x, y, size, 0, Math.PI * 2);
    boulderContext.stroke();
}

// Add small rocks and details
boulderContext.fillStyle = '#7158e2';
for (let i = 0; i < 200; i++) {
    const x = Math.random() * boulderCanvas.width;
    const y = Math.random() * boulderCanvas.height;
    const size = 1 + Math.random() * 3;
    boulderContext.beginPath();
    boulderContext.arc(x, y, size, 0, Math.PI * 2);
    boulderContext.fill();
}

// Create texture from canvas
const boulderTexture = new THREE.CanvasTexture(boulderCanvas);
boulderMaterial.map = boulderTexture;

const boulderPlanet = new THREE.Mesh(boulderGeometry, boulderMaterial);

// Set initial orbital position
// Calculate the angle for even spacing (3/8 of the circle)
const boulderOrbit = {
    center: projectsPlanet.position.clone(),
    radius: 15,
    angle: 3 * Math.PI * 2 / 8, // 135 degrees (3/8 * 2π)
    speed: 0.002 // This is now replaced by baseOrbitSpeed * deltaTime
};
boulderPlanet.position.copy(calculateOrbitalPosition(
    boulderOrbit.center,
    boulderOrbit.radius,
    boulderOrbit.angle
));

scene.add(boulderPlanet);
projectPlanets['boulder'] = boulderPlanet;
boulderPlanet.userData.orbit = boulderOrbit;
planets['boulder'] = boulderPlanet;
const boulderLabel = createPlanetLabel('Boulder Detection', boulderPlanet.position, true);

// Momentum - High-energy physics-based game planet
const momentumGeometry = new THREE.IcosahedronGeometry(1.5, 1); // Low-poly triangular geometry
const momentumMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xfdcb6e,
    roughness: 0.5,
    metalness: 0.3,
    clearcoat: 0.2,
    clearcoatRoughness: 0.3,
    emissive: 0xf39c12,
    emissiveIntensity: 0.2,
    flatShading: true // Enable flat shading for low-poly look
});

// Create a canvas texture for Momentum with energy patterns
const momentumCanvas = document.createElement('canvas');
const momentumContext = momentumCanvas.getContext('2d');
momentumCanvas.width = 512;
momentumCanvas.height = 512;

// Fill with base golden color
momentumContext.fillStyle = '#fdcb6e';
momentumContext.fillRect(0, 0, momentumCanvas.width, momentumCanvas.height);

// Add energy wave patterns
momentumContext.strokeStyle = '#ffeaa7';
momentumContext.lineWidth = 3;

// Create wave patterns
for (let i = 0; i < 10; i++) {
    const yOffset = i * 50;

    momentumContext.beginPath();
    for (let x = 0; x < momentumCanvas.width; x += 2) {
        const amplitude = 15 + Math.random() * 10;
        const frequency = 0.02 + Math.random() * 0.01;
        const y = yOffset + Math.sin(x * frequency) * amplitude;

        if (x === 0) {
            momentumContext.moveTo(x, y);
        } else {
            momentumContext.lineTo(x, y);
        }
    }
    momentumContext.stroke();
}

// Add energy particles
momentumContext.fillStyle = '#e17055';
for (let i = 0; i < 100; i++) {
    const x = Math.random() * momentumCanvas.width;
    const y = Math.random() * momentumCanvas.height;
    const size = 2 + Math.random() * 4;

    momentumContext.beginPath();
    momentumContext.arc(x, y, size, 0, Math.PI * 2);
    momentumContext.fill();
}

// Add some bright energy spots
momentumContext.fillStyle = '#ff9f43';
for (let i = 0; i < 20; i++) {
    const x = Math.random() * momentumCanvas.width;
    const y = Math.random() * momentumCanvas.height;
    const size = 5 + Math.random() * 10;

    // Create glow effect
    const gradient = momentumContext.createRadialGradient(x, y, 0, x, y, size);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.4, '#ff9f43');
    gradient.addColorStop(1, 'rgba(253, 203, 110, 0)');

    momentumContext.fillStyle = gradient;
    momentumContext.beginPath();
    momentumContext.arc(x, y, size, 0, Math.PI * 2);
    momentumContext.fill();
}

// Create texture from canvas
const momentumTexture = new THREE.CanvasTexture(momentumCanvas);
momentumMaterial.map = momentumTexture;

const momentumPlanet = new THREE.Mesh(momentumGeometry, momentumMaterial);

// Set initial orbital position
// Calculate the angle for even spacing (4/8 of the circle)
const momentumOrbit = {
    center: projectsPlanet.position.clone(),
    radius: 15,
    angle: 4 * Math.PI * 2 / 8, // 180 degrees (4/8 * 2π)
    speed: 0.002 // This is now replaced by baseOrbitSpeed * deltaTime
};
momentumPlanet.position.copy(calculateOrbitalPosition(
    momentumOrbit.center,
    momentumOrbit.radius,
    momentumOrbit.angle
));

scene.add(momentumPlanet);
projectPlanets['momentum'] = momentumPlanet;
momentumPlanet.userData.orbit = momentumOrbit;
planets['momentum'] = momentumPlanet;
const momentumLabel = createPlanetLabel('Momentum', momentumPlanet.position, true);

// Burger Brawl - Food-themed fighting game planet
const burgerGeometry = new THREE.IcosahedronGeometry(1.5, 1); // Low-poly triangular geometry
const burgerMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffeaa7,
    roughness: 0.5,
    metalness: 0.2,
    clearcoat: 0.2,
    clearcoatRoughness: 0.3,
    emissive: 0xfdcb6e,
    emissiveIntensity: 0.2,
    flatShading: true // Enable flat shading for low-poly look
});

// Create a canvas texture for Burger Brawl with food-themed patterns
const burgerCanvas = document.createElement('canvas');
const burgerContext = burgerCanvas.getContext('2d');
burgerCanvas.width = 512;
burgerCanvas.height = 512;

// Fill with base bun color
burgerContext.fillStyle = '#ffeaa7';
burgerContext.fillRect(0, 0, burgerCanvas.width, burgerCanvas.height);

// Add burger layers
const burgerLayers = [
    { color: '#e17055', y: burgerCanvas.height * 0.3, height: burgerCanvas.height * 0.1 },  // Tomato
    { color: '#55efc4', y: burgerCanvas.height * 0.4, height: burgerCanvas.height * 0.05 },  // Lettuce
    { color: '#d35400', y: burgerCanvas.height * 0.45, height: burgerCanvas.height * 0.15 }, // Patty
    { color: '#fdcb6e', y: burgerCanvas.height * 0.6, height: burgerCanvas.height * 0.1 }    // Cheese
];

// Draw the burger layers
burgerLayers.forEach(layer => {
    burgerContext.fillStyle = layer.color;
    burgerContext.fillRect(0, layer.y, burgerCanvas.width, layer.height);
});

// Add sesame seeds on top bun
burgerContext.fillStyle = '#ffffff';
for (let i = 0; i < 50; i++) {
    const x = Math.random() * burgerCanvas.width;
    const y = Math.random() * (burgerCanvas.height * 0.3); // Only on top bun
    const size = 2 + Math.random() * 3;

    burgerContext.beginPath();
    burgerContext.ellipse(x, y, size, size * 1.5, 0, 0, Math.PI * 2);
    burgerContext.fill();
}

// Add some sauce drips
burgerContext.fillStyle = '#e84393'; // Ketchup color
for (let i = 0; i < 15; i++) {
    const x = Math.random() * burgerCanvas.width;
    const startY = burgerCanvas.height * 0.3;
    const length = 10 + Math.random() * 30;

    burgerContext.beginPath();
    burgerContext.moveTo(x, startY);
    burgerContext.lineTo(x + 5, startY);
    burgerContext.lineTo(x + 2.5, startY + length);
    burgerContext.fill();
}

// Create texture from canvas
const burgerTexture = new THREE.CanvasTexture(burgerCanvas);
burgerMaterial.map = burgerTexture;

const burgerPlanet = new THREE.Mesh(burgerGeometry, burgerMaterial);

// Set initial orbital position
// Calculate the angle for even spacing (5/8 of the circle)
const burgerOrbit = {
    center: projectsPlanet.position.clone(),
    radius: 15,
    angle: 5 * Math.PI * 2 / 8, // 225 degrees (5/8 * 2π)
    speed: 0.002 // This is now replaced by baseOrbitSpeed * deltaTime
};
burgerPlanet.position.copy(calculateOrbitalPosition(
    burgerOrbit.center,
    burgerOrbit.radius,
    burgerOrbit.angle
));

scene.add(burgerPlanet);
projectPlanets['burger'] = burgerPlanet;
burgerPlanet.userData.orbit = burgerOrbit;
planets['burger'] = burgerPlanet;
const burgerLabel = createPlanetLabel('Burger Brawl', burgerPlanet.position, true);

// Galaxsea - Underwater space shooter game planet
const galaxseaGeometry = new THREE.IcosahedronGeometry(1.5, 1); // Low-poly triangular geometry
const galaxseaMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x74b9ff,
    roughness: 0.3,
    metalness: 0.6,
    clearcoat: 0.7,
    clearcoatRoughness: 0.1,
    envMapIntensity: 1.2,
    transmission: 0.3, // Increased transparency for underwater effect
    emissive: 0x0984e3,
    emissiveIntensity: 0.3,
    flatShading: true // Enable flat shading for low-poly look
});

// Create a canvas texture for Galaxsea with underwater space theme
const galaxseaCanvas = document.createElement('canvas');
const galaxseaContext = galaxseaCanvas.getContext('2d');
galaxseaCanvas.width = 512;
galaxseaCanvas.height = 512;

// Create deep ocean background gradient
const oceanGradient = galaxseaContext.createLinearGradient(0, 0, 0, galaxseaCanvas.height);
oceanGradient.addColorStop(0, '#0984e3');   // Deep blue at top
oceanGradient.addColorStop(0.5, '#74b9ff'); // Medium blue in middle
oceanGradient.addColorStop(1, '#00cec9');   // Teal at bottom

galaxseaContext.fillStyle = oceanGradient;
galaxseaContext.fillRect(0, 0, galaxseaCanvas.width, galaxseaCanvas.height);

// Add water ripple effects
for (let i = 0; i < 8; i++) {
    const y = i * 60;
    galaxseaContext.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    galaxseaContext.lineWidth = 2;

    galaxseaContext.beginPath();
    for (let x = 0; x < galaxseaCanvas.width; x += 1) {
        const amplitude = 5 + Math.random() * 3;
        const frequency = 0.03 + Math.random() * 0.01;
        const waveY = y + Math.sin(x * frequency) * amplitude;

        if (x === 0) {
            galaxseaContext.moveTo(x, waveY);
        } else {
            galaxseaContext.lineTo(x, waveY);
        }
    }
    galaxseaContext.stroke();
}

// Add underwater bubbles
galaxseaContext.fillStyle = 'rgba(255, 255, 255, 0.5)';
for (let i = 0; i < 60; i++) {
    const x = Math.random() * galaxseaCanvas.width;
    const y = Math.random() * galaxseaCanvas.height;
    const size = 1 + Math.random() * 4;

    galaxseaContext.beginPath();
    galaxseaContext.arc(x, y, size, 0, Math.PI * 2);
    galaxseaContext.fill();
}

// Add bioluminescent sea creatures
const glowColors = ['#00cec9', '#0984e3', '#6c5ce7', '#00b894'];
for (let i = 0; i < 30; i++) {
    const x = Math.random() * galaxseaCanvas.width;
    const y = Math.random() * galaxseaCanvas.height;
    const size = 5 + Math.random() * 10;
    const colorIndex = Math.floor(Math.random() * glowColors.length);

    // Create glow effect
    const gradient = galaxseaContext.createRadialGradient(x, y, 0, x, y, size);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(0.5, glowColors[colorIndex]);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    galaxseaContext.fillStyle = gradient;
    galaxseaContext.beginPath();
    galaxseaContext.arc(x, y, size, 0, Math.PI * 2);
    galaxseaContext.fill();
}

// Create texture from canvas
const galaxseaTexture = new THREE.CanvasTexture(galaxseaCanvas);
galaxseaMaterial.map = galaxseaTexture;

const galaxseaPlanet = new THREE.Mesh(galaxseaGeometry, galaxseaMaterial);

// Set initial orbital position
// Calculate the angle for even spacing (6/8 of the circle)
const galaxseaOrbit = {
    center: projectsPlanet.position.clone(),
    radius: 15,
    angle: 6 * Math.PI * 2 / 8, // 270 degrees (6/8 * 2π)
    speed: 0.002 // This is now replaced by baseOrbitSpeed * deltaTime
};
galaxseaPlanet.position.copy(calculateOrbitalPosition(
    galaxseaOrbit.center,
    galaxseaOrbit.radius,
    galaxseaOrbit.angle
));

scene.add(galaxseaPlanet);
projectPlanets['galaxsea'] = galaxseaPlanet;
galaxseaPlanet.userData.orbit = galaxseaOrbit;
planets['galaxsea'] = galaxseaPlanet;
const galaxseaLabel = createPlanetLabel('Galaxsea', galaxseaPlanet.position, true);

// Skyfarer - VR flying experience game planet
const skyfarerGeometry = new THREE.IcosahedronGeometry(1.5, 1); // Low-poly triangular geometry
const skyfarerMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xf7b731,
    roughness: 0.2,
    metalness: 0.5,
    clearcoat: 0.8,
    clearcoatRoughness: 0.1,
    envMapIntensity: 1.4,
    emissive: 0xf39c12,
    emissiveIntensity: 0.3,
    flatShading: true // Enable flat shading for low-poly look
});

// Create a canvas texture for Skyfarer with sky and clouds theme
const skyfarerCanvas = document.createElement('canvas');
const skyfarerContext = skyfarerCanvas.getContext('2d');
skyfarerCanvas.width = 512;
skyfarerCanvas.height = 512;

// Create sky gradient background
const skyGradient = skyfarerContext.createLinearGradient(0, 0, 0, skyfarerCanvas.height);
skyGradient.addColorStop(0, '#3498db');  // Blue sky at top
skyGradient.addColorStop(0.5, '#f7b731'); // Golden sunset in middle
skyGradient.addColorStop(1, '#f39c12');   // Orange horizon at bottom

skyfarerContext.fillStyle = skyGradient;
skyfarerContext.fillRect(0, 0, skyfarerCanvas.width, skyfarerCanvas.height);

// Add fluffy clouds
skyfarerContext.fillStyle = 'rgba(255, 255, 255, 0.7)';

// Create different sized cloud clusters
for (let i = 0; i < 12; i++) {
    const centerX = Math.random() * skyfarerCanvas.width;
    const centerY = Math.random() * skyfarerCanvas.height;
    const cloudSize = 20 + Math.random() * 40;

    // Create a cloud cluster (multiple overlapping circles)
    for (let j = 0; j < 5; j++) {
        const offsetX = (Math.random() - 0.5) * cloudSize;
        const offsetY = (Math.random() - 0.5) * cloudSize * 0.5;
        const size = cloudSize * (0.5 + Math.random() * 0.5);

        skyfarerContext.beginPath();
        skyfarerContext.arc(centerX + offsetX, centerY + offsetY, size, 0, Math.PI * 2);
        skyfarerContext.fill();
    }
}

// Add some sun rays
skyfarerContext.strokeStyle = 'rgba(255, 255, 255, 0.4)';
skyfarerContext.lineWidth = 3;

const sunX = skyfarerCanvas.width * 0.7;
const sunY = skyfarerCanvas.height * 0.3;

// Draw sun
skyfarerContext.fillStyle = 'rgba(255, 255, 255, 0.9)';
skyfarerContext.beginPath();
skyfarerContext.arc(sunX, sunY, 30, 0, Math.PI * 2);
skyfarerContext.fill();

// Draw sun rays
for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const rayLength = 50 + Math.random() * 30;

    skyfarerContext.beginPath();
    skyfarerContext.moveTo(sunX, sunY);
    skyfarerContext.lineTo(
        sunX + Math.cos(angle) * rayLength,
        sunY + Math.sin(angle) * rayLength
    );
    skyfarerContext.stroke();
}

// Create texture from canvas
const skyfarerTexture = new THREE.CanvasTexture(skyfarerCanvas);
skyfarerMaterial.map = skyfarerTexture;

const skyfarerPlanet = new THREE.Mesh(skyfarerGeometry, skyfarerMaterial);

// Set initial orbital position
// Calculate the angle for even spacing (7/8 of the circle)
const skyfarerOrbit = {
    center: projectsPlanet.position.clone(),
    radius: 15,
    angle: 7 * Math.PI * 2 / 8, // 315 degrees (7/8 * 2π)
    speed: 0.002 // This is now replaced by baseOrbitSpeed * deltaTime
};
skyfarerPlanet.position.copy(calculateOrbitalPosition(
    skyfarerOrbit.center,
    skyfarerOrbit.radius,
    skyfarerOrbit.angle
));

scene.add(skyfarerPlanet);
projectPlanets['skyfarer'] = skyfarerPlanet;
skyfarerPlanet.userData.orbit = skyfarerOrbit;
planets['skyfarer'] = skyfarerPlanet;
const skyfarerLabel = createPlanetLabel('Skyfarer', skyfarerPlanet.position, true);

// Skills planet - Gas giant with swirling patterns
const skillsGeometry = new THREE.IcosahedronGeometry(3.5, 1); // Low-poly triangular geometry

// Create a simple material with good color for Jupiter-like gas giant
const skillsMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x27ae60,
    roughness: 0.6,
    metalness: 0.2,
    clearcoat: 0.3,
    clearcoatRoughness: 0.3,
    envMapIntensity: 0.9,
    emissive: 0x2ecc71,
    emissiveIntensity: 0.2,
    flatShading: true
});

// Create a simple canvas texture for a gas giant with swirling patterns
const jupiterCanvas = document.createElement('canvas');
const jupiterContext = jupiterCanvas.getContext('2d');
jupiterCanvas.width = 512;
jupiterCanvas.height = 512;

// Fill with base green color
jupiterContext.fillStyle = '#4cd137';
jupiterContext.fillRect(0, 0, jupiterCanvas.width, jupiterCanvas.height);

// Add swirling band patterns typical of gas giants
const bands = [
    { color: '#44bd32', y: jupiterCanvas.height * 0.2, height: jupiterCanvas.height * 0.1 },
    { color: '#20bf6b', y: jupiterCanvas.height * 0.4, height: jupiterCanvas.height * 0.15 },
    { color: '#26de81', y: jupiterCanvas.height * 0.65, height: jupiterCanvas.height * 0.12 },
    { color: '#2ecc71', y: jupiterCanvas.height * 0.85, height: jupiterCanvas.height * 0.1 }
];

// Draw the bands
bands.forEach(band => {
    jupiterContext.fillStyle = band.color;
    jupiterContext.fillRect(0, band.y, jupiterCanvas.width, band.height);
});

// Add swirling storm-like features
jupiterContext.fillStyle = '#27ae60';
for (let i = 0; i < 8; i++) {
    const x = Math.random() * jupiterCanvas.width;
    const y = Math.random() * jupiterCanvas.height;
    const radiusX = 20 + Math.random() * 40;
    const radiusY = 10 + Math.random() * 20;

    jupiterContext.beginPath();
    jupiterContext.ellipse(x, y, radiusX, radiusY, 0, 0, Math.PI * 2);
    jupiterContext.fill();
}

// Create texture from canvas
const jupiterTexture = new THREE.CanvasTexture(jupiterCanvas);
skillsMaterial.map = jupiterTexture;

const skillsPlanet = new THREE.Mesh(skillsGeometry, skillsMaterial);
skillsPlanet.position.set(-40, 0, -40);
scene.add(skillsPlanet);
planets['skills'] = skillsPlanet;

// Add particle effects to skills planet
const skillsParticles = createPlanetParticles(skillsPlanet, 0x4cd137, 70, 0.1, 0.02);

// Add label to skills planet
const skillsLabel = createPlanetLabel('Skills', skillsPlanet.position);

// About planet - Neptune-like with swirling clouds
const aboutPlanetGeometry = new THREE.IcosahedronGeometry(3.5, 1); // Low-poly triangular geometry

// Create a simple material with good color for Neptune
const aboutPlanetMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x8e44ad,
    roughness: 0.5,
    metalness: 0.3,
    clearcoat: 0.4,
    clearcoatRoughness: 0.3,
    envMapIntensity: 1.0,
    emissive: 0x9b59b6,
    emissiveIntensity: 0.2,
    flatShading: true
});

// Create a simple canvas texture for Neptune with swirling clouds
const neptuneCanvas = document.createElement('canvas');
const neptuneContext = neptuneCanvas.getContext('2d');
neptuneCanvas.width = 512;
neptuneCanvas.height = 512;

// Fill with base blue-purple color
neptuneContext.fillStyle = '#8e44ad';
neptuneContext.fillRect(0, 0, neptuneCanvas.width, neptuneCanvas.height);

// Add swirling cloud patterns
neptuneContext.fillStyle = '#9b59b6';

// Create swirling patterns
for (let i = 0; i < 6; i++) {
    const centerX = Math.random() * neptuneCanvas.width;
    const centerY = Math.random() * neptuneCanvas.height;

    // Draw swirling cloud pattern
    for (let j = 0; j < 4; j++) {
        const radius = 30 + j * 20;
        const startAngle = Math.random() * Math.PI * 2;
        const endAngle = startAngle + Math.PI * (1 + Math.random());

        neptuneContext.beginPath();
        neptuneContext.arc(centerX, centerY, radius, startAngle, endAngle);
        neptuneContext.lineWidth = 15 + Math.random() * 15;
        neptuneContext.stroke();
    }
}

// Add some bright spots
neptuneContext.fillStyle = '#a569bd';
for (let i = 0; i < 12; i++) {
    const x = Math.random() * neptuneCanvas.width;
    const y = Math.random() * neptuneCanvas.height;
    const size = 5 + Math.random() * 10;
    neptuneContext.beginPath();
    neptuneContext.arc(x, y, size, 0, Math.PI * 2);
    neptuneContext.fill();
}

// Create texture from canvas
const neptuneTexture = new THREE.CanvasTexture(neptuneCanvas);
aboutPlanetMaterial.map = neptuneTexture;

const aboutPlanet = new THREE.Mesh(aboutPlanetGeometry, aboutPlanetMaterial);
aboutPlanet.position.set(35, 0, -35);
scene.add(aboutPlanet);
planets['about'] = aboutPlanet;

// Add particle effects to about planet
const aboutParticles = createPlanetParticles(aboutPlanet, 0x8e44ad, 70, 0.1, 0.016);

// Add label to about planet
const aboutLabel = createPlanetLabel('About', aboutPlanet.position);

// Contact planet - Saturn-like with rings
const contactPlanetGeometry = new THREE.IcosahedronGeometry(3.5, 1); // Low-poly triangular geometry

// Create a simple material with good color for Saturn
const contactPlanetMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xf1c40f,
    roughness: 0.6,
    metalness: 0.2,
    clearcoat: 0.3,
    clearcoatRoughness: 0.3,
    envMapIntensity: 0.9,
    emissive: 0xf39c12,
    emissiveIntensity: 0.2,
    flatShading: true
});

// Create a simple canvas texture for Saturn
const saturnCanvas = document.createElement('canvas');
const saturnContext = saturnCanvas.getContext('2d');
saturnCanvas.width = 512;
saturnCanvas.height = 512;

// Fill with base golden color
saturnContext.fillStyle = '#fbc531';
saturnContext.fillRect(0, 0, saturnCanvas.width, saturnCanvas.height);

// Add horizontal band patterns typical of Saturn
const saturnBands = [
    { color: '#e1b12c', y: saturnCanvas.height * 0.2, height: saturnCanvas.height * 0.08 },
    { color: '#fad390', y: saturnCanvas.height * 0.35, height: saturnCanvas.height * 0.1 },
    { color: '#f6b93b', y: saturnCanvas.height * 0.55, height: saturnCanvas.height * 0.12 },
    { color: '#e58e26', y: saturnCanvas.height * 0.75, height: saturnCanvas.height * 0.1 }
];

// Draw the bands
saturnBands.forEach(band => {
    saturnContext.fillStyle = band.color;
    saturnContext.fillRect(0, band.y, saturnCanvas.width, band.height);
});

// Add some subtle details
saturnContext.fillStyle = '#f39c12';
for (let i = 0; i < 10; i++) {
    const x = Math.random() * saturnCanvas.width;
    const y = Math.random() * saturnCanvas.height;
    const size = 5 + Math.random() * 10;
    saturnContext.beginPath();
    saturnContext.arc(x, y, size, 0, Math.PI * 2);
    saturnContext.fill();
}

// Create texture from canvas
const saturnTexture = new THREE.CanvasTexture(saturnCanvas);
contactPlanetMaterial.map = saturnTexture;

// Add emissive glow for warm effect
contactPlanetMaterial.emissive = new THREE.Color(0x7e6218);
contactPlanetMaterial.emissiveIntensity = 0.1;

const contactPlanet = new THREE.Mesh(contactPlanetGeometry, contactPlanetMaterial);
contactPlanet.position.set(10, 0, 45);
scene.add(contactPlanet);
planets['contact'] = contactPlanet;

// Add rings to the contact planet
const ringGeometry = new THREE.RingGeometry(5, 8, 64);
const ringMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffd700,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.8,  // Increased opacity to make rings more visible
    roughness: 0.5,
    metalness: 0.2,
    clearcoat: 0.3,
    clearcoatRoughness: 0.3,
    envMapIntensity: 0.8,
    emissive: 0xaa8800,
    emissiveIntensity: 0.2
});

// Create a simple canvas texture for Saturn's rings
const ringCanvas = document.createElement('canvas');
const ringContext = ringCanvas.getContext('2d');
ringCanvas.width = 512;
ringCanvas.height = 512;

// Create a radial gradient for the rings
const gradient = ringContext.createRadialGradient(
    ringCanvas.width / 2, ringCanvas.height / 2, ringCanvas.width * 0.3,
    ringCanvas.width / 2, ringCanvas.height / 2, ringCanvas.width * 0.5
);
gradient.addColorStop(0, 'rgba(255, 215, 0, 0.9)');
gradient.addColorStop(0.4, 'rgba(255, 215, 0, 0.7)');
gradient.addColorStop(0.6, 'rgba(255, 215, 0, 0.5)');
gradient.addColorStop(0.8, 'rgba(255, 215, 0, 0.3)');
gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');

// Fill with gradient
ringContext.fillStyle = gradient;
ringContext.fillRect(0, 0, ringCanvas.width, ringCanvas.height);

// Add some ring divisions
for (let i = 0; i < 5; i++) {
    const radius = ringCanvas.width * (0.32 + i * 0.04);
    ringContext.beginPath();
    ringContext.arc(ringCanvas.width / 2, ringCanvas.height / 2, radius, 0, Math.PI * 2);
    ringContext.strokeStyle = 'rgba(150, 120, 0, 0.5)';
    ringContext.lineWidth = 2;
    ringContext.stroke();
}

// Create texture from canvas
const ringTexture = new THREE.CanvasTexture(ringCanvas);
ringMaterial.map = ringTexture;
ringMaterial.alphaMap = ringTexture;

const ring = new THREE.Mesh(ringGeometry, ringMaterial);
ring.rotation.x = Math.PI / 2;
contactPlanet.add(ring);

// Make the ring rotate slightly differently than the planet
ring.userData.rotationSpeed = 0.003;

// Add particle effects to contact planet
const contactParticles = createPlanetParticles(contactPlanet, 0xfbc531, 70, 0.1, 0.017);

// Add label to contact planet
const contactLabel = createPlanetLabel('Contact', contactPlanet.position);

// Create a low-poly spaceship to match planet aesthetic
const spaceship = new THREE.Group();

// Main body - low poly fuselage
const bodyGeometry = new THREE.CylinderGeometry(0.6, 1, 4, 6); // Reduced segments for low-poly look
const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0xd8e2f3,  // Lighter blue-silver
    metalness: 0.7,
    roughness: 0.4,
    emissive: 0x3d5cac,
    emissiveIntensity: 0.2,
    flatShading: true // Enable flat shading for low-poly look
});
const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
// Rotate to point forward visually, but backward in terms of movement
body.rotation.x = Math.PI / 2;
spaceship.add(body);

// Add cockpit - low poly version
const cockpitGeometry = new THREE.IcosahedronGeometry(0.7, 0); // Use icosahedron for low-poly look
const cockpitMaterial = new THREE.MeshStandardMaterial({
    color: 0x5d9cec,
    metalness: 0.3,
    roughness: 0.4,
    transparent: true,
    opacity: 0.9,
    emissive: 0x5d9cec,
    emissiveIntensity: 0.3,
    flatShading: true // Enable flat shading for low-poly look
});
const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
// Position cockpit at the visual front
cockpit.position.set(0, 0.4, -1.5);
cockpit.scale.set(1, 0.8, 1.2); // Slightly squash for better shape
spaceship.add(cockpit);

// Add wings - low poly version
const wingGeometry = new THREE.BoxGeometry(5, 0.2, 1.5, 2, 1, 2); // Reduced segments
const wingMaterial = new THREE.MeshStandardMaterial({
    color: 0x5d9cec,
    metalness: 0.5,
    roughness: 0.5,
    flatShading: true // Enable flat shading for low-poly look
});
const wings = new THREE.Mesh(wingGeometry, wingMaterial);
wings.position.y = 0.1;
spaceship.add(wings);

// Add wing tips - already low poly with cone
const wingTipGeometry = new THREE.ConeGeometry(0.4, 1, 4); // Already low-poly
const wingTipMaterial = new THREE.MeshStandardMaterial({
    color: 0xe74c3c,
    emissive: 0xe74c3c,
    emissiveIntensity: 0.5,
    flatShading: true // Enable flat shading for low-poly look
});

const leftWingTip = new THREE.Mesh(wingTipGeometry, wingTipMaterial);
leftWingTip.position.set(-2.5, 0.1, -0.5);
leftWingTip.rotation.z = -Math.PI / 2;
spaceship.add(leftWingTip);

const rightWingTip = new THREE.Mesh(wingTipGeometry, wingTipMaterial);
rightWingTip.position.set(2.5, 0.1, -0.5);
rightWingTip.rotation.z = Math.PI / 2;
spaceship.add(rightWingTip);

// Create wing trail effects
// Left wing trail
const leftWingTrailCount = 50;
const leftWingTrailGeometry = new THREE.BufferGeometry();
const leftWingTrailPositions = new Float32Array(leftWingTrailCount * 3);
const leftWingTrailSizes = new Float32Array(leftWingTrailCount);
const leftWingTrailOpacities = new Float32Array(leftWingTrailCount);

// Initialize left wing trail particles
for (let i = 0; i < leftWingTrailCount; i++) {
    const i3 = i * 3;
    leftWingTrailPositions[i3] = -2.5; // x position at left wing tip
    leftWingTrailPositions[i3 + 1] = 0.1; // y position
    leftWingTrailPositions[i3 + 2] = -0.5 + (Math.random() * 0.2); // z position with slight randomness
    leftWingTrailSizes[i] = Math.random() * 0.3 + 0.1;
    leftWingTrailOpacities[i] = 0; // Start invisible
}

leftWingTrailGeometry.setAttribute('position', new THREE.BufferAttribute(leftWingTrailPositions, 3));
leftWingTrailGeometry.setAttribute('size', new THREE.BufferAttribute(leftWingTrailSizes, 1));
leftWingTrailGeometry.setAttribute('opacity', new THREE.BufferAttribute(leftWingTrailOpacities, 1));

// Create custom shader material for wing trails
const wingTrailMaterial = new THREE.ShaderMaterial({
    uniforms: {
        color: { value: new THREE.Color(0xff7700) }
    },
    vertexShader: `
        attribute float size;
        attribute float opacity;
        varying float vOpacity;
        void main() {
            vOpacity = opacity;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = size * (300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
        }
    `,
    fragmentShader: `
        uniform vec3 color;
        varying float vOpacity;
        void main() {
            if (length(gl_PointCoord - vec2(0.5, 0.5)) > 0.5) discard;
            gl_FragColor = vec4(color, vOpacity);
        }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
});

const leftWingTrail = new THREE.Points(leftWingTrailGeometry, wingTrailMaterial.clone());
spaceship.add(leftWingTrail);

// Right wing trail
const rightWingTrailCount = 50;
const rightWingTrailGeometry = new THREE.BufferGeometry();
const rightWingTrailPositions = new Float32Array(rightWingTrailCount * 3);
const rightWingTrailSizes = new Float32Array(rightWingTrailCount);
const rightWingTrailOpacities = new Float32Array(rightWingTrailCount);

// Initialize right wing trail particles
for (let i = 0; i < rightWingTrailCount; i++) {
    const i3 = i * 3;
    rightWingTrailPositions[i3] = 2.5; // x position at right wing tip
    rightWingTrailPositions[i3 + 1] = 0.1; // y position
    rightWingTrailPositions[i3 + 2] = -0.5 + (Math.random() * 0.2); // z position with slight randomness
    rightWingTrailSizes[i] = Math.random() * 0.3 + 0.1;
    rightWingTrailOpacities[i] = 0; // Start invisible
}

rightWingTrailGeometry.setAttribute('position', new THREE.BufferAttribute(rightWingTrailPositions, 3));
rightWingTrailGeometry.setAttribute('size', new THREE.BufferAttribute(rightWingTrailSizes, 1));
rightWingTrailGeometry.setAttribute('opacity', new THREE.BufferAttribute(rightWingTrailOpacities, 1));

const rightWingTrail = new THREE.Points(rightWingTrailGeometry, wingTrailMaterial.clone());
spaceship.add(rightWingTrail);

// Store references to the trails for animation
spaceship.userData.leftWingTrail = leftWingTrail;
spaceship.userData.rightWingTrail = rightWingTrail;

// Add subtle engine glow at the back of the ship
const engineGlowGeometry = new THREE.OctahedronGeometry(0.4, 0); // Low-poly octahedron, smaller
const engineGlowMaterial = new THREE.MeshBasicMaterial({
    color: 0xff3300, // Back to orange-red color
    transparent: true,
    opacity: 0.6, // More subtle
    flatShading: true // Enable flat shading for low-poly look
});
const engineGlow = new THREE.Mesh(engineGlowGeometry, engineGlowMaterial);
// Position at positive z (visual back of ship)
engineGlow.position.z = 2;
spaceship.add(engineGlow);

// Create a minimal thruster effect (invisible but keeping the reference for code compatibility)
const thruster = new THREE.Object3D(); // Empty object instead of visible mesh
thruster.position.z = 2.5; // Positive z for visual back
spaceship.add(thruster);
thruster.visible = false; // Keep this false as we're not using the visible thruster

// Create thruster light
const thrusterLight = new THREE.PointLight(0xff5500, 0, 12); // Orange light
thrusterLight.position.z = 3; // Positive z for visual back
spaceship.add(thrusterLight);

// Add collision sphere for the spaceship (invisible)
spaceship.userData.collisionRadius = 3; // Collision radius for the spaceship

// Position the spaceship (much smaller scale)
spaceship.scale.set(0.8, 0.8, 0.8);
spaceship.position.set(0, 0, 15);
// Rotate 180 degrees to face backward (but visually forward)
// Rotation order already set above
scene.add(spaceship);

// Update collision radius to match smaller ship
spaceship.userData.collisionRadius = 1.2;

// Add a more subtle pulsing animation to the engine glow
gsap.to(engineGlow.scale, {
    x: 1.3,
    y: 1.3,
    z: 1.3,
    duration: 0.3,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut' // Smoother sine wave animation
});

// Add rotation to the engine glow for more dynamic effect
gsap.to(engineGlow.rotation, {
    y: Math.PI * 2,
    duration: 4,
    repeat: -1,
    ease: 'none'
});

// Set rotation order for stable Euler angle conversions
spaceship.rotation.order = 'YXZ';

// Create particle system for thruster
const particleCount = 200;
const particleGeometry = new THREE.BufferGeometry();
const particlePositions = new Float32Array(particleCount * 3);
const particleSizes = new Float32Array(particleCount);

// Initialize particles at random positions at the visual back of ship - smaller particles
for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    particlePositions[i3] = (Math.random() - 0.5) * 0.3; // Narrower spread
    particlePositions[i3 + 1] = (Math.random() - 0.5) * 0.3; // Narrower spread
    particlePositions[i3 + 2] = 2 + Math.random() * 4; // Longer trail
    particleSizes[i] = Math.random() * 0.2 + 0.05; // Smaller particles
}

particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
particleGeometry.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));

// Create particle material with orange-red colors
const particleMaterial = new THREE.PointsMaterial({
    color: 0xff7700, // Orange-red color for particles
    size: 0.3, // Keep the smaller size
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true
});

const thrusterParticles = new THREE.Points(particleGeometry, particleMaterial);
thrusterParticles.visible = false;
spaceship.add(thrusterParticles);

// Setup orbital movement for main planets
setupOrbitalMovement(planets['home'], 40, 0.02);
setupOrbitalMovement(planets['skills'], 60, 0.015);
setupOrbitalMovement(planets['about'], 80, 0.01);
setupOrbitalMovement(planets['contact'], 100, 0.005);
setupOrbitalMovement(planets['work'], 120, 0.008);
setupOrbitalMovement(planets['projects'], 140, 0.006);
// Archive planet removed

// Setup orbital movement for project planets around the projects hub
setupOrbitalMovement(planets['ampleharvest'], 15, 0.03, planets['projects']);
setupOrbitalMovement(planets['qaoa'], 15, 0.04, planets['projects']);
setupOrbitalMovement(planets['facies'], 20, 0.035, planets['projects']);
setupOrbitalMovement(planets['boulder'], 20, 0.025, planets['projects']);
setupOrbitalMovement(planets['momentum'], 25, 0.02, planets['projects']);
setupOrbitalMovement(planets['burger'], 25, 0.015, planets['projects']);
setupOrbitalMovement(planets['galaxsea'], 30, 0.01, planets['projects']);
setupOrbitalMovement(planets['skyfarer'], 30, 0.005, planets['projects']);

// Create stars
const starsGeometry = new THREE.BufferGeometry();
const starsCount = 1000;
const starsPositions = new Float32Array(starsCount * 3);

for (let i = 0; i < starsCount; i++) {
    const i3 = i * 3;
    starsPositions[i3] = (Math.random() - 0.5) * 300;
    starsPositions[i3 + 1] = (Math.random() - 0.5) * 300;
    starsPositions[i3 + 2] = (Math.random() - 0.5) * 300;
}

starsGeometry.setAttribute('position', new THREE.BufferAttribute(starsPositions, 3));

const starsMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 1,
    sizeAttenuation: true
});

const stars = new THREE.Points(starsGeometry, starsMaterial);
scene.add(stars);

// Lights - add plenty of light to make sure everything is visible
// Ambient light - increase intensity to make planets more visible
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

// Directional light (sun-like)
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(50, 50, 50);
scene.add(directionalLight);

// Add a second directional light from another angle
const secondaryLight = new THREE.DirectionalLight(0xffffcc, 0.5);
secondaryLight.position.set(-50, 20, -50);
scene.add(secondaryLight);

// Add a subtle point light at the center for overall illumination
const centerLight = new THREE.PointLight(0xffffff, 0.3, 100);
centerLight.position.set(0, 0, 0);
scene.add(centerLight);

// Add a light that follows the camera to illuminate the spaceship
const spaceshipLight = new THREE.PointLight(0xffffff, 1, 30);
spaceshipLight.position.set(0, 5, 20);
scene.add(spaceshipLight);

// Add point lights at each planet with increased intensity
const homeLightColor = new THREE.Color(0x5d9cec);
const homePointLight = new THREE.PointLight(homeLightColor, 3, 50);
homePointLight.position.copy(homePlanet.position);
scene.add(homePointLight);

const projectsLightColor = new THREE.Color(0x8c7ae6);
const projectsPointLight = new THREE.PointLight(projectsLightColor, 3, 50);
projectsPointLight.position.copy(projectsPlanet.position);
scene.add(projectsPointLight);

const skillsLightColor = new THREE.Color(0x4cd137);
const skillsPointLight = new THREE.PointLight(skillsLightColor, 3, 50);
skillsPointLight.position.copy(skillsPlanet.position);
scene.add(skillsPointLight);

const aboutLightColor = new THREE.Color(0xe84118);
const aboutPointLight = new THREE.PointLight(aboutLightColor, 3, 50);
aboutPointLight.position.copy(aboutPlanet.position);
scene.add(aboutPointLight);

const contactLightColor = new THREE.Color(0xfbc531);
const contactPointLight = new THREE.PointLight(contactLightColor, 3, 50);
contactPointLight.position.copy(contactPlanet.position);
scene.add(contactPointLight);

// Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000);
camera.position.set(0, 5, 20);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enableZoom = true;
controls.enablePan = false;
controls.maxDistance = 100;
controls.minDistance = 5;

// Prevent camera from flipping upside down
controls.minPolarAngle = Math.PI * 0.05; // Slightly above horizon
controls.maxPolarAngle = Math.PI * 0.95; // Slightly below horizon
controls.enableRotate = false; // Disable manual rotation since we control it programmatically

// Renderer
let composer;
let bloomPass;
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Post-processing
    composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        1.5, // strength - for a constant sun bloom
        0.7, // radius - for a corona-like spread
        0.75 // threshold - to make the sun's surface bloom
    );
    composer.addPass(bloomPass);

// Navigation
let currentPlanet = 'home';
let isNavigating = false;
let nearbyPlanet = null;
let visitPopupVisible = false;
let inPlanetView = false; // Flag to track if we're in planet view mode

// Create a popup for planet visits
const visitPopup = document.createElement('div');
visitPopup.className = 'visit-popup';
visitPopup.innerHTML = 'Press SHIFT to visit';
visitPopup.style.position = 'absolute';
visitPopup.style.bottom = '20%';
visitPopup.style.left = '50%';
visitPopup.style.transform = 'translateX(-50%)';
visitPopup.style.backgroundColor = 'rgba(0, 10, 30, 0.7)';
visitPopup.style.color = '#ffffff';
visitPopup.style.padding = '10px 20px';
visitPopup.style.borderRadius = '5px';
visitPopup.style.fontFamily = "'Orbitron', sans-serif";
visitPopup.style.fontSize = '16px';
visitPopup.style.border = '1px solid rgba(93, 156, 236, 0.5)';
visitPopup.style.boxShadow = '0 0 15px rgba(93, 156, 236, 0.3)';
visitPopup.style.display = 'none';
visitPopup.style.zIndex = '100';
document.body.appendChild(visitPopup);

// Create exit button - styled like the original site's buttons
const exitButton = document.createElement('div');
exitButton.className = 'exit-button';
exitButton.innerHTML = 'CLOSE & EXIT PLANET';
exitButton.style.position = 'fixed';
exitButton.style.bottom = '30px';
exitButton.style.left = '50%';
exitButton.style.transform = 'translateX(-50%)';
exitButton.style.backgroundColor = 'rgba(93, 156, 236, 0.3)';
exitButton.style.color = '#e0e0ff';
exitButton.style.padding = '15px 30px';
exitButton.style.borderRadius = '30px';
exitButton.style.fontFamily = "'Orbitron', sans-serif";
exitButton.style.fontSize = '16px';
exitButton.style.border = '1px solid rgba(93, 156, 236, 0.5)';
exitButton.style.boxShadow = '0 0 15px rgba(93, 156, 236, 0.3)';
exitButton.style.cursor = 'pointer';
exitButton.style.display = 'none';
exitButton.style.zIndex = '1001';
exitButton.style.marginTop = '30px';
exitButton.style.transition = 'all 0.3s ease';
document.body.appendChild(exitButton);

// Add hover effect
exitButton.addEventListener('mouseover', () => {
    exitButton.style.backgroundColor = 'rgba(93, 156, 236, 0.5)';
    exitButton.style.boxShadow = '0 0 15px rgba(93, 156, 236, 0.5)';
});

exitButton.addEventListener('mouseout', () => {
    exitButton.style.backgroundColor = 'rgba(93, 156, 236, 0.3)';
    exitButton.style.boxShadow = '0 0 15px rgba(93, 156, 236, 0.3)';
});

// Add click event to exit button
exitButton.addEventListener('click', exitPlanetView);

// Create planet info popup container - full screen version with exact original styling
const planetInfoPopup = document.createElement('div');
planetInfoPopup.className = 'planet-info-popup';
planetInfoPopup.style.position = 'fixed';
planetInfoPopup.style.top = '0';
planetInfoPopup.style.left = '0';
planetInfoPopup.style.width = '100%';
planetInfoPopup.style.height = '100%';
planetInfoPopup.style.backgroundColor = 'rgba(0, 10, 30, 0.92)';
planetInfoPopup.style.color = '#e0e0ff';
planetInfoPopup.style.padding = '40px';
planetInfoPopup.style.fontFamily = "'Space Mono', monospace";
planetInfoPopup.style.fontSize = '16px';
planetInfoPopup.style.boxSizing = 'border-box';
planetInfoPopup.style.overflowY = 'auto';
planetInfoPopup.style.display = 'none';
planetInfoPopup.style.zIndex = '1000';
planetInfoPopup.style.backdropFilter = 'blur(10px)';

// Add animation properties
planetInfoPopup.style.opacity = '0';
planetInfoPopup.style.transform = 'translateY(20px)';
planetInfoPopup.style.transition = 'opacity 0.5s ease, transform 0.5s ease';

document.body.appendChild(planetInfoPopup);

// Function to show planet info popup
/**
 * Shows the information popup for a specific planet
 * @param {string} planetName - Name of the planet to show info for
 */
async function showPlanetInfoPopup(planetName) {
    // Reset popup styling for animation
    planetInfoPopup.style.opacity = '0';
    planetInfoPopup.style.transform = 'translateY(20px)';
    planetInfoPopup.innerHTML = '<div class="popup-content markdown-content"><p>Loading...</p></div>'; // Initial loading state
    let popupContent = ''; // Declare popupContent to be used by some switch cases

    // Function to add common event listeners and project-specific animations
    // Function to initialize lazy loading for background images
    function initLazyLoading() {
        const lazyBackgrounds = document.querySelectorAll('.lazy-bg');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        const src = img.getAttribute('data-src');
                        if (src) {
                            img.style.backgroundImage = `url('${src}')`;
                            img.classList.add('loaded');
                            imageObserver.unobserve(img);
                        }
                    }
                });
            }, { rootMargin: '0px 0px 200px 0px' }); // Start loading images 200px before they enter viewport
            
            lazyBackgrounds.forEach(img => imageObserver.observe(img));
        } else {
            // Fallback for browsers that don't support IntersectionObserver
            lazyBackgrounds.forEach(img => {
                const src = img.getAttribute('data-src');
                if (src) {
                    img.style.backgroundImage = `url('${src}')`;
                    img.classList.add('loaded');
                }
            });
        }
    }
    
    function commonFinalSetupLogic(currentPlanetName) {
        document.querySelectorAll('.project-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const projectNameAttribute = e.currentTarget.getAttribute('data-project');
                if (projectNameAttribute) { // Ensure the attribute exists
                    showProjectDetails(projectNameAttribute);
                }
            });
        });
        
        // Initialize lazy loading for background images
        if (document.querySelectorAll('.lazy-bg').length > 0) {
            initLazyLoading();
        }
        
        // Trigger animations for project sections if this is the projects overview planet
        if (currentPlanetName === 'projects') {
            setTimeout(() => {
                const projectsAI = document.querySelector('#projects-ai');
                if (projectsAI) projectsAI.classList.add('active');
                
                setTimeout(() => {
                    const projectsGames = document.querySelector('#projects-games');
                    if (projectsGames) projectsGames.classList.add('active');
                }, 300); // Delay for the second section
            }, 100); // Delay after popup is visible
        }
    }

    // Function to fetch and render markdown
    const fetchAndRenderMarkdown = async (mdPath) => {
        try {
            const response = await fetch(mdPath);
            if (!response.ok) {
                throw new Error(`Failed to load ${mdPath}: ${response.statusText}`);
            }
            const markdownText = await response.text();
            const htmlContent = marked.parse(markdownText);
            planetInfoPopup.innerHTML = `<div class="popup-content markdown-content">${htmlContent}</div>`;
        } catch (error) {
            console.error('Error fetching or parsing markdown:', error);
            planetInfoPopup.innerHTML = `<div class="popup-content markdown-content"><p>Error loading content: ${error.message}</p></div>`;
        }
        // Animate popup in after content is set (or error displayed)
        setTimeout(() => {
            planetInfoPopup.style.opacity = '1';
            planetInfoPopup.style.transform = 'translateY(0)';
            commonFinalSetupLogic(planetName); // Call common setup
            
            // Add specific animation for work items if this is the work planet
            if (planetName === 'work') {
                setTimeout(() => {
                    const workItems = document.querySelectorAll('.fade-in-item');
                    workItems.forEach((item, index) => {
                        setTimeout(() => {
                            item.classList.add('active');
                        }, 100 * index); // Staggered animation
                    });
                }, 300);
            }
        }, 50);
    };

    switch(planetName) {
        case 'home':
            // Home planet popup with dynamic elements and updated content
            planetInfoPopup.innerHTML = `
                <div class="popup-content">
                    <div class="cosmic-background">
                        <div class="star-field"></div>
                        <div class="nebula-glow"></div>
                    </div>
                    
                    <div class="typing-container" id="popup-typing-container">
                        <div class="massive-name" id="popup-massive-name">
                            <span class="letter-animate">A</span>
                            <span class="letter-animate">D</span>
                            <span class="letter-animate">V</span>
                            <span class="letter-animate">I</span>
                            <span class="letter-animate">K</span>
                            <span class="letter-animate">A</span>
                            <span class="letter-animate">R</span>
                        </div>
                        <div class="typed-text-container">
                            <div class="typed-prefix">is </div>
                            <div class="typed-text" id="popup-typed-text"></div>
                        </div>
                    </div>
                    
                    <div class="home-content" id="home-content" style="margin-top: -10px; opacity: 0;">
                        <div class="intro-card">
                            <p class="dynamic-intro">I'm currently studying at Harvard, with interests in Software and AI/Machine Learning. I'm not sure what I want to do in the future, but I'd like to work on something impact focused with an emphasis on applied AI/ML. In my free time, I enjoy exploring new places, playing basketball, and looking at rocks. I have some big plans coming soon. </p>
                        </div>
                        
                        <div class="social-links animated-links">
                            <a href="https://github.com/AdvikarA" title="GitHub" class="bounce-hover"><i class="fab fa-github"></i></a>
                            <a href="https://www.linkedin.com/in/advikar-ananthkumar-79b568311/" title="LinkedIn" class="bounce-hover"><i class="fab fa-linkedin"></i></a>
                            <a href="https://open.spotify.com/user/cyanair24" title="Spotify" class="bounce-hover"><i class="fab fa-spotify"></i></a>
                            <a href="https://discord.com/users/cyanair24" title="Discord" class="bounce-hover"><i class="fab fa-discord"></i></a>
                        </div>
                        
                        <div class="highlighted-work">
                            <h3 class="section-title">Current Projects</h3>
                            <div class="work-items">
                                <div class="work-item fade-in-item">
                                    <div class="work-icon"><i class="fas fa-robot"></i></div>
                                    <div class="work-content">
                                        <h5>AI Agents</h5>
                                        <p>Building autonomous agents for recruitment and productivity</p>
                                    </div>
                                </div>
                                <div class="work-item fade-in-item">
                                    <div class="work-icon"><i class="fas fa-brain"></i></div>
                                    <div class="work-content">
                                        <h5>LLM Research</h5>
                                        <p>Exploring image interpretation capabilities with Google</p>
                                    </div>
                                </div>
                                <div class="work-item fade-in-item">
                                    <div class="work-icon"><i class="fas fa-rocket"></i></div>
                                    <div class="work-content">
                                        <h5>Stealth Startup</h5>
                                        <p>Full stack development for an exciting new venture</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="projects-button-container" style="margin-top: 25px; text-align: center;">
                                <button id="view-projects-button" class="view-projects-button pulse-animation">View All Projects</button>
                            </div>
                        </div>
                        

                    </div>
                </div>
            `;
            
            // Show home content and animate popup
            setTimeout(() => {
                planetInfoPopup.style.opacity = '1';
                planetInfoPopup.style.transform = 'translateY(0)';
                
                // Animate in the work items with staggered delay
                setTimeout(() => {
                    const workItems = document.querySelectorAll('.fade-in-item');
                    workItems.forEach((item, index) => {
                        setTimeout(() => {
                            item.classList.add('active');
                        }, 100 * index); // Staggered animation
                    });
                    
                    // Fade in the home content
                    const homeContent = document.getElementById('home-content');
                    if (homeContent) {
                        homeContent.style.opacity = '1';
                        homeContent.style.transform = 'translateY(0)';
                    }
                }, 300);
                
                // Add event listener for the View All Projects button
                const projectsButton = document.getElementById('view-projects-button');
                if (projectsButton) {
                    projectsButton.addEventListener('click', () => {
                        // Navigate to projects planet
                        navigateToPlanet('projects');
                    });
                }
                
                initPopupTypingAnimation(); // Initialize typing animation
                commonFinalSetupLogic(planetName); // Call common setup
            }, 100);
            
            /**
             * Initializes the typing animation in the popup
             */
            function initPopupTypingAnimation() {
                // Make sure the popup is fully rendered before accessing elements
                const nameElement = document.getElementById('popup-massive-name');
                const typedTextElement = document.getElementById('popup-typed-text');
                const homeContent = document.getElementById('home-content');
                
                if (!nameElement || !typedTextElement) {
                    // If elements aren't available yet, try again after a short delay
                    setTimeout(initPopupTypingAnimation, 100);
                    return;
                }
                
                // Animate the name
                const nameSpans = nameElement.querySelectorAll('span');
                nameSpans.forEach((span, index) => {
                    setTimeout(() => {
                        span.classList.add('visible');
                    }, 100 * index);
                });
                
                // Start the typing animation
                const phrases = [
                    'a developer',
                    'a wannabe start up founder',
                    'unemployed'
                ];
                
                let currentPhraseIndex = 0;
                let currentCharIndex = 0;
                let isDeleting = false;
                let typingSpeed = 100;
                
                // Store the animation timer ID so we can clear it later
                let typingAnimationTimer;
                
                function typeText() {
                    // Check if the popup is still visible
                    const popup = document.querySelector('.planet-info-popup');
                    if (!popup || popup.style.display === 'none') {
                        // If popup is closed, stop the animation
                        return;
                    }
                    
                    const currentPhrase = phrases[currentPhraseIndex];
                    
                    if (isDeleting) {
                        typedTextElement.textContent = currentPhrase.substring(0, currentCharIndex - 1);
                        currentCharIndex--;
                        typingSpeed = 50;
                    } else {
                        typedTextElement.textContent = currentPhrase.substring(0, currentCharIndex + 1);
                        currentCharIndex++;
                        typingSpeed = 100;
                    }
                    
                    // Add typing class when actively typing
                    if (currentCharIndex > 0) {
                        typedTextElement.classList.add('typing');
                    } else {
                        typedTextElement.classList.remove('typing');
                    }
                    
                    if (!isDeleting && currentCharIndex === currentPhrase.length) {
                        isDeleting = true;
                        typingSpeed = 1000; // Pause at the end of typing
                    } else if (isDeleting && currentCharIndex === 0) {
                        isDeleting = false;
                        currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length;
                        typingSpeed = 500; // Pause before starting new phrase
                    }
                    
                    // Store the timer ID so we can clear it if needed
                    typingAnimationTimer = setTimeout(typeText, typingSpeed);
                }
                
                // Start the typing animation
                setTimeout(() => {
                    typeText();
                    
                    // Fade in the home content after the animation starts
                    if (homeContent) {
                        setTimeout(() => {
                            homeContent.style.transition = 'opacity 1s ease';
                            homeContent.style.opacity = '1';
                        }, 2000);
                    }
                }, 1000);
            }
            break;
        case 'about':
            popupContent = `
                <div class="popup-content">
                    <div class="profile-section">
                        <div class="profile-image">
                            <img src="../img/headshot.jpeg" alt="Profile Picture" class="profile-img">
                        </div>
                        <div class="profile-info">
                            <h2>About Me</h2>
                            <p>Harvard CS student passionate about AI, startups, and technology.</p>
                        </div>
                    </div>
                    
                    <div class="about-section">
                        <h3>Stuff I'm Working On</h3>
                        <div class="current-projects">
                            <div class="project-card">
                                <h4>AI Agents</h4>
                                <p>Building autonomous agents for recruitment and productivity</p>
                            </div>
                            <div class="project-card">
                                <h4>LLM Research</h4>
                                <p>Exploring image interpretation capabilities with Google</p>
                            </div>
                            <div class="project-card">
                                <h4>Stealth Startup</h4>
                                <p>Full stack development for an exciting new venture</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="about-section">
                        <h3>Gallery</h3>
                        <div class="album">
                            <div class="responsive-container-block bg">
                                <!-- First Column -->
                                <div class="responsive-container-block img-cont">
                                    <div class="gallery-image lazy-bg" data-src="../img/about/IMG_0542.jpeg">
                                        <div class="caption">
                                            <p>NH hike 2024</p>
                                        </div>
                                    </div>
                                    <div class="gallery-image lazy-bg" data-src="../img/about/IMG_0736.jpeg">
                                        <div class="caption">
                                            <p>Puerto Rico trip</p>
                                        </div>
                                    </div>
                                    <div class="gallery-image lazy-bg" data-src="../img/about/IMG_1369.jpeg">
                                
                                    </div>
                                    <div class="gallery-image lazy-bg" data-src="../img/about/IMG_1906.jpeg">
                                        <div class="caption">
                                            <p>Senior Year HS</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Second Column -->
                                <div class="responsive-container-block img-cont">
                                    <div class="gallery-image img-big lazy-bg" data-src="../img/about/IMG_1954.jpeg">
                                        <div class="caption">
                                            <p>Proof I work</p>
                                        </div>
                                    </div>
                                    <div class="gallery-image img-big lazy-bg" data-src="../img/about/IMG_2396.jpeg">
                                        <div class="caption">
                                            <p>Election day 2024</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Third Column -->
                                <div class="responsive-container-block img-cont">
                                    <div class="gallery-image lazy-bg" data-src="../img/about/IMG_2419.jpeg">
                                        <div class="caption">
                                            <p>US Earth Science Camp 2023</p>
                                        </div>
                                    </div>
                                    <div class="gallery-image lazy-bg" data-src="../img/about/IMG_2582.jpeg">
                                        <div class="caption">
                                            <p>National High School Game Academy 2023</p>
                                        </div>
                                    </div>
                                    <div class="gallery-image lazy-bg" data-src="../img/about/IMG_3835.jpeg">
                                        <div class="caption">
                                            <p>SciOly</p>
                                        </div>
                                    </div>
                                    <div class="gallery-image lazy-bg" data-src="../img/about/IMG_4180.jpeg">
                                        
                                    </div>
                                </div>
                                
                                <!-- Fourth Column -->
                                <div class="responsive-container-block img-cont">
                                    <div class="gallery-image img-big lazy-bg" data-src="../img/about/447785391_914211827404490_844395448136633570_n.jpeg">
                                        <div class="caption">
                                            <p>HS Graduation</p>
                                        </div>
                                    </div>
                                    <div class="gallery-image img-big" style="background-image: url('../img/about/448030336_914663567359316_4875574797276855298_n.jpeg');">
                                        
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="about-section">
                        <h3>Featured Video</h3>
                        <div class="video-container">
                            <!-- YouTube video embed -->
                            <iframe 
                                width="100%" 
                                height="315" 
                                src="https://www.youtube.com/embed/s9GFkTlP6ME" 
                                title="YouTube video" 
                                frameborder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowfullscreen
                            ></iframe>
                        </div>
                    </div>
                    
                    <style>
                        .about-section {
                            margin-top: 40px;
                        }
                        
                        .video-container {
                            margin-top: 20px;
                            position: relative;
                            width: 100%;
                            height: 0;
                            padding-bottom: 56.25%; /* 16:9 aspect ratio */
                            overflow: hidden;
                            border-radius: 8px;
                            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
                        }
                        
                        .video-container iframe {
                            position: absolute;
                            top: 0;
                            left: 0;
                            width: 100%;
                            height: 100%;
                            border-radius: 8px;
                        }
                        
                        .about-section h3 {
                            color: #5d9cec;
                            border-bottom: 2px solid #5d9cec;
                            padding-bottom: 10px;
                            margin-bottom: 20px;
                            font-family: 'Orbitron', sans-serif;
                        }
                        
                        /* Current projects styling */
                        .current-projects {
                            display: grid;
                            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                            gap: 20px;
                            margin-top: 20px;
                        }
                        
                        .project-card {
                            background: rgba(13, 20, 33, 0.7);
                            border-radius: 8px;
                            padding: 20px;
                            border-left: 4px solid #5d9cec;
                            transition: all 0.3s ease;
                        }
                        
                        .project-card:hover {
                            transform: translateY(-5px);
                            box-shadow: 0 5px 15px rgba(93, 156, 236, 0.3);
                        }
                        
                        .project-card h4 {
                            margin: 0 0 10px;
                            color: #5d9cec;
                        }
                        
                        .project-card p {
                            margin: 0;
                            font-size: 0.9rem;
                            opacity: 0.9;
                        }
                        
                        /* YouTube placeholder styling */
                        .video-container {
                            margin-top: 20px;
                            width: 100%;
                        }
                        
                        .youtube-placeholder {
                            background: rgba(0, 0, 0, 0.7);
                            border-radius: 8px;
                            aspect-ratio: 16/9;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            cursor: pointer;
                            transition: all 0.3s ease;
                        }
                        
                        .youtube-placeholder:hover {
                            background: rgba(0, 0, 0, 0.8);
                        }
                        
                        .play-button {
                            width: 70px;
                            height: 70px;
                            background: rgba(255, 0, 0, 0.7);
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 30px;
                            margin-bottom: 15px;
                            transition: all 0.3s ease;
                        }
                        
                        .youtube-placeholder:hover .play-button {
                            transform: scale(1.1);
                            background: rgba(255, 0, 0, 0.9);
                        }
                        
                        /* Profile section styling */
                        .profile-section {
                            display: flex;
                            align-items: center;
                            gap: 30px;
                            margin-bottom: 30px;
                            padding-bottom: 20px;
                            border-bottom: 1px solid rgba(93, 156, 236, 0.3);
                        }
                        
                        .profile-image {
                            width: 150px;
                            height: 150px;
                            flex-shrink: 0;
                            border-radius: 50%;
                            overflow: hidden;
                            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
                            border: 3px solid rgba(93, 156, 236, 0.3);
                        }
                        
                        .profile-img {
                            width: 100%;
                            height: 100%;
                            object-fit: cover;
                            object-position: center top;
                            transition: transform 0.3s ease;
                        }
                        
                        .profile-img:hover {
                            transform: scale(1.05);
                        }
                        
                        .profile-info {
                            flex-grow: 1;
                        }
                        
                        .profile-info h2 {
                            margin-top: 0;
                            color: #5d9cec;
                        }
                        
                        /* Album Gallery styling */
                        .album .responsive-container-block {
                            min-height: 75px;
                            height: fit-content;
                            width: 100%;
                            padding: 10px;
                            display: flex;
                            flex-wrap: wrap;
                            margin: 0 auto;
                            justify-content: flex-start;
                        }
                        
                        .album .responsive-container-block.bg {
                            max-width: 100%;
                            margin: 0;
                            justify-content: space-between;
                        }
                        
                        .album .responsive-container-block.img-cont {
                            flex-direction: column;
                            max-width: 25%;
                            min-height: auto;
                            margin: 0;
                            height: 100%;
                        }
                        
                        .gallery-image {
                            width: 100%;
                            height: 100%;
                            margin: 0 0 15px 0;
                            position: relative;
                            overflow: hidden;
                            border-radius: 8px;
                            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
                            transition: all 0.3s ease;
                            background-size: cover;
                            background-position: center;
                            min-height: 150px;
                        }
                        
                        .gallery-image.img-big {
                            height: 250px;
                            margin: 0 0 15px 0;
                        }
                        
                        .gallery-image:hover {
                            transform: scale(1.03);
                        }
                        
                        /* Responsive styles for album gallery */
                        @media (max-width: 992px) {
                            .album .responsive-container-block.img-cont {
                                max-width: 50%;
                            }
                        }
                        
                        @media (max-width: 768px) {
                            .album .responsive-container-block.img-cont {
                                max-width: 100%;
                                flex-direction: row;
                                justify-content: space-between;
                                flex-wrap: wrap;
                            }
                            
                            .gallery-image {
                                max-width: 48%;
                                margin: 0 0 15px 0;
                            }
                            
                            .gallery-image.img-big {
                                max-width: 48%;
                                height: 200px;
                            }
                        }
                        
                        @media (max-width: 500px) {
                            .gallery-image, .gallery-image.img-big {
                                max-width: 100%;
                                margin: 0 0 15px 0;
                            }
                        }
                        
                        /* Gallery image styling */
                        .gallery-image {
                            background-size: cover;
                            background-position: center;
                            background-repeat: no-repeat;
                        }
                        
                        .caption {
                            position: absolute;
                            top: 0;
                            left: 0;
                            width: 100%;
                            height: 100%;
                            background: rgba(0, 0, 0, 0.7);
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            opacity: 0;
                            transition: opacity 0.3s ease;
                            border-radius: 8px;
                        }
                        
                        .gallery-image:hover .caption {
                            opacity: 1;
                        }
                        
                        .caption p {
                            color: white;
                            font-size: 16px;
                            text-align: center;
                            padding: 10px;
                            margin: 0;
                            font-weight: 500;
                            letter-spacing: 0.5px;
                        }
                        
                        /* Background colors for gallery images */
                        .gallery-image.image1 { background: linear-gradient(135deg, #5d9cec, #3b6cad); }
                        .gallery-image.image2 { background: linear-gradient(135deg, #6c8ddd, #4a6cb7); }
                        .gallery-image.image3 { background: linear-gradient(135deg, #7a7ce0, #5658c7); }
                        .gallery-image.image4 { background: linear-gradient(135deg, #8a6ad4, #6b4db8); }
                        .gallery-image.image5 { background: linear-gradient(135deg, #9c59d1, #7e3eb0); }
                        .gallery-image.image6 { background: linear-gradient(135deg, #ad48c8, #8f2da6); }
                        .gallery-image.image7 { background: linear-gradient(135deg, #c038be, #a01d9c); }
                        .gallery-image.image8 { background: linear-gradient(135deg, #d328b4, #b20e92); }
                        .gallery-image.image9 { background: linear-gradient(135deg, #e619aa, #c30088); }
                        .gallery-image.image10 { background: linear-gradient(135deg, #f70a9f, #d4007e); }
                    </style>
                </div>
            `;
            break;
        case 'skills':
            popupContent = `
                <div class="popup-content">
                    <h2>Skills</h2>
                    <p>Technologies and skills I've been working with:</p>
                    <div class="skills-grid">
                        <div class="skill-category">
                            <h3>Programming Languages</h3>
                            <h4>Proficient</h4>
                            <ul>
                                <li>C++</li>
                                <li>Python</li>
                            </ul>
                            <h4>Familiar</h4>
                            <ul>
                                <li>Java</li>
                                <li>HTML/CSS</li>
                                <li>JavaScript</li>
                                <li>C#</li>
                            </ul>
                        </div>
                        
                        <div class="skill-category">
                            <h3>Technologies</h3>
                            <ul>
                                <li>Visual Studio Code</li>
                                <li>GitHub</li>
                                <li>Unity</li>
                                <li>Google Cloud</li>
                                <li>Vertex AI</li>
                                <li>Streamlit</li>
                                <li>QGIS</li>
                            </ul>
                        </div>
                        
                        <div class="skill-category">
                            <h3>Content</h3>
                            <ul>
                                <li>Data Structures & Algorithms</li>
                                <li>Computer Systems</li>
                                <li>Machine Learning Architecture</li>
                                <li>Reinforcement Learning</li>
                            </ul>
                        </div>
                        
                        <div class="skill-category">
                            <h3>Misc</h3>
                            <ul>
                                <li>Video Editing</li>
                            </ul>
                        </div>
                    </div>
                </div>
                    </div>
                </div>
            `;
            break;
        case 'contact':
            popupContent = `
                <div class="popup-content cosmic-contact">
                    <div class="cosmic-header">
                        <div class="stars-bg"></div>
                        <h2>Contact</h2>
                        <p>Establish contact through these channels:</p>
                    </div>
                    
                    <div class="social-links-container">
                        <a href="https://github.com/AdvikarA" class="social-link" target="_blank">
                            <div class="social-icon github">
                                <i class="fab fa-github"></i>
                            </div>
                            <div class="social-info">
                                <h3>GitHub</h3>
                                <p>Explore my code repositories</p>
                            </div>
                            <div class="cosmic-trail"></div>
                        </a>
                        
                        <a href="https://www.linkedin.com/in/advikar-ananthkumar-79b568311/" class="social-link" target="_blank">
                            <div class="social-icon linkedin">
                                <i class="fab fa-linkedin"></i>
                            </div>
                            <div class="social-info">
                                <h3>LinkedIn</h3>
                                <p>Professional network connection</p>
                            </div>
                            <div class="cosmic-trail"></div>
                        </a>
                        
                        <a href="mailto:advikar_ananthkumar@college.harvard.edu" class="social-link">
                            <div class="social-icon email">
                                <i class="fas fa-envelope"></i>
                            </div>
                            <div class="social-info">
                                <h3>Email</h3>
                                <p>advikar_ananthkumar@college.harvard.edu</p>
                            </div>
                            <div class="cosmic-trail"></div>
                        </a>
                        
                        <a href="https://instagram.com/aaadvikar.24" class="social-link" target="_blank">
                            <div class="social-icon instagram">
                                <i class="fab fa-instagram"></i>
                            </div>
                            <div class="social-info">
                                <h3>Instagram</h3>
                                <p>@aaadvikar.24</p>
                            </div>
                            <div class="cosmic-trail"></div>
                        </a>
                    </div>
                    
                    <style>
                        .cosmic-contact {
                            position: relative;
                            overflow: hidden;
                            background: linear-gradient(to bottom, rgba(10, 15, 30, 0.9), rgba(20, 30, 60, 0.9));
                            border-radius: 12px;
                            box-shadow: 0 0 30px rgba(93, 156, 236, 0.2);
                        }
                        
                        .cosmic-header {
                            position: relative;
                            padding: 20px 0;
                            margin-bottom: 30px;
                            text-align: center;
                            overflow: hidden;
                        }
                        
                        .cosmic-header h2 {
                            font-size: 2.5rem;
                            margin-bottom: 10px;
                            background: linear-gradient(45deg, #5d9cec, #a3bffa, #5d9cec);
                            -webkit-background-clip: text;
                            background-clip: text;
                            color: transparent;
                            animation: cosmic-glow 3s infinite alternate;
                            text-shadow: 0 0 15px rgba(93, 156, 236, 0.5);
                        }
                        
                        .stars-bg {
                            position: absolute;
                            top: 0;
                            left: 0;
                            right: 0;
                            bottom: 0;
                            background-image: 
                                radial-gradient(1px 1px at 25px 5px, white, rgba(255,255,255,0)),
                                radial-gradient(1px 1px at 50px 25px, white, rgba(255,255,255,0)),
                                radial-gradient(1px 1px at 125px 20px, white, rgba(255,255,255,0)),
                                radial-gradient(1.5px 1.5px at 50px 75px, white, rgba(255,255,255,0)),
                                radial-gradient(2px 2px at 15px 125px, white, rgba(255,255,255,0)),
                                radial-gradient(2.5px 2.5px at 110px 80px, white, rgba(255,255,255,0));
                            z-index: -1;
                        }
                        
                        .social-links-container {
                            display: flex;
                            flex-direction: column;
                            gap: 20px;
                            margin-top: 30px;
                            position: relative;
                        }
                        
                        .social-link {
                            display: flex;
                            align-items: center;
                            padding: 20px;
                            background: rgba(13, 20, 33, 0.7);
                            border-radius: 12px;
                            text-decoration: none;
                            color: #fff;
                            transition: all 0.4s ease;
                            position: relative;
                            overflow: hidden;
                            border: 1px solid rgba(93, 156, 236, 0.3);
                            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                        }
                        
                        .social-link:hover {
                            transform: translateY(-5px);
                            background: rgba(20, 30, 48, 0.8);
                            box-shadow: 0 8px 25px rgba(93, 156, 236, 0.4);
                            border-color: rgba(93, 156, 236, 0.8);
                        }
                        
                        .social-link:hover .cosmic-trail {
                            opacity: 1;
                        }
                        
                        .cosmic-trail {
                            position: absolute;
                            top: 0;
                            right: 0;
                            width: 50px;
                            height: 100%;
                            background: linear-gradient(90deg, rgba(93, 156, 236, 0), rgba(93, 156, 236, 0.2));
                            opacity: 0;
                            transition: opacity 0.3s ease;
                        }
                        
                        .social-icon {
                            width: 60px;
                            height: 60px;
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 28px;
                            margin-right: 20px;
                            position: relative;
                            z-index: 2;
                            box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
                        }
                        
                        .github {
                            background: linear-gradient(135deg, #333, #222);
                        }
                        
                        .linkedin {
                            background: linear-gradient(135deg, #0077B5, #0e5a8a);
                        }
                        
                        .email {
                            background: linear-gradient(135deg, #D44638, #b23121);
                        }
                        
                        .instagram {
                            background: linear-gradient(45deg, #405DE6, #5851DB, #833AB4, #C13584, #E1306C, #FD1D1D);
                        }
                        
                        .social-info h3 {
                            margin: 0 0 8px;
                            font-family: 'Orbitron', sans-serif;
                            font-size: 1.2rem;
                            letter-spacing: 1px;
                        }
                        
                        .social-info p {
                            margin: 0;
                            opacity: 0.8;
                            font-size: 0.9rem;
                        }
                        
                        @keyframes cosmic-glow {
                            0% { text-shadow: 0 0 5px rgba(93, 156, 236, 0.5); }
                            50% { text-shadow: 0 0 20px rgba(93, 156, 236, 0.8), 0 0 30px rgba(93, 156, 236, 0.4); }
                            100% { text-shadow: 0 0 5px rgba(93, 156, 236, 0.5); }
                        }
                        
                        @media (max-width: 768px) {
                            .social-icon {
                                width: 50px;
                                height: 50px;
                                font-size: 22px;
                            }
                            
                            .cosmic-header h2 {
                                font-size: 2rem;
                            }
                        }
                    </style>
                </div>
            `;
            break;
        case 'work':
            popupContent = `
                <div class="popup-content">
                    <h2>Work Experience</h2>
                    <div class="academic-info">
                        <h3>Coursework & Clubs</h3>
                        <p><strong>Coursework:</strong> Systems Programming, Vector Calculus and Linear Algebra, Planning/Learning AI Methods, Science in the age of AI, Data Structures & Algorithms, Application of Linear Algebra and Machine Learning, Planetary Habitability, Introduction to Economics, Expository Writing</p>
                        <p><strong>Clubs:</strong> Harvard Computer Society, Tech for Social Good, Institute of Politics, Harvard Undergraduate Science Olympiad, Student Astronomers at Harvard-Radcliffe, Harvard Financial Analysts Club (Traditional & Quant), Harvard Undergraduate Quant Traders, Harvard Data Analytics Group (Case Team)</p>
                    </div>
                    
                    <div class="work-sections">
                        <!-- Current Section -->
                        <div class="work-section current-section">
                            <h3>Current</h3>
                            <div class="work-items">
                                <div class="work-item">
                                    <div class="work-header">
                                        <h4>Engineer | Liquid Palladium</h4>
                                    </div>
                                    <div class="work-details">
                                        <p>Working on agentic recruitment and agent architecture at this start-up.</p>
                                    </div>
                                </div>
                                <div class="work-item">
                                    <div class="work-header">
                                        <h4>Engineer | stealth</h4>
                                    </div>
                                    <div class="work-details">
                                        <p>Helping build out full stack MVP.</p>
                                    </div>
                                </div>
                                <div class="work-item">
                                    <div class="work-header">
                                        <h4>Researcher | EPS department</h4>
                                    </div>
                                    <div class="work-details">
                                        <p>Working on LLM image interpretation with Google under the Generative AI program.</p>
                                    </div>
                                </div>
                                <div class="work-item">
                                    <div class="work-header">
                                        <h4>Director of Events for HUSO</h4>
                                    </div>
                                    <div class="work-details">
                                        <p>Harvard Undergrad Science Olympiad.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Previously Section -->
                        <div class="work-section previously-section">
                            <h3>Previously</h3>
                            <div class="work-items">
                                <div class="work-item">
                                    <div class="work-header">
                                        <h4>Analyst for Harvard Data Analytics</h4>
                                    </div>
                                    <div class="work-details">
                                        <p>Helping secret company with AI analysis.</p>
                                    </div>
                                </div>
                                <div class="work-item">
                                    <div class="work-header">
                                        <h4>PM for Harvard Tech for Social Good</h4>
                                    </div>
                                    <div class="work-details">
                                        <p>Worked on 2 projects.</p>
                                    </div>
                                </div>
                                <div class="work-item">
                                    <div class="work-header">
                                        <h4>Software Engineering Intern @ Maitsys</h4>
                                    </div>
                                    <div class="work-details">
                                        <p>Didn't really do anything ngl.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Highschool Section -->
                        <div class="work-section highschool-section">
                            <h3>Highschool</h3>
                            <div class="work-items">
                                <div class="work-item">
                                    <div class="work-header">
                                        <h4>Acton Institute of Computer Science President</h4>
                                    </div>
                                    <div class="work-details">
                                        <p>Nonprofit, taught 2000+ students, 24 countries, $15,000+ raised.</p>
                                    </div>
                                </div>
                                <div class="work-item">
                                    <div class="work-header">
                                        <h4>Noctem Dev President</h4>
                                    </div>
                                    <div class="work-details">
                                        <p>Computing competitions for students, 4 events with 300+ participants.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <style>
                    /* Work sections styling */
                    .work-sections {
                        display: flex;
                        flex-direction: column;
                        gap: 40px;
                        margin-top: 30px;
                    }
                    
                    .academic-info {
                        background: rgba(13, 20, 33, 0.7);
                        border-left: 4px solid #5d9cec;
                        padding: 15px 20px;
                        border-radius: 0 8px 8px 0;
                        margin-top: 20px;
                        margin-bottom: 30px;
                        display: block;
                        opacity: 1;
                    }
                    
                    .academic-info h3 {
                        color: #5d9cec;
                        margin-top: 0;
                        margin-bottom: 15px;
                        font-family: 'Orbitron', sans-serif;
                    }
                    
                    .academic-info p {
                        margin-bottom: 10px;
                        line-height: 1.6;
                    }
                    
                    .work-section h3 {
                        color: #5d9cec;
                        border-bottom: 2px solid #5d9cec;
                        padding-bottom: 10px;
                        margin-bottom: 20px;
                        font-family: 'Orbitron', sans-serif;
                    }
                    
                    .work-items {
                        display: flex;
                        flex-direction: column;
                        gap: 25px;
                    }
                    
                    .work-item {
                        background: rgba(13, 20, 33, 0.7);
                        border-left: 4px solid #5d9cec;
                        padding: 15px 20px;
                        border-radius: 0 8px 8px 0;
                        transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    
                    .work-item.active {
                        opacity: 1;
                        transform: translateY(0);
                    }
                    
                    .work-header {
                        display: flex;
                        flex-direction: column;
                        margin-bottom: 10px;
                    }
                    
                    .work-item h4 {
                        color: #ffffff;
                        margin: 0 0 5px;
                        font-family: 'Space Mono', monospace;
                        font-weight: bold;
                    }
                    
                    .work-date {
                        color: #5d9cec;
                        font-size: 0.9rem;
                        margin: 0;
                        font-style: italic;
                    }
                    
                    .work-details {
                        font-family: 'Space Mono', monospace;
                        font-size: 0.95rem;
                        line-height: 1.5;
                    }
                    
                    .work-bullets {
                        margin-top: 10px;
                        padding-left: 20px;
                    }
                    
                    .work-bullets li {
                        margin-bottom: 5px;
                        position: relative;
                    }
                    
                    .work-bullets li::before {
                        content: '•';
                        color: #5d9cec;
                        position: absolute;
                        left: 0;
                        top: 0;
                    }
                    
                    /* Interactive hover effect */
                    .work-item:hover {
                        background: rgba(20, 30, 48, 0.8);
                        box-shadow: 0 5px 15px rgba(93, 156, 236, 0.3);
                        transform: translateY(-3px);
                    }
                </style>
            `;
            
            // Set up a function to animate work items after the popup is shown
            setTimeout(() => {
                const workItems = document.querySelectorAll('.work-item');
                workItems.forEach((item, index) => {
                    setTimeout(() => {
                        item.classList.add('active');
                    }, 120 * index); // More subtle staggered timing
                });
            }, 200);
            break;
        case 'projects':
            popupContent = `
                <div class="popup-content">
                    <section class="projects" id="projects-ai" style="opacity: 1; transform: translateY(0);">
                      <h2 class="projects-title">AI & Research</h2>
                      <div class="projects-text-1" style="margin-bottom: 30px;">My work in AI, Machine Learning, and Research.</div>
                      <div class="projects-container">
                        <div class="project-container project-card">
                          <img
                            src="../img/llmresearchlogo.png"
                            alt="New AI Project"
                            loading="lazy"
                            class="project-pic"
                          />
                          <h3 class="project-title">Gemini-based LLM Earthquake Research</h3>
                          <p class="project-details">
                            [2025] Using Gemini to classify and predict earthquakes from seismic waveform data
                          </p>
                          <a href="#" class="project-link" data-project="llmearthquake">Check it Out</a>
                        </div>
                        
                        <div class="project-container project-card">
                          <img
                            src="../img/ampleharvest.jpg"
                            alt="AmpleHarvest Webscraper"
                            loading="lazy"
                            class="project-pic"
                          />
                          <h3 class="project-title">AmpleHarvest Webscraper</h3>
                          <p class="project-details">
                            [2024] LLM powered Webscraper for automating contact information verification
                          </p>
                          <a href="#" class="project-link" data-project="ampleharvest">Check it Out</a>
                        </div>
                        

                        
                        <div class="project-container project-card">
                          <img
                            src="../img/FaciesLogo.jpg"
                            alt="Geographic Facies Predictor"
                            loading="lazy"
                            class="project-pic"
                          />
                          <h3 class="project-title">Geographic Facies Predictor</h3>
                          <p class="project-details">
                            [2022-2023] Using machine learning and AI to map geographic layers in the ground [Research + Web Application]
                          </p>
                          <a href="#" class="project-link" data-project="facies">Check it Out</a>
                        </div>
                        
                        <div class="project-container project-card">
                          <img
                            src="../img/BoulderLights.png"
                            alt="Planetary Boulder Detection"
                            loading="lazy"
                            class="project-pic"
                          />
                          <h3 class="project-title">Planetary Boulder Detection</h3>
                          <p class="project-details">
                            [2023] Training a boulder detecting/outlining CNN model from high-res satellite images
                          </p>
                          <a href="#" class="project-link" data-project="boulder">Check it Out</a>
                        </div>
                      </div>
                    </section>
                    
                    <section class="projects" id="projects-general" style="opacity: 1; transform: translateY(0); margin-top: 40px;">
                      <h2 class="projects-title">General</h2>
                      <div class="projects-text-2" style="margin-bottom: 30px;">Other Interesting Projects</div>
                      <div class="projects-container" style="row-gap: 30px;">
                        <div class="project-container project-card">
                          <img
                            src="../img/hopeboundlogo.jpg"
                            alt="Project 3"
                            loading="lazy"
                            class="project-pic"
                          />
                          <h3 class="project-title">Hopebound data visualization webpage</h3>
                          <p class="project-details">
                            [2025] Building a fullstack data site for Hopebound, a mental health nonprofit
                          </p>
                          <a href="#" class="project-link" data-project="hopebound">Check it Out</a>
                        </div>
                        
                        <div class="project-container project-card">
                          <img
                            src="../img/newsailogo.png"
                            alt="NewsAI logo"
                            loading="lazy"
                            class="project-pic"
                          />
                          <h3 class="project-title">NewsAI</h3>
                          <p class="project-details">
                            [2025] An AI integrated News site -- Built for the Anthropic Hackathon
                          </p>
                          <a href="#" class="project-link" data-project="newsai">Check it Out</a>
                        </div>
                        
                        <div class="project-container project-card">
                          <div style="overflow: hidden;">
                            <img
                              src="../img/HPT.png"
                              alt="HPT"
                              loading="lazy"
                              class="project-pic"
                              style="transform: scale(1.4); transform-origin: center center;"
                            />
                          </div>
                          <h3 class="project-title">Harvard Purity Test</h3>
                          <p class="project-details">
                            [2025] Harvard's largest unaffiliated social site
                          </p>
                          <a href="#" class="project-link" data-project="hpt">Check it Out</a>
                        </div>
                        
                        <div class="project-container project-card">
                          <img
                            src="../img/QAOA.jpg"
                            alt="Quantum Optimization Algorithm"
                            loading="lazy"
                            class="project-pic"
                          />
                          <h3 class="project-title">Quantum Approximate Optimization Algorithm</h3>
                          <p class="project-details">
                            [2024] Implementing QAOA as part of Qbraid Quantum ML project
                          </p>
                          <a href="#" class="project-link" data-project="qaoa">Check it Out</a>
                        </div>
                      </div>
                    </section>
                    
                    <section class="projects" id="projects-games" style="opacity: 1; transform: translateY(0); margin-top: 40px;">
                      <h2 class="projects-title">Game Development</h2>
                      <div class="projects-text-2" style="margin-bottom: 30px;">Game Development</div>
                      <div class="projects-container" style="row-gap: 30px;">
                        <div class="project-container project-card">
                          <img
                            src="../img/MomentumLogo.jpg"
                            alt="Momentum"
                            loading="lazy"
                            class="project-pic"
                          />
                          <h3 class="project-title">Momentum</h3>
                          <p class="project-details">
                            [2020-2021] 2D Friction based platformer
                          </p>
                          <a href="#" class="project-link" data-project="momentum">Check it Out</a>
                        </div>
                        
                        <div class="project-container project-card">
                          <img
                            src="../img/BurgerBrawlLogo.jpg"
                            alt="Burger Brawl"
                            loading="lazy"
                            class="project-pic"
                          />
                          <h3 class="project-title">Burger Brawl</h3>
                          <p class="project-details">
                            [2022] 2D action/fighter made in 24 hours
                          </p>
                          <a href="#" class="project-link" data-project="burger">Check it Out</a>
                        </div>
                        
                        <div class="project-container project-card">
                          <img
                            src="../img/GalaxSeaLogo.jpg"
                            alt="Galaxsea"
                            loading="lazy"
                            class="project-pic"
                          />
                          <h3 class="project-title">Galaxsea</h3>
                          <p class="project-details">
                            [2023] A twist on the iconic arcade shooter Galaga
                          </p>
                          <a href="#" class="project-link" data-project="galaxsea">Check it Out</a>
                        </div>
                        
                        <div class="project-container project-card">
                          <img
                            src="../img/SkyfarerLogo.jpg"
                            alt="Skyfarer"
                            loading="lazy"
                            class="project-pic"
                          />
                          <h3 class="project-title">Skyfarer</h3>
                          <p class="project-details">
                            [2023] Dialogue based VR flying experience
                          </p>
                          <a href="#" class="project-link" data-project="skyfarer">Check it Out</a>
                        </div>
                      </div>
                    </section>
                </div>
            `;
            break;
        // For individual project planets, redirect to the projects hub
        case 'ampleharvest':
        case 'qaoa':
        case 'facies':
        case 'boulder':
        case 'momentum':
        case 'burger':
        case 'galaxsea':
        case 'skyfarer':
            // Redirect to projects hub
            navigateToPlanet('projects');
            return;
        default:
            popupContent = `<h1>${planetName.charAt(0).toUpperCase() + planetName.slice(1)}</h1>`;
    }
    
    // Add some CSS for the popup content to exactly match the original site
    popupContent += `
        <style>
            .popup-content {
                max-width: 1400px;
                margin: 0 auto;
                padding: 30px;
                width: 90%;
            }
            
            /* Lazy loading styles */
            .lazy-bg {
                background-color: #1e293b; /* Dark placeholder color */
                transition: background-image 0.3s ease-in;
            }
            
            .lazy-bg.loaded {
                background-color: transparent;
            }
            .popup-content h2 {
                color: #5d9cec;
                margin-bottom: 20px;
                font-size: 2rem;
                font-family: 'Orbitron', sans-serif;
                text-shadow: 0 0 10px rgba(93, 156, 236, 0.5);
            }
            .popup-content h3 {
                color: #ffffff;
                margin: 15px 0 10px;
                font-size: 1.3rem;
                font-family: 'Orbitron', sans-serif;
            }
            .popup-content p {
                margin-bottom: 15px;
                line-height: 1.6;
                font-family: 'Space Mono', monospace;
            }
            .popup-content ul {
                list-style-type: none;
                padding-left: 5px;
                margin-bottom: 20px;
            }
            .popup-content li {
                margin-bottom: 8px;
                position: relative;
                padding-left: 20px;
                font-family: 'Space Mono', monospace;
            }
            .popup-content li:before {
                content: '\u2022';
                color: #5d9cec;
                position: absolute;
                left: 0;
                top: 0;
            }
            .social-links {
                margin-top: 20px;
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
                width: 100%;
            }
            .social-links a {
                color: #e0e0ff;
                font-size: 1.5rem;
                margin-right: 15px;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: rgba(93, 156, 236, 0.1);
                border: 1px solid rgba(93, 156, 236, 0.3);
                text-decoration: none;
                position: relative;
            }
            
            .social-links a i {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
            }
            .social-links a:hover {
                color: #5d9cec;
                background: rgba(93, 156, 236, 0.2);
                transform: translateY(-3px);
                box-shadow: 0 5px 15px rgba(93, 156, 236, 0.3);
            }
            
            /* Timeline Styling */
            .timeline {
                position: relative;
                max-width: 100%;
                margin: 30px 0;
                padding-left: 30px;
            }
            
            .timeline:before {
                content: '';
                position: absolute;
                left: 10px;
                top: 0;
                bottom: 0;
                width: 2px;
                background: rgba(93, 156, 236, 0.5);
            }
            
            .timeline-item {
                position: relative;
                margin-bottom: 30px;
            }
            
            .timeline-dot {
                position: absolute;
                left: -30px;
                top: 5px;
                width: 16px;
                height: 16px;
                border-radius: 50%;
                background: #5d9cec;
                box-shadow: 0 0 10px rgba(93, 156, 236, 0.8);
                z-index: 1;
            }
            
            .timeline-date {
                font-family: 'Orbitron', sans-serif;
                font-weight: bold;
                color: #5d9cec;
                margin-bottom: 5px;
            }
            
            .timeline-content {
                background: rgba(0, 8, 20, 0.6);
                border-radius: 8px;
                padding: 15px;
                border-left: 3px solid #5d9cec;
                box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
            }
            
            .timeline-content h4 {
                margin-top: 0;
                color: #e0e0ff;
                font-family: 'Orbitron', sans-serif;
            }
            
            .timeline-content p {
                margin-bottom: 5px;
                font-family: 'Space Mono', monospace;
                font-size: 0.9rem;
            }
            
            .timeline-content p:last-child {
                margin-bottom: 0;
            }
            .projects {
                opacity: 0;
                transform: translateY(20px);
                transition: opacity 0.8s ease, transform 0.8s ease;
                margin-bottom: 40px;
            }
            .projects.active {
                opacity: 1;
                transform: translateY(0);
            }
            .projects-title {
                text-align: center;
                margin-bottom: 30px;
                color: #5d9cec;
                font-size: 2rem;
            }
            .projects-text-1, .projects-text-2 {
                text-align: center;
                font-size: 1.2rem;
                color: #aaa;
            }
            .projects-container {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr 1fr;
                gap: 20px;
                margin: 20px 0;
            }
            .project-container {
                background: rgba(0, 10, 30, 0.5);
                border-radius: 10px;
                padding: 15px;
                border: 1px solid rgba(93, 156, 236, 0.2);
                transition: all 0.3s ease;
                display: flex;
                flex-direction: column;
                align-items: center;
                text-align: center;
            }
            .project-container:hover {
                background: rgba(0, 10, 30, 0.7);
                transform: translateY(-10px);
                box-shadow: 0 10px 20px rgba(93, 156, 236, 0.3);
            }
            .project-pic {
                width: 100%;
                height: 140px;
                object-fit: cover;
                border-radius: 8px;
                margin-bottom: 10px;
                border: 1px solid rgba(93, 156, 236, 0.3);
            }
            .project-title {
                color: #ffffff;
                margin: 8px 0;
                font-size: 1.2rem;
                font-family: 'Orbitron', sans-serif;
            }
            .project-details {
                color: #aaa;
                font-size: 0.9rem;
                margin-bottom: 20px;
            }
            .project-link {
                display: inline-block;
                padding: 10px 20px;
                background: rgba(93, 156, 236, 0.2);
                color: #e0e0ff;
                text-decoration: none;
                border-radius: 30px;
                font-family: 'Orbitron', sans-serif;
                font-size: 0.9rem;
                transition: all 0.3s ease;
                border: 1px solid rgba(93, 156, 236, 0.4);
                margin-top: auto;
            }
            .project-link:hover {
                background: rgba(93, 156, 236, 0.4);
                transform: translateY(-3px);
                box-shadow: 0 5px 15px rgba(93, 156, 236, 0.4);
            }
            .skills-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 20px;
                margin: 20px 0;
            }
            .skill-category {
                background: rgba(0, 10, 30, 0.5);
                border-radius: 8px;
                padding: 15px;
                border: 1px solid rgba(93, 156, 236, 0.2);
            }
            .skill-category h3 {
                color: #5d9cec;
                margin-bottom: 10px;
                font-size: 1.1rem;
            }
            .skill-category h4 {
                color: #e0e0ff;
                margin: 10px 0 5px;
                font-size: 0.95rem;
                opacity: 0.9;
            }
            .skill-category ul {
                list-style-type: none;
                padding-left: 10px;
            }
            .skill-category li {
                margin-bottom: 5px;
                position: relative;
                padding-left: 15px;
            }
            .skill-category li:before {
                content: '•';
                color: #5d9cec;
                position: absolute;
                left: 0;
            }
            .contact-links {
                display: flex;
                flex-direction: column;
                gap: 15px;
                margin-top: 20px;
            }
            .contact-link {
                display: flex;
                align-items: center;
                color: #e0e0ff;
                text-decoration: none;
                padding: 10px 15px;
                background: rgba(93, 156, 236, 0.1);
                border-radius: 8px;
                transition: all 0.3s ease;
                border: 1px solid rgba(93, 156, 236, 0.3);
            }
            .contact-link i {
                margin-right: 10px;
                font-size: 1.2rem;
            }
            .contact-link:hover {
                background: rgba(93, 156, 236, 0.2);
                transform: translateX(5px);
                box-shadow: 0 0 15px rgba(93, 156, 236, 0.3);
            }
            @media (max-width: 1200px) {
                .projects-container {
                    grid-template-columns: 1fr 1fr;
                }
            }
            @media (max-width: 768px) {
                .projects-container,
                .project-grid,
                .skills-grid {
                    grid-template-columns: 1fr;
                }
            }
        </style>
    `;
    
    // popupContent variable has been built by 'skills', 'archive', 'default' cases and includes common styles.

    planetInfoPopup.style.display = 'block'; // Ensure popup container is visible

    const nonAsyncNonHomeCases = ['about', 'contact', 'projects', 'skills', 'work', 'default']; // Cases that build popupContent string
    // Note: Add any other planet names here that use the popupContent variable directly

    if (nonAsyncNonHomeCases.includes(planetName)) {
        // For these cases, popupContent holds their complete HTML (content + common styles)
        planetInfoPopup.innerHTML = popupContent; 
        
        setTimeout(() => {
            planetInfoPopup.style.opacity = '1';
            planetInfoPopup.style.transform = 'translateY(0)';
            commonFinalSetupLogic(planetName); // Call common setup for event listeners etc.
        }, 50);
    }
    // For 'home' and markdown cases ('about', 'contact', 'projects'), 
    // their respective blocks already handle:
    // 1. Setting planetInfoPopup.innerHTML

    }

async function showProjectDetails(projectName) {
    let projectSpecificHtml = '';
    // Construct the path to the project's HTML file
    const filePath = `/templates/project-details/${projectName}.html`;

    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            let displayName = projectName.charAt(0).toUpperCase() + projectName.slice(1);
            if (projectName === 'qaoa') displayName = 'Quantum Approximate Optimization Algorithm';
            else if (projectName === 'facies') displayName = 'Geographic Facies Predictor';
            throw new Error(`Content not found for ${displayName} (Error ${response.status})`);
        }
        projectSpecificHtml = await response.text();
    } catch (error) {
        console.error(`Error fetching project details for "${projectName}" from ${filePath}:`, error);
        let displayName = projectName.charAt(0).toUpperCase() + projectName.slice(1);
        if (projectName === 'qaoa') displayName = 'Quantum Approximate Optimization Algorithm';
        else if (projectName === 'facies') displayName = 'Geographic Facies Predictor';
        projectSpecificHtml = `<h2>${displayName}</h2>
                               <p>Sorry, the details for this project could not be loaded at this time.</p>
                               <p><small>${error.message}</small></p>`;
    }

    // Construct the full detailsContent with the common wrapper and styles
    let detailsContent = `
        <div class="project-details-popup">
            ${projectSpecificHtml}
        </div>
        <style>
            .project-details-popup {
                padding: 20px;
            }
            .project-details-popup h2 {
                margin-bottom: 20px;
                text-align: center;
            }
            .project-details-popup p {
                margin-bottom: 15px;
                line-height: 1.6;
            }
            .project-details-popup ul {
                margin-bottom: 20px;
                padding-left: 20px;
            }
            .project-details-popup li {
                margin-bottom: 8px;
            }
            .image-container {
                display: flex;
                gap: 10px;
                justify-content: center;
                align-items: center;
                margin: 20px 0;
                flex-wrap: wrap;
            }
            .project-pic {
                max-width: 100%;
                height: auto;
                border-radius: 8px;
                border: 1px solid rgba(93, 156, 236, 0.3);
            }
            .detail-pic {
                max-width: 100%;
                height: auto;
                border-radius: 8px;
                border: 1px solid rgba(93, 156, 236, 0.3);
            }
            .image-note {
                text-align: center;
                font-style: italic;
                color: rgba(224, 224, 255, 0.7);
                margin-top: 10px;
            }
            .back-button {
                display: inline-block;
                padding: 10px 20px;
                background: rgba(93, 156, 236, 0.2);
                color: #e0e0ff;
                text-decoration: none;
                border-radius: 30px;
                font-family: 'Orbitron', sans-serif;
                font-size: 0.9rem;
                transition: all 0.3s ease;
                border: 1px solid rgba(93, 156, 236, 0.4);
                margin-top: 20px;
                cursor: pointer;
            }
            .back-button:hover {
                background: rgba(93, 156, 236, 0.4);
                transform: translateY(-3px);
                box-shadow: 0 5px 15px rgba(93, 156, 236, 0.4);
            }
            /* Responsive adjustments for images within project details */
            @media (max-width: 768px) {
                .project-details-popup .image-container img,
                .project-details-popup > div > img.project-pic { 
                    max-width: 90vw; 
                }
            }
        </style>
        <div style="text-align: left; padding-left: 20px; padding-bottom: 10px; margin-top: 20px;">
            <button class="back-button" id="back-to-projects">Back to Projects</button>
        </div>
    `;
    
    // Save current popup content to restore later (used by 'Back to Projects' if not calling showPlanetInfoPopup)
    // const originalContent = planetInfoPopup.innerHTML; // Not strictly needed if Back button calls showPlanetInfoPopup
    
    // Fade out current content if any (though showPlanetInfoPopup handles its own fade out/in)
    planetInfoPopup.style.opacity = '0';
    
    // Replace content after fade out
    setTimeout(() => {
        planetInfoPopup.innerHTML = detailsContent;
        
        // Add event listener to back button
        document.getElementById('back-to-projects').addEventListener('click', () => {
            // Fade out project details
            planetInfoPopup.style.opacity = '0';
            
            // Restore projects overview by calling showPlanetInfoPopup
            setTimeout(() => {
                showPlanetInfoPopup('projects'); 
            }, 300); // Wait for fade out before showing new content
        });
        
        // Fade in project details
        setTimeout(() => {
            planetInfoPopup.style.opacity = '1';
        }, 50); // Short delay for content to be set before fade-in
    }, 300); // Wait for initial fade-out of previous popup content
}

/**
 * Exits the current planet view and returns to space navigation
 */
function exitPlanetView() {
    if (isNavigating) return;
    
    isNavigating = true;
    inPlanetView = false;
    
    // Clean up any typing animation timers
    clearTypingAnimations();
    
    // Animate the popup out
    planetInfoPopup.style.opacity = '0';
    planetInfoPopup.style.transform = 'translateY(20px)';
    
    // Hide exit button
    exitButton.style.display = 'none';
    
    // Wait for animation to complete before hiding popup
    setTimeout(() => {
        planetInfoPopup.style.display = 'none';
        
        // Show UI elements again
        const uiContainer = document.querySelector('.ui-container');
        if (uiContainer) {
            uiContainer.style.opacity = '1';
            uiContainer.style.pointerEvents = 'auto';
        }
    }, 500);
    
    // Calculate camera position based on spaceship orientation
    const cameraOffset = new THREE.Vector3(0, 5, 15);
    cameraOffset.applyQuaternion(spaceship.quaternion);
    const targetPosition = new THREE.Vector3().copy(spaceship.position).add(cameraOffset);
    
    // Set controls target to spaceship immediately to prevent view jumping
    controls.target.copy(spaceship.position);
    
    // Animate camera movement
    gsap.to(camera.position, {
        x: targetPosition.x,
        y: targetPosition.y,
        z: targetPosition.z,
        duration: 1.5,
        ease: 'power2.inOut',
        onUpdate: () => {
            // Keep controls target on spaceship during animation
            controls.target.copy(spaceship.position);
        },
        onComplete: () => {
            isNavigating = false;
        }
    });
    
}

/**
 * Navigates to a specific planet
 * @param {string} planetName - Name of the planet to navigate to
 */
window.navigateToPlanet = function(planetName) {
    if (isNavigating || !planets[planetName]) return;
    
    isNavigating = true;
    currentPlanet = planetName;
    inPlanetView = true; // Set planet view mode
    
    // Update active navigation item in the header
    if (typeof window.updateNavActive === 'function') {
        window.updateNavActive(planetName);
    }
    
    // Reset all controls to prevent movement during planet view
    shipControls.up = false;
    shipControls.down = false;
    shipControls.left = false;
    shipControls.right = false;
    shipControls.thrust = false;
    
    // Update UI
    document.querySelectorAll('.planet-selector li').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`.planet-selector li[data-planet="${planetName}"]`).classList.add('active');
    
    // Show the info panel with the appropriate content
    const infoPanel = document.querySelector('.info-panel');
    if (infoPanel) {
        // First hide all panels
        document.querySelectorAll('.panel-content').forEach(panel => {
            panel.classList.remove('active');
        });
        
        // Then show the appropriate panel based on the planet
        const panelToShow = document.querySelector(`.${planetName}-panel`);
        if (panelToShow) {
            panelToShow.classList.add('active');
        }
        
        // Make the info panel visible
        infoPanel.classList.add('visible');
        
        // If it's the home planet, make the panel take up the full page
        if (planetName === 'home') {
            infoPanel.style.position = 'fixed';
            infoPanel.style.top = '0';
            infoPanel.style.left = '0';
            infoPanel.style.width = '100%';
            infoPanel.style.height = '100vh';
            infoPanel.style.maxWidth = '100%';
            infoPanel.style.margin = '0';
            infoPanel.style.padding = '0';
            infoPanel.style.borderRadius = '0';
            infoPanel.style.display = 'flex';
            infoPanel.style.justifyContent = 'center';
            infoPanel.style.alignItems = 'center';
            infoPanel.style.zIndex = '1000';
            infoPanel.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
            
            // Use the global reset function if available, otherwise try to call initTypingAnimation directly
            if (typeof window.resetAndStartTypingAnimation === 'function') {
                setTimeout(window.resetAndStartTypingAnimation, 500);
            } else if (typeof initTypingAnimation === 'function') {
                setTimeout(initTypingAnimation, 500);
            }
        } else {
            // For other planets, reset to default styling
            infoPanel.style.position = 'relative';
            infoPanel.style.width = '';
            infoPanel.style.height = '';
            infoPanel.style.maxWidth = '800px';
            infoPanel.style.margin = '';
            infoPanel.style.padding = '40px';
            infoPanel.style.borderRadius = '15px';
            infoPanel.style.display = 'block';
            infoPanel.style.backgroundColor = 'rgba(0, 10, 30, 0.8)';
        }
    }
    
    // Hide UI elements when in planet view
    const uiContainer = document.querySelector('.ui-container');
    if (uiContainer) {
        uiContainer.style.opacity = '0';
        uiContainer.style.pointerEvents = 'none';
    }
    
    const planet = planets[planetName];
    
    // Get current spaceship direction
    const shipDirection = new THREE.Vector3(0, 0, -1).applyQuaternion(spaceship.quaternion).normalize();
    
    // Calculate vector from spaceship to planet
    const toPlanet = new THREE.Vector3().subVectors(planet.position, spaceship.position).normalize();
    
    // Calculate dot product to see if ship is already facing the planet
    const dotProduct = shipDirection.dot(toPlanet);
    
    // Keep the spaceship where it is
    const spaceshipTargetPosition = new THREE.Vector3().copy(spaceship.position);
    
    // Make spaceship look directly at the planet
    const lookAt = new THREE.Vector3().copy(planet.position);
    
    // Create a quaternion for the target rotation
    const targetQuaternion = new THREE.Quaternion();
    const upVector = new THREE.Vector3(0, 1, 0);
    const matrix = new THREE.Matrix4().lookAt(spaceship.position, lookAt, upVector);
    targetQuaternion.setFromRotationMatrix(matrix);
    
    // Animate spaceship rotation to face the planet
    gsap.to(spaceship.quaternion, {
        x: targetQuaternion.x,
        y: targetQuaternion.y,
        z: targetQuaternion.z,
        w: targetQuaternion.w,
        duration: 1,
        ease: 'power2.inOut'
    });
    
    // Calculate the ideal camera position - in front of the spaceship facing the planet
    const targetPosition = new THREE.Vector3();
    
    // If we're already close to the planet, position camera between ship and planet
    if (spaceship.position.distanceTo(planet.position) < 20 * 2) {
        // Position camera closer to the planet for a better view
        const closerDistance = planet.geometry.parameters.radius * 2 + 5; // Much closer to the planet
        targetPosition.copy(planet.position)
            .sub(spaceship.position)
            .normalize()
            .multiplyScalar(closerDistance)
            .add(planet.position);
    } else {
        // Position camera at closer viewing distance from planet
        const closerDistance = planet.geometry.parameters.radius * 2 + 5; // Much closer to the planet
        targetPosition.copy(planet.position)
            .sub(spaceship.position)
            .normalize()
            .multiplyScalar(closerDistance)
            .add(planet.position);
    }
    
    // Set controls.target to planet position immediately to prevent view jumping
    controls.target.copy(planet.position);
    
    // Animate camera movement
    gsap.to(camera.position, {
        x: targetPosition.x,
        y: targetPosition.y,
        z: targetPosition.z,
        duration: 2,
        ease: 'power2.inOut',
        onUpdate: () => {
            // Keep controls target on planet during animation
            controls.target.copy(planet.position);
        },
        onComplete: () => {
            isNavigating = false;
            
            // Show exit button when navigation is complete
            exitButton.style.display = 'block';
            
            // Create a planet info popup
            showPlanetInfoPopup(planetName);
        }
    });
    
    // Hide visit popup during navigation
    hideVisitPopup();
}

// Ship controls state
const shipControls = {
    left: false,
    right: false,
    thrust: false,
    isAtBoundary: false,
    controlsDisabled: false,
    currentThrustLevel: 0, // Current acceleration level (0 to 1)
    targetThrustLevel: 0,   // Target acceleration level (0 or 1)
    accelerationRate: 0.03, // Rate of acceleration for thrust
    decelerationRate: 0.1,  // Rate of deceleration for thrust (faster than acceleration)
    // Turn control states
    currentTargetYawRate: 0, // Target turning speed
    currentYawRate: 0,       // Current interpolated turning speed
    turnAccelerationRate: 0.05, // How quickly turn builds up
    turnDecelerationRate: 0.08  // How quickly turn eases off
};

// Event Listeners
window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // Update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Update composer
    if (composer) {
        composer.setSize(sizes.width, sizes.height);
        composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }
});

// Planet selection
document.querySelectorAll('.planet-selector li').forEach(item => {
    item.addEventListener('click', () => {
        const planetName = item.getAttribute('data-planet');
        // Only navigate to the planet, the showPlanetInfoPopup will be called from within navigateToPlanet
        navigateToPlanet(planetName);
    });
});

// Archive planet navigation removed

// Add keyboard controls
document.addEventListener('keydown', (event) => {
    // If controls are disabled during boundary transition, only allow Q key
    if (spaceship.userData.controlsDisabled && event.code !== 'KeyQ') {
        return;
    }

    switch(event.code) {
        case 'ArrowUp':
        case 'KeyW':
            shipControls.up = true;
            break;
        case 'ArrowDown':
        case 'KeyS':
            shipControls.down = true;
            break;
        case 'ArrowLeft':
        case 'KeyA':
            shipControls.left = true;
            break;
        case 'ArrowRight':
        case 'KeyD':
            shipControls.right = true;
            break;
        case 'Space':
            // Space is for thrust
            shipControls.thrust = true;
            shipControls.targetThrustLevel = 1.0; // Set target to full thrust
            break;
        case 'ShiftLeft':
        case 'ShiftRight':
            // Shift is for visiting nearby planets
            if (nearbyPlanet && !isNavigating && !inPlanetView) {
                navigateToPlanet(nearbyPlanet);
            }
            break;
        case 'KeyQ':
            // Q key to restart flying after boundary transition
            if (spaceship.userData.isAtBoundary) {
                restartFlying();
            }
            break;
        case '1':
            navigateToPlanet('home');
            break;
        case '2':
            navigateToPlanet('projects');
            break;
        case '3':
            navigateToPlanet('skills');
            break;
        case '4':
            navigateToPlanet('about');
            break;
        case '5':
            navigateToPlanet('contact');
            break;
        case 'Escape':
            // ESC key to exit planet view for any planet
            if (inPlanetView && !isNavigating) {
                exitPlanetView();
            }
            break;
    }
});

window.addEventListener('keyup', (event) => {
    switch(event.code) {
        case 'ArrowUp':
        case 'KeyW':
            shipControls.up = false;
            break;
        case 'ArrowDown':
        case 'KeyS':
            shipControls.down = false;
            break;
        case 'ArrowLeft':
        case 'KeyA':
            shipControls.left = false;
            break;
        case 'ArrowRight':
        case 'KeyD':
            shipControls.right = false;
            break;
        case 'Space':
            shipControls.thrust = false;
            shipControls.targetThrustLevel = 0.0; // Set target to no thrust
            break;
    }
});

// Function to restart flying after hitting boundary
function restartFlying() {
    // Hide restart message
    const restartMessage = document.getElementById('restart-message');
    if (restartMessage) {
        restartMessage.classList.remove('visible');
    }
    
    // Reset boundary flags
    spaceship.userData.isAtBoundary = false;
    spaceship.userData.boundaryTransition = null;
    spaceship.userData.orbitingMode = false;
    spaceship.userData.controlsDisabled = false;
    
    // Make ship visible again
    spaceship.visible = true;
    
    // Reset ship opacity
    spaceship.traverse(child => {
        if (child.isMesh || child.isPoints) {
            if (child.material && child.userData.originalOpacity !== undefined) {
                child.material.opacity = child.userData.originalOpacity;
            }
        }
    });
    
    // Position ship at a safe distance from center, facing AWAY from center
    const safeDistance = 100; // Inside boundary but away from center
    const randomAngle = Math.random() * Math.PI * 2;
    
    // Position on a random point on the circle
    spaceship.position.x = Math.cos(randomAngle) * safeDistance;
    spaceship.position.y = 0; // Keep on horizontal plane
    spaceship.position.z = Math.sin(randomAngle) * safeDistance;
    
    // Make ship face AWAY from center (outward)
    const fromCenter = new THREE.Vector3(spaceship.position.x, 0, spaceship.position.z).normalize();
    const lookAwayFromCenter = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 0, 1), // Forward vector
        fromCenter // Direction away from center
    );
    spaceship.quaternion.copy(lookAwayFromCenter);
    
    // Position camera behind ship
    const cameraOffset = new THREE.Vector3(0, 5, 15);
    cameraOffset.applyQuaternion(lookAwayFromCenter);
    camera.position.copy(spaceship.position).add(cameraOffset);
    
    // Make camera look at spaceship
    controls.target.copy(spaceship.position);
}

// Animation
const clock = new THREE.Clock();
let previousTime = 0;

/**
 * Shows the visit popup when near a planet
 * @param {string} planetName - Name of the planet to show visit popup for
 */
function showVisitPopup(planetName) {
    // Don't show popup if already in planet view
    if (inPlanetView) return;
    
    // If we're near a project planet, redirect to projects hub
    if (projectPlanets[planetName]) {
        // Don't show visit popup for project planets
        visitPopupVisible = false;
        visitPopup.style.display = 'none';
        return;
    }
    
    visitPopup.style.display = 'block';
    visitPopup.innerHTML = `Press SHIFT to visit ${planetName.charAt(0).toUpperCase() + planetName.slice(1)}`;
    visitPopupVisible = true;
}

/**
 * Hides the visit popup
 */
function hideVisitPopup() {
    visitPopup.style.display = 'none';
    visitPopupVisible = false;
}

/**
 * Checks if the spaceship is close to any planets and shows appropriate UI
 */
function checkPlanetProximity() {
    // Don't check proximity if we're already in planet view or navigating
    if (inPlanetView || isNavigating) {
        if (visitPopupVisible) {
            visitPopupVisible = false;
            visitPopup.style.opacity = '0';
            setTimeout(() => {
                visitPopup.style.display = 'none';
            }, 300);
        }
        return;
    }
    
    let closestPlanet = null;
    let closestDistance = Infinity;
    const proximityThreshold = 20; // Distance to trigger highlight
    
    // Only reset planets that aren't already highlighted
    // This ensures the highlight persists as long as we're in range
    for (const planetName in planets) {
        const planet = planets[planetName];
        if (!planet.userData.isHighlighted) {
            planet.material.emissive.set(0x000000);
            planet.material.emissiveIntensity = 0;
        }
    }
    
    // Check distance to each planet
    for (const planetName in planets) {
        // Skip individual project planets - only consider main planets
        if (projectPlanets[planetName]) continue;
        
        const planet = planets[planetName];
        const distance = spaceship.position.distanceTo(planet.position);
        
        if (distance < closestDistance) {
            closestDistance = distance;
            closestPlanet = planetName;
        }
    }
    
    // Check if close enough to a planet to highlight it and show popup
    if (closestDistance < proximityThreshold && !isNavigating) {
        const planet = planets[closestPlanet];
        
        // Create a subtle glow effect instead of changing material properties
        if (!planet.userData.isHighlighted) {
            // Store original emissive values
            planet.userData.originalEmissive = planet.material.emissive.clone();
            planet.userData.originalEmissiveIntensity = planet.material.emissiveIntensity;
            
            // Apply subtle glow
            const baseColor = planet.material.color.clone();
            planet.material.emissive.set(baseColor);
            planet.material.emissiveIntensity = 0.2; // Subtle glow
            
            // Mark as highlighted
            planet.userData.isHighlighted = true;
        }
        
        // Show visit popup if not already visible for this planet
        if (nearbyPlanet !== closestPlanet || !visitPopupVisible) {
            showVisitPopup(closestPlanet);
        }
        
        nearbyPlanet = closestPlanet;
    } else {
        // Hide popup if not near any planet
        if (visitPopupVisible) {
            hideVisitPopup();
        }
        
        // Remove highlight from all planets
        Object.values(planets).forEach(planet => {
            if (planet.userData.isHighlighted) {
                // Restore original emissive values
                if (planet.userData.originalEmissive) {
                    planet.material.emissive.copy(planet.userData.originalEmissive);
                    planet.material.emissiveIntensity = planet.userData.originalEmissiveIntensity;
                }
                planet.userData.isHighlighted = false;
            }
        });
        
        nearbyPlanet = null;
    }
}

/**
 * Main animation loop that runs every frame
 */
const tick = () => {
    // Calculate delta time for frame-rate independent movement
    const elapsedTime = clock.getElapsedTime();
    const deltaTime = elapsedTime - previousTime;
    previousTime = elapsedTime;
    
    // Update status panel values if they exist
    const coordinatesElement = document.querySelector('.coordinates-value');
    const velocityElement = document.querySelector('.velocity-value');
    
    if (coordinatesElement && spaceship) {
        // Format coordinates to 1 decimal place
        const xPos = spaceship.position.x.toFixed(1);
        const zPos = spaceship.position.z.toFixed(1);
        coordinatesElement.textContent = `X: ${xPos} Z: ${zPos}`;
    }
    
    if (velocityElement && spaceship) {
        // Calculate velocity based on current movement speed
        let currentSpeed = 0;
        if (!spaceship.userData.controlsDisabled) {
            // Use the current thrust level for smooth acceleration
            currentSpeed = 0.5 + (shipControls.currentThrustLevel * 1.0); // Base speed + acceleration
        }
        velocityElement.textContent = `${currentSpeed.toFixed(1)} km/s`;
    }
    
    // Update planet orbits
    updateOrbits(planets, deltaTime, camera);
    
    // Update minimap
    updateMinimap(planets, spaceship);

    // Rotate planets and animate particles
    Object.values(planets).forEach(planet => {
        planet.rotation.y += 0.005;
        
        // Animate planet particles if they exist
        planet.children.forEach(child => {
            if (child instanceof THREE.Points) {
                // Update particle positions
                const positions = child.geometry.attributes.position.array;
                const originalPositions = child.userData.originalPositions;
                child.userData.time += deltaTime * child.userData.speed;
                
                for (let i = 0; i < positions.length; i += 3) {
                    // Create a wave-like motion for particles
                    const x = originalPositions[i];
                    const y = originalPositions[i + 1];
                    const z = originalPositions[i + 2];
                    
                    positions[i] = x + Math.sin(child.userData.time + i * 0.1) * 0.1;
                    positions[i + 1] = y + Math.cos(child.userData.time + i * 0.05) * 0.1;
                    positions[i + 2] = z + Math.sin(child.userData.time + i * 0.07) * 0.1;
                }
                
                child.geometry.attributes.position.needsUpdate = true;
            }
        });
    });
    
    // Rotate and orbit project planets
    // Get all project planet keys to ensure consistent ordering
    const projectPlanetKeys = Object.keys(projectPlanets);
    const totalPlanets = projectPlanetKeys.length;
    const halfCount = Math.ceil(totalPlanets / 2);
    
    // Shared orbit properties
    const orbitCenter = projectsPlanet.position.clone();
    const innerOrbitRadius = 13;
    const outerOrbitRadius = 20;
    const innerOrbitSpeed = 2.0; // Dramatically increased inner orbit speed
    const outerOrbitSpeed = 0.6; // Significantly increased outer orbit speed
    
    // Global orbit angles that increase over time (separate for inner and outer orbits)
    if (!window.innerOrbitAngle) window.innerOrbitAngle = 0;
    if (!window.outerOrbitAngle) window.outerOrbitAngle = 0;
    window.innerOrbitAngle += innerOrbitSpeed * deltaTime;
    window.outerOrbitAngle += outerOrbitSpeed * deltaTime;
    
    // Position each planet evenly around the circle
    projectPlanetKeys.forEach((planetName, index) => {
        const planet = projectPlanets[planetName];
        
        // Determine if this planet is in the inner or outer orbit
        const isInnerOrbit = index < halfCount;
        const orbitRadius = isInnerOrbit ? innerOrbitRadius : outerOrbitRadius;
        
        // Calculate how many planets are in this orbit
        const orbitPlanetCount = isInnerOrbit ? halfCount : (totalPlanets - halfCount);
        
        // Calculate the position within this orbit (0 to orbitPlanetCount-1)
        const orbitIndex = isInnerOrbit ? index : (index - halfCount);
        
        // Rotate the planet on its axis
        planet.rotation.y += 0.007 * deltaTime;
        
        // Calculate the angle for this planet (evenly spaced + global rotation)
        const angleOffset = (orbitIndex / orbitPlanetCount) * Math.PI * 2;
        const globalAngle = isInnerOrbit ? window.innerOrbitAngle : window.outerOrbitAngle;
        const currentAngle = globalAngle + angleOffset;
        
        // Calculate new position
        const newPosition = calculateOrbitalPosition(
            orbitCenter,
            orbitRadius,
            currentAngle
        );
        
        // Update planet position
        planet.position.copy(newPosition);
        
        // Update label position if it exists
        const labelName = planetName + 'Label';
        if (window[labelName]) {
            window[labelName].position.copy(newPosition).add(new THREE.Vector3(0, 4, 0));
        }
    });
    // Removed redundant planet rotations as they're now handled in the forEach loop above

    // Rotate labels to always face camera
    if (homeLabel) homeLabel.position.copy(homePlanet.position).add(new THREE.Vector3(0, 8, 0));
    if (projectsLabel) projectsLabel.position.copy(projectsPlanet.position).add(new THREE.Vector3(0, 10, 0));
    if (skillsLabel) skillsLabel.position.copy(skillsPlanet.position).add(new THREE.Vector3(0, 7, 0));
    if (aboutLabel) aboutLabel.position.copy(aboutPlanet.position).add(new THREE.Vector3(0, 9, 0));
    if (contactLabel) contactLabel.position.copy(contactPlanet.position).add(new THREE.Vector3(0, 6, 0));

    // Update project planet labels
    if (ampleHarvestLabel) ampleHarvestLabel.position.copy(ampleHarvestPlanet.position).add(new THREE.Vector3(0, 4, 0));
    if (qaoaLabel) qaoaLabel.position.copy(qaoaPlanet.position).add(new THREE.Vector3(0, 4, 0));
    if (faciesLabel) faciesLabel.position.copy(faciesPlanet.position).add(new THREE.Vector3(0, 4, 0));
    if (boulderLabel) boulderLabel.position.copy(boulderPlanet.position).add(new THREE.Vector3(0, 4, 0));
    if (momentumLabel) momentumLabel.position.copy(momentumPlanet.position).add(new THREE.Vector3(0, 4, 0));
    if (burgerLabel) burgerLabel.position.copy(burgerPlanet.position).add(new THREE.Vector3(0, 4, 0));
    if (galaxseaLabel) galaxseaLabel.position.copy(galaxseaPlanet.position).add(new THREE.Vector3(0, 4, 0));
    if (skyfarerLabel) skyfarerLabel.position.copy(skyfarerPlanet.position).add(new THREE.Vector3(0, 4, 0));
    
    // Check if near a planet (only in travel mode)
    if (!inPlanetView) {
        checkPlanetProximity();
    }
        
    // Update spaceship light position to follow camera
    spaceshipLight.position.copy(camera.position);
    
    // Simple ship controls
    if (!isNavigating && spaceship) {
        // Update thrust acceleration/deceleration
        if (shipControls.currentThrustLevel !== shipControls.targetThrustLevel) {
            // Acceleration rate (adjust these values to control how quickly speed changes)
            const accelerationRate = 0.03; // How quickly it speeds up
            const decelerationRate = 0.1; // How quickly it slows down
            
            // Determine which rate to use
            const rate = shipControls.targetThrustLevel > shipControls.currentThrustLevel ? 
                         accelerationRate : decelerationRate;
            
            // Smoothly interpolate current thrust towards target thrust
            shipControls.currentThrustLevel += (shipControls.targetThrustLevel - shipControls.currentThrustLevel) * rate;
            
            // Clamp values to prevent tiny floating point values
            if (Math.abs(shipControls.currentThrustLevel - shipControls.targetThrustLevel) < 0.01) {
                shipControls.currentThrustLevel = shipControls.targetThrustLevel;
            }
        }
        
        const baseMoveSpeed = 18.0; // Units per second (higher value for consistent feel)
        const baseRotateSpeed = 3.0; // Radians per second
            
        // Always move the ship forward, but at different speeds based on thrust
        // Only if not in planet view
        if (!inPlanetView) {
            // Force the ship to stay in the horizontal plane at all times
            spaceship.position.y = 0;
            
            // Calculate direction based on spaceship's orientation
            // Negative Z is forward for the ship
            const direction = new THREE.Vector3(0, 0, -1);
            direction.applyQuaternion(spaceship.quaternion);
            
            // Force the direction to be horizontal (no vertical movement)
            direction.y = 0;
            direction.normalize();
            
            // Use the current thrust level for smooth acceleration
            const baseMultiplier = 0.6;
            const thrustMultiplier = 1.8;
            const currentMoveSpeed = baseMoveSpeed * deltaTime * (baseMultiplier + (shipControls.currentThrustLevel * (thrustMultiplier - baseMultiplier)));
            
            // Calculate the potential new position (ensuring it stays in the horizontal plane)
            const potentialPosition = spaceship.position.clone().add(direction.clone().multiplyScalar(currentMoveSpeed));
            potentialPosition.y = 0; // Force horizontal movement
            
            // Check for collisions with planets
            let collision = false;
            const shipCollisionRadius = spaceship.userData.collisionRadius || 3;
            
            for (const planetName in planets) {
                const planet = planets[planetName];
                const planetRadius = planet.geometry.parameters.radius;
                const safeDistance = planetRadius + shipCollisionRadius;
                
                // Calculate distance between potential position and planet
                const distance = potentialPosition.distanceTo(planet.position);
                
                if (distance < safeDistance) {
                    collision = true;
                    break;
                }
            }
            
            // Define the boundary radius (the circular area where the ship can fly)
            const boundaryRadius = 195; // Increased by 30% from 150
            const distanceFromCenter = potentialPosition.length();
            const isBeyondBoundary = distanceFromCenter > boundaryRadius;
            
            // Check for collision with the sun
            const sunCollision = sun && sun.userData.collisionRadius ? 
                potentialPosition.distanceTo(sun.position) < sun.userData.collisionRadius : false;
            
            // Handle movement based on collisions and boundary
            if (!collision && !isBeyondBoundary && !sunCollision) {
                // Normal movement within bounds and no sun collision
                if (welcomePopupShown) {
                    spaceship.position.copy(potentialPosition);
                }
            } else if (sunCollision) {
                // Handle sun collision - bounce away from the sun
                const awayFromSun = spaceship.position.clone().sub(sun.position).normalize();
                if (welcomePopupShown) {
                    spaceship.position.add(awayFromSun.multiplyScalar(0.5)); // Push away from sun
                }
                
                // Add a visual effect for sun collision
                const flash = new THREE.PointLight(0xffcc33, 5, 20);
                flash.position.copy(spaceship.position);
                scene.add(flash);
                
                // Add particle effect for sun collision
                createCollisionParticles(spaceship.position.clone(), 0xffcc33, 75, 1500);
                
                // Remove the flash after a short time
                setTimeout(() => {
                    scene.remove(flash);
                }, 300);
            } else if (isBeyondBoundary) {
                // Ship has reached the boundary - start the cinematic mode
                if (!spaceship.userData.boundaryTransition) {
                    // Initialize the boundary transition
                    spaceship.userData.boundaryTransition = {
                        active: true,
                        startTime: clock.getElapsedTime(),
                        initialPosition: spaceship.position.clone(),
                        initialCameraPosition: camera.position.clone(),
                        initialCameraTarget: controls.target.clone()
                    };
                    
                    // Disable controls during transition
                    spaceship.userData.controlsDisabled = true;
                    
                    // Show the restart message - delay it slightly to make it more noticeable
                    setTimeout(() => {
                        const restartMessage = document.getElementById('restart-message');
                        if (restartMessage) {
                            restartMessage.classList.add('visible');
                        }
                    }, 2000); // Show after 2 seconds when camera has moved
                }
                
                // Handle the transition animation
                const transition = spaceship.userData.boundaryTransition;
                const transitionTime = clock.getElapsedTime() - transition.startTime;
                const transitionDuration = 3.0; // seconds
                
                if (transitionTime <= transitionDuration) {
                    // Calculate transition progress (0 to 1)
                    const progress = Math.min(transitionTime / transitionDuration, 1.0);
                    
                    // Fade out the ship
                    spaceship.traverse(child => {
                        if (child.isMesh || child.isPoints) {
                            if (child.material) {
                                if (child.material.transparent) {
                                    // Store original opacity if not already stored
                                    if (child.userData.originalOpacity === undefined) {
                                        child.userData.originalOpacity = child.material.opacity;
                                    }
                                    // Fade out
                                    child.material.opacity = child.userData.originalOpacity * (1 - progress);
                                } else {
                                    // Make material transparent to enable fading
                                    child.material.transparent = true;
                                    child.userData.originalOpacity = 1.0;
                                    child.material.opacity = 1.0 - progress;
                                }
                            }
                        }
                    });
                    
                    // Pan camera to center
                    const targetCameraPosition = new THREE.Vector3(0, 50, 0); // High above center
                    camera.position.lerpVectors(transition.initialCameraPosition, targetCameraPosition, progress);
                    
                    // Look at center
                    controls.target.set(0, 0, 0);
                } else {
                    // Transition complete - enter orbiting mode
                    if (!spaceship.userData.orbitingMode) {
                        spaceship.userData.orbitingMode = true;
                        
                        // Hide the ship completely
                        spaceship.visible = false;
                        
                        // Position camera for orbiting view
                        camera.position.set(0, 50, 0);
                    }
                    
                    // Slowly orbit around the center
                    const orbitSpeed = 0.05;
                    const orbitRadius = 50;
                    const orbitAngle = clock.getElapsedTime() * orbitSpeed;
                    
                    camera.position.x = Math.sin(orbitAngle) * orbitRadius;
                    camera.position.z = Math.cos(orbitAngle) * orbitRadius;
                    camera.position.y = 50 + Math.sin(orbitAngle * 0.5) * 10; // Slight up/down movement
                    
                    // Always look at center
                    controls.target.set(0, 0, 0);
                }
                
                // Flag that we're at the boundary
                spaceship.userData.isAtBoundary = true;
            } else {
                // Handle planet collisions
                const bounceDirection = new THREE.Vector3();
                for (const planetName in planets) {
                    const planet = planets[planetName];
                    // Calculate direction from ship to planet, but only in the XZ plane
                    const toPlanet = new THREE.Vector3(
                        planet.position.x - spaceship.position.x,
                        0, // Force y component to 0 for horizontal movement
                        planet.position.z - spaceship.position.z
                    ).normalize();
                    bounceDirection.sub(toPlanet.multiplyScalar(0.1));
                }
                
                // Ensure bounce direction is horizontal
                bounceDirection.y = 0;
                
                // Apply the bounce
                spaceship.position.add(bounceDirection);
                
                // Add particle effect for planet collision
                // Use a blue-white color for the collision particles
                createCollisionParticles(spaceship.position.clone(), 0x7aadff, 50, 1000);
                
                // Force the ship to stay in the horizontal plane
                spaceship.position.y = 0;
            }
            
            // Thruster effect - only show when thrust is actually applied
            if (thruster) {
                // Use the current thrust level for smooth visual transitions
                if (shipControls.currentThrustLevel > 0.05) { // Only show effects if there's some thrust
                    thruster.visible = false; // Keep the thruster invisible
                    thrusterLight.intensity = 6 * shipControls.currentThrustLevel; // Scale light intensity with thrust
                    thrusterParticles.visible = true;
                    
                    // Animate particles
                    const positions = thrusterParticles.geometry.attributes.position.array;
                    for (let i = 0; i < particleCount; i++) {
                        const i3 = i * 3;
                        
                        // Move particles outward from the visual back
                        positions[i3 + 2] += 0.15 * Math.random();
                        
                        // Reset particles that go too far
                        if (positions[i3 + 2] > 5) {
                            positions[i3] = (Math.random() - 0.5) * 0.5;
                            positions[i3 + 1] = (Math.random() - 0.5) * 0.5;
                            positions[i3 + 2] = 2;
                        }
                    }
                    thrusterParticles.geometry.attributes.position.needsUpdate = true;
                } else {
                    // No thrust applied, hide thruster effects
                    thruster.visible = false;
                    thrusterLight.intensity = 0;
                    thrusterParticles.visible = false;
                }
            }
        }
        
        // Handle camera movement with thrust - only if not in planet view
        if (shipControls.currentThrustLevel > 0.1 && !inPlanetView) {
            // Calculate direction based on spaceship's orientation
            // Negative Z is forward for the ship (original behavior)
            const direction = new THREE.Vector3(0, 0, -1);
            direction.applyQuaternion(spaceship.quaternion);
            
            // Move camera in that direction
            camera.position.add(direction.multiplyScalar(baseMoveSpeed * deltaTime));
        }

        // Handle rotation with mixed global/local axes - only if not in planet view
        if (!inPlanetView) {
            // Determine target yaw rate based on controls
            if (welcomePopupShown) {
                if (shipControls.left) {
                    shipControls.currentTargetYawRate = baseRotateSpeed * deltaTime; // Frame-rate independent rotation
                } else if (shipControls.right) {
                    shipControls.currentTargetYawRate = -baseRotateSpeed * deltaTime;
                } else {
                    shipControls.currentTargetYawRate = 0;
                }
            } else {
                shipControls.currentTargetYawRate = 0; // No turning if welcome popup not yet closed
                shipControls.currentYawRate = 0;     // Also immediately stop any existing interpolated yaw rate
            }

            // Interpolate currentYawRate towards targetYawRate
            const turnRateApply = shipControls.currentTargetYawRate !== 0 ? shipControls.turnAccelerationRate : shipControls.turnDecelerationRate;
            shipControls.currentYawRate += (shipControls.currentTargetYawRate - shipControls.currentYawRate) * turnRateApply;
            // Snap if very close to target or zero to prevent tiny oscillations
            if (Math.abs(shipControls.currentYawRate - shipControls.currentTargetYawRate) < 0.0001) {
                shipControls.currentYawRate = shipControls.currentTargetYawRate;
            }
            if (Math.abs(shipControls.currentYawRate) < 0.0001 && shipControls.currentTargetYawRate === 0) {
                shipControls.currentYawRate = 0;
            }

            const yawAmount = shipControls.currentYawRate; // Use the interpolated yaw rate
            
            if (yawAmount !== 0) {
                // Create a quaternion for the incremental yaw rotation around the world Y-axis
                const deltaYawQuaternion = new THREE.Quaternion();
                deltaYawQuaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), yawAmount);

                // Apply the incremental rotation to the spaceship's current quaternion
                spaceship.quaternion.premultiply(deltaYawQuaternion);
                spaceship.quaternion.normalize(); // Normalize after multiplication

                // Add roll effect (tilt) when turning
                const maxTiltAngle = 0.3; // Original max tilt value
                // Make targetTilt proportional to the current actual yaw rate
                const tiltDirection = Math.sign(shipControls.currentYawRate);
                // Normalize currentYawRate against baseRotateSpeed to get a factor from 0 to 1
                const normalizedYawMagnitude = baseRotateSpeed !== 0 ? Math.abs(shipControls.currentYawRate) / (baseRotateSpeed * deltaTime) : 0;
                const targetTilt = tiltDirection * normalizedYawMagnitude * maxTiltAngle;
                spaceship.userData.targetTilt = targetTilt;
            }
            
            // Apply smooth tilting effect or return to neutral position
            if (!spaceship.userData.currentTilt) spaceship.userData.currentTilt = 0;
            
            // If no turn controls are active, gradually return to neutral position
            if (!shipControls.left && !shipControls.right) {
                spaceship.userData.targetTilt = 0;
            }
            
            // Smoothly interpolate current tilt towards target tilt
            // Use different speeds for tilting and returning to neutral
            let tiltSpeed;
            if (Math.abs(spaceship.userData.targetTilt) > Math.abs(spaceship.userData.currentTilt)) {
                // When increasing tilt (turning)
                tiltSpeed = 0.7; // Fast tilting when turning
            } else {
                // When decreasing tilt (returning to neutral)
                tiltSpeed = 0.15; // Slower, more gradual return to neutral
            }
            spaceship.userData.currentTilt += (spaceship.userData.targetTilt - spaceship.userData.currentTilt) * tiltSpeed;
            
            // Apply the roll rotation
            // Ensure rotation order is YXZ for predictable Euler angle application.
            // This should ideally be set once when the spaceship model is initialized (see MEMORY[5d3b3b51-38ed-42b5-aeed-bf074bb08217]).
            spaceship.rotation.order = 'YXZ'; 

            // spaceship.quaternion already contains the latest YAW (and was normalized after yaw application).
            // Now, incorporate the ROLL (currentTilt) and ensure PITCH is zero.
            const euler = new THREE.Euler().setFromQuaternion(spaceship.quaternion, spaceship.rotation.order);
            euler.x = 0; // No pitch
            euler.z = spaceship.userData.currentTilt; // Apply roll based on interpolated currentTilt
            
            // Update the master quaternion from these combined Euler angles.
            // This results in a normalized quaternion.
            spaceship.quaternion.setFromEuler(euler);
            
            // Update wing trails
            if (spaceship.userData.leftWingTrail && spaceship.userData.rightWingTrail) {
                // Calculate trail intensity based on movement and turning
                const isMoving = shipControls.currentThrustLevel > 0.1;
                const isTurning = Math.abs(spaceship.userData.currentTilt) > 0.05;
                
                // Get trail attributes
                const leftTrailPositions = spaceship.userData.leftWingTrail.geometry.attributes.position.array;
                const leftTrailOpacities = spaceship.userData.leftWingTrail.geometry.attributes.opacity.array;
                const rightTrailPositions = spaceship.userData.rightWingTrail.geometry.attributes.position.array;
                const rightTrailOpacities = spaceship.userData.rightWingTrail.geometry.attributes.opacity.array;
                
                // Update trail particles
                for (let i = 0; i < leftTrailPositions.length / 3; i++) {
                    const i3 = i * 3;
                    
                    // Move particles back (create trail effect)
                    leftTrailPositions[i3 + 2] += 0.1;
                    rightTrailPositions[i3 + 2] += 0.1;
                    
                    // Reset particles that have moved too far back
                    if (leftTrailPositions[i3 + 2] > 5) {
                        leftTrailPositions[i3] = -2.5 + (Math.random() * 0.2 - 0.1);
                        leftTrailPositions[i3 + 1] = 0.1 + (Math.random() * 0.2 - 0.1);
                        leftTrailPositions[i3 + 2] = -0.5 + (Math.random() * 0.2);
                    }
                    
                    if (rightTrailPositions[i3 + 2] > 5) {
                        rightTrailPositions[i3] = 2.5 + (Math.random() * 0.2 - 0.1);
                        rightTrailPositions[i3 + 1] = 0.1 + (Math.random() * 0.2 - 0.1);
                        rightTrailPositions[i3 + 2] = -0.5 + (Math.random() * 0.2);
                    }
                    
                    // Adjust opacity based on movement, turning, and distance
                    const distanceFactor = 1 - Math.min(1, leftTrailPositions[i3 + 2] / 5);
                    
                    // Left trail is more visible during right turns (and vice versa)
                    const leftTurnFactor = Math.max(0, -spaceship.userData.currentTilt * 2); // More visible in right turns
                    const rightTurnFactor = Math.max(0, spaceship.userData.currentTilt * 2); // More visible in left turns
                    
                    // Calculate final opacity
                    const baseOpacity = isMoving ? 0.2 : 0;
                    const leftOpacity = baseOpacity + (isTurning ? leftTurnFactor * 0.8 : 0);
                    const rightOpacity = baseOpacity + (isTurning ? rightTurnFactor * 0.8 : 0);
                    
                    // Apply opacity with distance falloff
                    leftTrailOpacities[i] = leftOpacity * distanceFactor;
                    rightTrailOpacities[i] = rightOpacity * distanceFactor;
                }
                
                // Update the geometry attributes
                spaceship.userData.leftWingTrail.geometry.attributes.position.needsUpdate = true;
                spaceship.userData.leftWingTrail.geometry.attributes.opacity.needsUpdate = true;
                spaceship.userData.rightWingTrail.geometry.attributes.position.needsUpdate = true;
                spaceship.userData.rightWingTrail.geometry.attributes.opacity.needsUpdate = true;
            }
        }
        
        // Up/down movement disabled - ship stays on the same plane
        
        // Update camera to follow spaceship
        if (!isNavigating && !inPlanetView) {
            // Check if the ship is at the boundary
            if (spaceship.userData.isAtBoundary) {
                // Special camera behavior when at the boundary - look inward toward the center
                
                // Calculate a position slightly behind and above the ship
                const cameraOffset = new THREE.Vector3(0, 5, 10); // Higher and closer to ship
                
                // Get the normalized vector from ship to center
                const toCenter = new THREE.Vector3(-spaceship.position.x, 0, -spaceship.position.z).normalize();
                
                // Create a rotation that points toward the center
                const lookInwardQuaternion = new THREE.Quaternion().setFromUnitVectors(
                    new THREE.Vector3(0, 0, 1),
                    toCenter
                );
                
                // Apply the rotation to the camera offset
                cameraOffset.applyQuaternion(lookInwardQuaternion);
                
                // Set camera position
                camera.position.copy(spaceship.position).add(cameraOffset);
                
                // Make camera look at the center of the scene, not at the ship
                controls.target.set(0, 0, 0);
                
                // If user applies thrust, they're regaining control
                if (shipControls.currentThrustLevel > 0.1 || shipControls.left || shipControls.right) {
                    spaceship.userData.isAtBoundary = false;
                }
            } else {
                // Normal camera behavior - follow the ship
                // Extract just the Y-axis rotation (yaw) from the spaceship's quaternion
                const euler = new THREE.Euler().setFromQuaternion(spaceship.quaternion, 'YXZ');
                
                // Create a new quaternion that only includes rotation around the Y axis
                const yawOnlyQuaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, euler.y, 0));
                
                // Apply this yaw-only quaternion to the camera offset
                const cameraOffset = new THREE.Vector3(0, 5, 15);
                cameraOffset.applyQuaternion(yawOnlyQuaternion);
                
                // Set camera position
                camera.position.copy(spaceship.position).add(cameraOffset);
                
                // Make camera look at spaceship
                controls.target.copy(spaceship.position);
            }
            
            // Always keep camera's up vector pointing up
            camera.up.set(0, 1, 0);
        }
    }
    
    // Update controls
    controls.update();

    // Render
    // Use post-processing composer instead of direct rendering
    if (composer) {
        composer.render(); // New rendering call with post-processing
    }

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
};

// Welcome popup functionality
const welcomePopup = document.getElementById('welcome-popup');
const enterSiteButton = document.getElementById('enter-site');
const siteToggle = document.getElementById('site-toggle');
const spaceOption = document.getElementById('space-option');
const simpleOption = document.getElementById('simple-option');
const spaceControls = document.getElementById('space-controls');

// We'll initialize the animation loop only after the welcome popup is closed
let animationLoopStarted = false;
let selectedSite = 'space'; // Default to space site

// Function to show welcome popup
/**
 * Shows the welcome popup with an entrance animation
 */
function showWelcomePopup() {
    welcomePopup.style.display = 'flex';
    
    // Set initial active state for space option
    spaceOption.classList.add('active');
    simpleOption.classList.remove('active');
    spaceControls.style.display = 'block';
    
    // Animate in
    setTimeout(() => {
        welcomePopup.style.opacity = '1';
        welcomePopup.querySelector('.welcome-content').style.transform = 'translateY(0)';
    }, 50);
}

/**
 * Handles the site toggle change
 */
function handleSiteToggle() {
    const welcomeContent = document.querySelector('.welcome-content');
    
    if (siteToggle.checked) {
        // Simple site selected
        selectedSite = 'simple';
        simpleOption.classList.add('active');
        spaceOption.classList.remove('active');
        spaceControls.style.display = 'none';
        
        // Apply simple site styles to all elements
        welcomeContent.classList.add('simple-mode');
        
        // Change all headings to Times New Roman
        const headings = welcomeContent.querySelectorAll('h1, h2, h3');
        headings.forEach(heading => {
            heading.style.fontFamily = '"Times New Roman", serif';
            heading.style.fontWeight = 'normal';
        });
        
        // Change all paragraphs to Times New Roman
        const paragraphs = welcomeContent.querySelectorAll('p');
        paragraphs.forEach(p => {
            p.style.fontFamily = '"Times New Roman", serif';
            p.style.fontStyle = 'italic';
        });
        
        // Change button style to simple site style
        enterSiteButton.style.background = 'rgba(255, 255, 255, 0.1)';
        enterSiteButton.style.border = '1px solid rgba(255, 255, 255, 0.3)';
        enterSiteButton.style.fontFamily = '"Times New Roman", serif';
        enterSiteButton.style.fontWeight = 'normal';
        
        // Change welcome content background to be more subdued
        welcomeContent.style.backgroundColor = 'rgba(30, 30, 40, 0.85)';
        welcomeContent.style.boxShadow = '0 0 20px rgba(200, 200, 220, 0.3)';
        welcomeContent.style.border = '1px solid rgba(200, 200, 220, 0.4)';
    } else {
        // Space site selected
        selectedSite = 'space';
        spaceOption.classList.add('active');
        simpleOption.classList.remove('active');
        spaceControls.style.display = 'block';
        
        // Remove simple site styles
        welcomeContent.classList.remove('simple-mode');
        
        // Restore space site fonts for headings
        const headings = welcomeContent.querySelectorAll('h1, h2, h3');
        headings.forEach(heading => {
            heading.style.fontFamily = '"Orbitron", sans-serif';
            heading.style.fontWeight = 'bold';
        });
        
        // Restore space site fonts for paragraphs
        const paragraphs = welcomeContent.querySelectorAll('p');
        paragraphs.forEach(p => {
            p.style.fontFamily = '"Space Mono", monospace';
            p.style.fontStyle = 'normal';
        });
        
        // Change button style back to space site style
        enterSiteButton.style.background = 'rgba(93, 156, 236, 0.2)';
        enterSiteButton.style.border = '1px solid rgba(93, 156, 236, 0.4)';
        enterSiteButton.style.fontFamily = '"Orbitron", sans-serif';
        enterSiteButton.style.fontWeight = 'bold';
        
        // Restore welcome content background
        welcomeContent.style.backgroundColor = 'rgba(10, 20, 40, 0.8)';
        welcomeContent.style.boxShadow = '0 0 30px rgba(93, 156, 236, 0.4)';
        welcomeContent.style.border = '2px solid rgba(93, 156, 236, 0.6)';
    }
}

/**
 * Closes the welcome popup and navigates to the selected site
 */
function enterSelectedSite() {
    // Animate out
    welcomePopup.style.opacity = '0';
    welcomePopup.querySelector('.welcome-content').style.transform = 'translateY(20px)';
    
    // Hide after animation completes
    setTimeout(() => {
        welcomePopup.style.display = 'none';
        welcomePopupShown = true;
        
        if (selectedSite === 'simple') {
            // Navigate to simplified site
            window.location.href = './simplified/index.html';
        } else {
            // Start the space experience
            if (!animationLoopStarted) {
                animationLoopStarted = true;
                // Reset spaceship position and state before starting
                spaceship.userData.isAtBoundary = false;
                // Initialize the main animation loop
                tick();
            }
            
            // Navigate to home planet
            navigateToPlanet('home');
            
            // Make sure the ship controls are visible
            const shipControls = document.querySelector('.ship-controls');
            if (shipControls) {
                shipControls.style.display = 'flex';
                shipControls.style.opacity = '1';
                shipControls.style.zIndex = '50';
            }
            
            // Initialize typing animation
            if (typeof window.resetAndStartTypingAnimation === 'function') {
                setTimeout(window.resetAndStartTypingAnimation, 500);
            }
        }
    }, 500);
}

// Add event listeners
siteToggle.addEventListener('change', handleSiteToggle);
enterSiteButton.addEventListener('click', enterSelectedSite);

// Add click event listeners to the site options
spaceOption.addEventListener('click', () => {
    siteToggle.checked = false;
    handleSiteToggle();
});

simpleOption.addEventListener('click', () => {
    siteToggle.checked = true;
    handleSiteToggle();
});

// Add keyboard event listener for Enter key
document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && welcomePopup.style.display !== 'none') {
        enterSelectedSite();
    }
});

// Show welcome popup after loading screen disappears
setTimeout(() => {
    showWelcomePopup();
}, 1500);

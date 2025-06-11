// Orbit System - Adds sun, orbit lines, and orbital movement to planets
import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';

// Create the sun at the center of the scene
export function createSun(scene) {
    // Create the sun geometry and material
    const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({
        color: 0xffff99,
        transparent: true,
        opacity: 0.9
    });
    
    // Create the sun mesh
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.position.set(0, 0, 0);
    scene.add(sun);
    
    // Add a point light at the sun's position
    const sunLight = new THREE.PointLight(0xffff99, 1, 300); // Reverted intensity to 1
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);
    
    // Create a glow effect using a shader material
    const glowGeometry = new THREE.SphereGeometry(6, 32, 32);
    const glowMaterial = new THREE.ShaderMaterial({
        uniforms: {
            c: { type: 'f', value: 0.65 }, // Was 0.5, makes glow more expansive
            p: { type: 'f', value: 1.8 }, // Was 3.0, makes falloff softer
            glowColor: { type: 'c', value: new THREE.Color(0xffff99) },
        },
        vertexShader: `
            varying vec3 vNormal;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform vec3 glowColor;
            uniform float c;
            uniform float p;
            varying vec3 vNormal;
            void main() {
                float intensity = pow(c - dot(vNormal, vec3(0.0, 0.0, 1.0)), p);
                gl_FragColor = vec4(glowColor, intensity * 1.5); // Adjusted glow intensity multiplier
            }
        `,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true
    });
    
    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    scene.add(glowMesh);
    
    // Store the collision radius in userData for collision detection
    sun.userData.collisionRadius = 8;
    
    return sun;
}

// Create orbit lines for planets
export function createOrbitLine(radius, scene, color = 0x5d9cec, segments = 128) {
    const orbitGeometry = new THREE.BufferGeometry();
    const orbitMaterial = new THREE.LineBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending
    });
    
    // Create a circle of points
    const points = [];
    for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        points.push(new THREE.Vector3(x, 0, z));
    }
    
    // Set the points to the geometry
    orbitGeometry.setFromPoints(points);
    
    // Create the line
    const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
    scene.add(orbitLine);
    
    return orbitLine;
}

// Setup orbital movement for a planet
export function setupOrbitalMovement(planet, orbitRadius, orbitSpeed, centerObject = null) {
    // Store original position for reference
    const originalPosition = planet.position.clone();
    
    // Calculate initial angle based on current position
    const initialAngle = Math.atan2(originalPosition.z, originalPosition.x);
    
    // Store orbit parameters on the planet object
    planet.userData.orbit = {
        radius: orbitRadius,
        speed: orbitSpeed,
        angle: initialAngle,
        center: centerObject ? centerObject.position : new THREE.Vector3(0, 0, 0),
        originalY: originalPosition.y // Keep the original Y position
    };
    
    return planet;
}

// Update planet positions in their orbits
export function updateOrbits(planets, deltaTime, camera) {
    Object.values(planets).forEach(planet => {
        if (planet.userData.orbit) {
            // Update the orbit angle
            planet.userData.orbit.angle += planet.userData.orbit.speed * deltaTime;
            
            // Calculate new position
            const newX = Math.cos(planet.userData.orbit.angle) * planet.userData.orbit.radius;
            const newZ = Math.sin(planet.userData.orbit.angle) * planet.userData.orbit.radius;
            
            // Update planet position, keeping original Y
            planet.position.x = newX + planet.userData.orbit.center.x;
            planet.position.z = newZ + planet.userData.orbit.center.z;
            
            // Update any children (like labels) to follow the planet
            planet.children.forEach(child => {
                if (child.userData.isLabel) {
                    child.lookAt(camera.position);
                }
            });
        }
    });
}

// Update minimap with planet and ship positions
export function updateMinimap(planets, spaceship) {
    const minimapShip = document.querySelector('.minimap-ship');
    
    if (!minimapShip) return;
    
    // Clear existing planet dots
    const existingDots = document.querySelectorAll('.minimap-planet');
    existingDots.forEach(dot => dot.remove());
    
    // Add planet dots
    const minimap = document.querySelector('.minimap');
    const minimapRadius = minimap.offsetWidth / 2;
    const scaleFactor = minimapRadius / 150; // Scale factor based on space size
    
    Object.entries(planets).forEach(([name, planet]) => {
        // Skip project planets as they'll be handled separately
        if (name.includes('Project') || name === 'ampleHarvest' || name === 'qaoa' || 
            name === 'facies' || name === 'boulder' || name === 'momentum' || 
            name === 'burger' || name === 'galaxsea' || name === 'skyfarer') {
            return;
        }
        
        const planetDot = document.createElement('div');
        planetDot.className = `minimap-planet ${name}`;
        
        // Calculate position on minimap
        const x = (planet.position.x * scaleFactor) + minimapRadius;
        const y = (planet.position.z * scaleFactor) + minimapRadius;
        
        planetDot.style.left = `${x}px`;
        planetDot.style.top = `${y}px`;
        
        minimap.appendChild(planetDot);
    });
    
    // Update ship position on minimap
    if (spaceship) {
        const x = (spaceship.position.x * scaleFactor) + minimapRadius;
        const y = (spaceship.position.z * scaleFactor) + minimapRadius;
        
        minimapShip.style.left = `${x}px`;
        minimapShip.style.top = `${y}px`;
    }
}

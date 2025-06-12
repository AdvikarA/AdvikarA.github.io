import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { gsap } from 'gsap';

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000814);

// Loading Manager
const loadingManager = new THREE.LoadingManager(
    // Loaded
    () => {
        gsap.to('.progress', { width: '100%', duration: 0.5, ease: 'power2.inOut' });
        
        // Close loading screen after a short delay
        setTimeout(() => {
            gsap.to('.loading-screen', { 
                opacity: 0, 
                duration: 0.5, 
                ease: 'power2.inOut',
                onComplete: () => {
                    document.querySelector('.loading-screen').style.display = 'none';
                    
                    // Make info panel visible and add close button
                    const infoPanel = document.querySelector('.info-panel');
                    infoPanel.classList.add('visible');
                    
                    // Add close button to info panel
                    const closeButton = document.createElement('button');
                    closeButton.textContent = '\u00d7';
                    closeButton.className = 'close-panel';
                    closeButton.style.position = 'absolute';
                    closeButton.style.top = '10px';
                    closeButton.style.right = '10px';
                    closeButton.style.background = 'rgba(93, 156, 236, 0.3)';
                    closeButton.style.color = '#ffffff';
                    closeButton.style.border = 'none';
                    closeButton.style.borderRadius = '50%';
                    closeButton.style.width = '30px';
                    closeButton.style.height = '30px';
                    closeButton.style.fontSize = '20px';
                    closeButton.style.cursor = 'pointer';
                    closeButton.style.display = 'flex';
                    closeButton.style.alignItems = 'center';
                    closeButton.style.justifyContent = 'center';
                    closeButton.style.lineHeight = '1';
                    
                    infoPanel.appendChild(closeButton);
                    
                    closeButton.addEventListener('click', () => {
                        infoPanel.classList.remove('visible');
                    });
                }
            });
        }, 2000);
    },
    // Progress
    (itemUrl, itemsLoaded, itemsTotal) => {
        const progressRatio = itemsLoaded / itemsTotal;
        document.querySelector('.progress').style.width = `${progressRatio * 100}%`;
        
        const loadingText = document.querySelector('.loading-text');
        if (progressRatio < 0.3) {
            loadingText.textContent = 'Initializing navigation systems...';
        } else if (progressRatio < 0.6) {
            loadingText.textContent = 'Calibrating space coordinates...';
        } else if (progressRatio < 0.9) {
            loadingText.textContent = 'Preparing spacecraft...';
        } else {
            loadingText.textContent = 'Ready for launch!';
        }
    }
);

// Simple texture loader
const textureLoader = new THREE.TextureLoader();

// Create a few simple planets
const planets = {};

// Home planet
const homePlanetGeometry = new THREE.SphereGeometry(5, 32, 32);
const homePlanetMaterial = new THREE.MeshStandardMaterial({
    color: 0x5d9cec,
    roughness: 0.7,
    metalness: 0.2
});
const homePlanet = new THREE.Mesh(homePlanetGeometry, homePlanetMaterial);
homePlanet.position.set(0, 0, 0);
scene.add(homePlanet);
planets['home'] = homePlanet;

// Projects planet
const projectsPlanetGeometry = new THREE.SphereGeometry(7, 32, 32);
const projectsPlanetMaterial = new THREE.MeshStandardMaterial({
    color: 0x8c7ae6,
    roughness: 0.7,
    metalness: 0.2
});
const projectsPlanet = new THREE.Mesh(projectsPlanetGeometry, projectsPlanetMaterial);
projectsPlanet.position.set(30, 5, -20);
scene.add(projectsPlanet);
planets['projects'] = projectsPlanet;

// Skills planet
const skillsPlanetGeometry = new THREE.SphereGeometry(4, 32, 32);
const skillsPlanetMaterial = new THREE.MeshStandardMaterial({
    color: 0x4cd137,
    roughness: 0.7,
    metalness: 0.2
});
const skillsPlanet = new THREE.Mesh(skillsPlanetGeometry, skillsPlanetMaterial);
skillsPlanet.position.set(-25, -8, -35);
scene.add(skillsPlanet);
planets['skills'] = skillsPlanet;

// Create a simple spaceship
let spaceship = new THREE.Group();

// Main body - use a simple cone for the ship
const bodyGeometry = new THREE.ConeGeometry(1, 4, 8);
const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0x5d9cec,
    metalness: 0.7,
    roughness: 0.3
});
const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
body.rotation.x = Math.PI / 2;
spaceship.add(body);

// Position the spaceship
spaceship.position.set(0, 0, 15);
spaceship.rotation.y = Math.PI;
scene.add(spaceship);

// Create simple stars
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
scene.add(stars);

// Lights - add more light to make sure everything is visible
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(50, 50, 50);
scene.add(directionalLight);

// Add point light at home planet
const homeLightColor = new THREE.Color(0x5d9cec);
const homePointLight = new THREE.PointLight(homeLightColor, 2, 50);
homePointLight.position.copy(homePlanet.position);
scene.add(homePointLight);

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

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputEncoding = THREE.sRGBEncoding;

// Simplified navigation
let currentPlanet = 'home';
let isNavigating = false;

function navigateToPlanet(planetName) {
    if (isNavigating || !planets[planetName]) return;
    
    isNavigating = true;
    currentPlanet = planetName;
    
    // Update UI
    document.querySelectorAll('.planet-selector li').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`.planet-selector li[data-planet="${planetName}"]`).classList.add('active');
    
    // Update info panel
    document.querySelectorAll('.panel-content').forEach(panel => {
        panel.classList.remove('active');
    });
    document.querySelector(`.${planetName}-panel`).classList.add('active');
    
    // Calculate target position
    const planet = planets[planetName];
    const targetPosition = new THREE.Vector3();
    targetPosition.copy(planet.position).add(new THREE.Vector3(0, 0, 15)); // Position camera 15 units away
    
    // Animate camera movement
    gsap.to(camera.position, {
        x: targetPosition.x,
        y: targetPosition.y,
        z: targetPosition.z,
        duration: 2,
        ease: 'power2.inOut',
        onComplete: () => {
            isNavigating = false;
            controls.target.copy(planet.position);
        }
    });
}

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
});

// Planet selection
document.querySelectorAll('.planet-selector li').forEach(item => {
    item.addEventListener('click', () => {
        const planetName = item.getAttribute('data-planet');
        navigateToPlanet(planetName);
    });
});

// Ship controls
const shipControls = {
    thrust: false,
    up: false,
    down: false,
    left: false,
    right: false
};

document.querySelector('.control-button.thrust').addEventListener('mousedown', () => {
    shipControls.thrust = true;
});
document.querySelector('.control-button.thrust').addEventListener('mouseup', () => {
    shipControls.thrust = false;
});
document.querySelector('.control-button.up').addEventListener('mousedown', () => {
    shipControls.up = true;
});
document.querySelector('.control-button.up').addEventListener('mouseup', () => {
    shipControls.up = false;
});
document.querySelector('.control-button.down').addEventListener('mousedown', () => {
    shipControls.down = true;
});
document.querySelector('.control-button.down').addEventListener('mouseup', () => {
    shipControls.down = false;
});
document.querySelector('.control-button.left').addEventListener('mousedown', () => {
    shipControls.left = true;
});
document.querySelector('.control-button.left').addEventListener('mouseup', () => {
    shipControls.left = false;
});
document.querySelector('.control-button.right').addEventListener('mousedown', () => {
    shipControls.right = true;
});
document.querySelector('.control-button.right').addEventListener('mouseup', () => {
    shipControls.right = false;
});

// Touch events for mobile
document.querySelector('.control-button.thrust').addEventListener('touchstart', (e) => {
    e.preventDefault();
    shipControls.thrust = true;
});
document.querySelector('.control-button.thrust').addEventListener('touchend', () => {
    shipControls.thrust = false;
});
document.querySelector('.control-button.up').addEventListener('touchstart', (e) => {
    e.preventDefault();
    shipControls.up = true;
});
document.querySelector('.control-button.up').addEventListener('touchend', () => {
    shipControls.up = false;
});
document.querySelector('.control-button.down').addEventListener('touchstart', (e) => {
    e.preventDefault();
    shipControls.down = true;
});
document.querySelector('.control-button.down').addEventListener('touchend', () => {
    shipControls.down = false;
});
document.querySelector('.control-button.left').addEventListener('touchstart', (e) => {
    e.preventDefault();
    shipControls.left = true;
});
document.querySelector('.control-button.left').addEventListener('touchend', () => {
    shipControls.left = false;
});
document.querySelector('.control-button.right').addEventListener('touchstart', (e) => {
    e.preventDefault();
    shipControls.right = true;
});
document.querySelector('.control-button.right').addEventListener('touchend', () => {
    shipControls.right = false;
});

// Animation
const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
    const elapsedTime = clock.getElapsedTime();
    const deltaTime = elapsedTime - previousTime;
    previousTime = elapsedTime;

    // Update planets rotation
    for (const planetName in planets) {
        const planet = planets[planetName];
        planet.rotation.y += planet.userData.rotationSpeed;
    }
    
        // Simple rotation animation for planets
    if (homePlanet) homePlanet.rotation.y += 0.005;
    if (projectsPlanet) projectsPlanet.rotation.y += 0.003;
    if (skillsPlanet) skillsPlanet.rotation.y += 0.007;
    
    // Simple ship controls
    if (spaceship && !isNavigating) {
        const moveSpeed = 0.3;
        const rotateSpeed = 0.04;
        
        if (shipControls.thrust) {
            const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(spaceship.quaternion);
            spaceship.position.add(direction.multiplyScalar(moveSpeed));
            camera.position.add(direction.multiplyScalar(moveSpeed));
        }
        
        if (shipControls.up) {
            spaceship.rotateX(-rotateSpeed);
        }
        
        if (shipControls.down) {
            spaceship.rotateX(rotateSpeed);
        }
        
        if (shipControls.left) {
            spaceship.rotateY(rotateSpeed);
        }
        
        if (shipControls.right) {
            spaceship.rotateY(-rotateSpeed);
        }
        
        // Update camera to follow spaceship
        const cameraOffset = new THREE.Vector3(0, 2, 10);
        cameraOffset.applyQuaternion(spaceship.quaternion);
        camera.position.copy(spaceship.position).add(cameraOffset);
        
        camera.lookAt(spaceship.position);
    }
    
    // Update controls
    controls.update();

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
};

tick();

// Add keyboard controls for better usability
window.addEventListener('keydown', (event) => {
    switch(event.key) {
        case 'w':
        case 'ArrowUp':
            shipControls.up = true;
            break;
        case 's':
        case 'ArrowDown':
            shipControls.down = true;
            break;
        case 'a':
        case 'ArrowLeft':
            shipControls.left = true;
            break;
        case 'd':
        case 'ArrowRight':
            shipControls.right = true;
            break;
        case ' ':
            shipControls.thrust = true;
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
    }
});

window.addEventListener('keyup', (event) => {
    switch(event.key) {
        case 'w':
        case 'ArrowUp':
            shipControls.up = false;
            break;
        case 's':
        case 'ArrowDown':
            shipControls.down = false;
            break;
        case 'a':
        case 'ArrowLeft':
            shipControls.left = false;
            break;
        case 'd':
        case 'ArrowRight':
            shipControls.right = false;
            break;
        case ' ':
            shipControls.thrust = false;
            break;
    }
});

// Add instructions to the UI
const instructionsDiv = document.createElement('div');
instructionsDiv.className = 'instructions';
instructionsDiv.innerHTML = `
    <h3>Keyboard Controls</h3>
    <p>WASD or Arrow Keys: Rotate ship</p>
    <p>Spacebar: Thrust</p>
    <p>1-5: Quick navigation to planets</p>
    <button class="close-instructions">Close</button>
`;
instructionsDiv.style.position = 'absolute';
instructionsDiv.style.top = '20px';
instructionsDiv.style.right = '20px';
instructionsDiv.style.background = 'rgba(0, 10, 30, 0.7)';
instructionsDiv.style.color = '#e0e0ff';
instructionsDiv.style.padding = '20px';
instructionsDiv.style.borderRadius = '10px';
instructionsDiv.style.zIndex = '100';
instructionsDiv.style.maxWidth = '300px';
instructionsDiv.style.display = 'none';

document.body.appendChild(instructionsDiv);

// Add help button
const helpButton = document.createElement('button');
helpButton.className = 'help-button';
helpButton.textContent = '?';
helpButton.style.position = 'absolute';
helpButton.style.top = '20px';
helpButton.style.right = '20px';
helpButton.style.width = '40px';
helpButton.style.height = '40px';
helpButton.style.borderRadius = '50%';
helpButton.style.background = 'rgba(93, 156, 236, 0.3)';
helpButton.style.color = '#e0e0ff';
helpButton.style.border = '1px solid rgba(93, 156, 236, 0.5)';
helpButton.style.fontSize = '20px';
helpButton.style.cursor = 'pointer';
helpButton.style.zIndex = '101';

document.body.appendChild(helpButton);

helpButton.addEventListener('click', () => {
    instructionsDiv.style.display = 'block';
});

document.querySelector('.close-instructions').addEventListener('click', () => {
    instructionsDiv.style.display = 'none';
});

// Initialize with home planet
setTimeout(() => {
    navigateToPlanet('home');
}, 2500);

// Add event listener for the simplified website button
const simplifiedButton = document.getElementById('simplified-website');
if (simplifiedButton) {
    simplifiedButton.addEventListener('click', () => {
        window.location.href = './simplified/index.html';
    });
}

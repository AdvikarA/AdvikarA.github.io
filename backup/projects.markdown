---
layout: page
title: Projects
permalink: /Projects/
weight: 2
---

<section class="projects" id="projects-ai">
  <h2 class="projects-title">Machine Learning/AI</h2>
  <div class="projects-text-1" style="margin-bottom: 10px;">Machine Learning </div>
  <div class="projects-container" style="row-gap: 30px;">
    <div class="project-container project-card">
      <img
        src="/img/ampleharvest.jpg"
        alt="AmpleHarvest Webscraper"
        loading="lazy"
        class="project-pic"
      />
      <h3 class="project-title">AmpleHarvest Webscraper</h3>
      <p class="project-details">
        [2024] LLM powered Webscraper for autonomating contact information verification
      </p>
      <a href="/pages/AmpleHarvest.html" target="_blank" class="project-link">Check it Out</a>
    </div>
    <div class="project-container project-card">
      <img
        src="/img/QAOA.jpg"
        alt="Quantum Optimization Algorithm"
        loading="lazy"
        class="project-pic"
      />
      <h3 class="project-title">Quantum Approximate Optimization Algorithm</h3>
      <p class="project-details">
        [2024] Implementing QAOA as part of Qbraid Quantum ML project 
      </p>
      <a href="/pages/Qbraid.html" target="_blank" class="project-link">Check it Out</a>
    </div>
    <div class="project-container project-card">
      <img
        src="/img/FaciesLogo.jpg"
        alt="kookw"
        loading="lazy"
        class="project-pic"
      />
      <h3 class="project-title">Geographic Facies Predictor</h3>
      <p class="project-details">
        [2022-2023] Using machine learning and AI to map geographic layers in the ground [Research + Web Application]
      </p>
      <a href="/pages/Lithofacies.html" target="_blank" class="project-link">Check it Out</a>
    </div>
    <div class="project-container project-card">
      <img
        src="/img/BoulderLights.png"
        alt="kookw"
        loading="lazy"
        class="project-pic"
      />
      <h3 class="project-title">Planetary Boulder Detection</h3>
      <p class="project-details">
        [2023] Training a boulder detecting/outlining CNN model from high-res satellite images  
      </p>
      <a href="https://github.com/astroNils/MLtools/tree/main" target="_blank" class="project-link">Check it Out</a>
    </div>
  </div>
</section>

<section class="projects" id="projects-ai">
  <h2 class="projects-title">Game Development</h2>   
  <div class="projects-text-2" style="margin-top: 50px; margin-bottom: 10px;">Game Development</div>
  <div class="projects-container" style="row-gap: 30px;">
    <div class="project-container project-card">
      <img
        src="/img/MomentumLogo.jpg"
        alt="kookw"
        loading="lazy"
        class="project-pic"
      />
      <h3 class="project-title">Momentum</h3>
      <p class="project-details">
        [2020-2021] 2D Friction based platformer
      </p>
      <a href="https://cyanair24.itch.io/momentum" target="_blank" class="project-link">Check it Out</a>
    </div>
    <div class="project-container project-card">
      <img
        src="/img/BurgerBrawlLogo.jpg"
        alt="kookw"
        loading="lazy"
        class="project-pic"
      />
      <h3 class="project-title">Burger Brawl</h3>
      <p class="project-details">
        [2022] 2D action/fighter made in 24 hours
      </p>
      <a href="https://dev-menon.itch.io/burger-brawl" target="_blank" class="project-link">Check it Out</a>
    </div>
    <div class="project-container project-card">
      <img
        src="/img/GalaxSeaLogo.jpg"
        alt="kookw"
        loading="lazy"            class="project-pic"
      />
      <h3 class="project-title">Galaxsea</h3>
      <p class="project-details">
        [2023] A twist on the iconic arcade shooter Galaga. 
      </p>
      <a href="https://cyanair24.itch.io/galaxsea" target="_blank" class="project-link">Check it Out</a>
    </div>
    <div class="project-container project-card">
      <img
        src="/img/SkyfarerLogo.jpg"
        alt="kookw"
        loading="lazy"
        class="project-pic"
      />
      <h3 class="project-title">Skyfarer</h3>
      <p class="project-details">
        [2023] Dialogue based VR flying experience 
      </p>
      <a href="https://cyanair24.itch.io/skyfarer" target="_blank" class="project-link">Check it Out</a>
    </div>
  </div>
</section>

<script>
  // Function to handle the scroll animation for projects
  function handleScrollAnimation(entries, observer) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      } else {
        entry.target.classList.remove('active');
      }
    });
  }
  // Create an Intersection Observer instance
  var observer = new IntersectionObserver(handleScrollAnimation, {
    root: null,
    threshold: 0.5, // Adjust this value to control the trigger point
  });
  // Select the projects containers
  var projectsContainers = document.querySelectorAll('.projects-container');

  // Observe each projects container
  projectsContainers.forEach(function (container) {
    observer.observe(container);
  });

  // Trigger the animation for the first row (AI/Machine Learning) on page load
  document.querySelector('#projects-ai').classList.add('active');
</script>

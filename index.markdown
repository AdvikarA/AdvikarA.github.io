---
layout: home
title: Home
weight: 1
---

<div class="parallax-container" onmousemove="parallax(event)">
    <div class="parallax-layer layer1">
      <img src="img/banner1.png" alt="Bottom Layer Image">
    </div>
    <div class="parallax-layer layer2">
      <img src="img/banner2.png" alt="Middle Layer Image">
    </div>
    <div class="parallax-layer layer3">
      <img src="img/banner3.jpg" alt="Top Layer Image">
    </div>
  </div>

<script>
  function parallax(event) {
    const container = document.querySelector('.parallax-container');
    const layer1 = container.querySelector('.layer1');
    const layer2 = container.querySelector('.layer2');
    const layer3 = container.querySelector('.layer3');
    const mouseX = event.clientX;
    const mouseY = event.clientY;
    const moveX1 = (mouseX - container.offsetWidth / 2) / 15;
    const moveY1 = (mouseY - container.offsetHeight / 2) / 10;
    const moveX2 = (mouseX - container.offsetWidth / 2) / 20;
    const moveY2 = (mouseY - container.offsetHeight / 2) / 17;
    const moveX3 = (mouseX - container.offsetWidth / 2) / 45;
    const moveY3 = (mouseY - container.offsetHeight / 2) / 40;
    layer1.style.transform = `translate(${moveX1}px, ${moveY1}px)`;
    layer2.style.transform = `translate(${moveX2}px, ${moveY2}px)`;
    layer3.style.transform = `translate(${moveX3}px, ${moveY3}px)`;
  }
</script>
<p class="hover-text">Hover over me</p>
<div class="main-content">
  <!-- Left Column - Who Section -->
  <div class="box left-column bio animate__animated animate__shakeX">
    <p class="bio-text">
      Hi, I’m <strong>Advikar</strong>, an undergraduate attending <strong>Harvard University</strong>. Currently, I'm interested in Software and AI/Machine Learning. I like pens, rocks, stars, and deer (among other things). I wanted to try making a personal website in order to learn HTML/CSS and to hold some info and projects I’ve accumulated over the past few years. A lot of the things I’m working on are mostly comp sci focused, but I’m involved in a ton of other random stuff. If you want to contact me, I got socials somewhere below. Updated 6/3/24
    </p>
    <p class="bio-text-small">This website is pretty raw and I'm not the best at HTML/CSS so bear with</p>

    <div class="social-icons">
      <a href="https://github.com/{{ site.github_username }}" title="GitHub"><i class="fa-brands fa-github"></i></a>
      <a href="https://open.spotify.com/user/{{ site.spotify_id }}" title="Spotify"><i class="fa-brands fa-spotify"></i></a>
      <a href="https://discord.com/users/{{ site.discord_id }}" title="Discord"><i class="fa-brands fa-discord"></i></a>
      <a href="https://www.linkedin.com/in/advikar-ananthkumar-79b568311/" title="Linkedin"><i class="fa-brands fa-linkedin"></i></a>
    </div>
  </div>

  <!-- Right Column - Stuff I'm working on and Stuff I'm trying to learn -->
  <div class="right-column">
    <!-- Top Section - Stuff I'm working on -->
    <div class="box animate__animated">
      <h3>Stuff I'm working on right now</h3>
      <ul>
        <li>Quantum Computing AI/ML Project</li>
        <li>Member of Harvard Tech for Social Good Project to build AI webscraper for Ample Harvest</li>
      </ul>
    </div>

    <!-- Bottom Section - Stuff I'm trying to learn -->
    <div class="box animate__animated">
      <h3>Stuff I'm trying to learn right now</h3>
      <ul>
        <li>Intro to Finance + Quant</li>
        <li>Quantum Computing</li>
        <li>Ventures/Startups</li>
        <li>Datastructures + Algos for recruiting</li>
      </ul>
    </div>
  </div>
</div>

<script src="https://kit.fontawesome.com/9e06b409af.js" crossorigin="anonymous"></script>

<!-- Animation and Layout Styles -->


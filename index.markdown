---
# Feel free to add content and custom Front Matter to this file.
# To modify the layout, see https://jekyllrb.com/docs/themes/#overriding-theme-defaults

layout: home
title: Home
weight: 1
---

<div class="parallax-container" onmousemove="parallax(event)">
    <div class="parallax-layer layer1">
      <img src="img/banner1.png" alt="Bottom Layer Image">
    </div>
    <div class="parallax-layer layer2">
      <img src="img/banner2.png" alt="Top Layer Image">
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
      // Adjust the movement ratios for the two layers
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
Highschool / Massachusetts 

### Who?
<body>
  <div class="bio animate__animated animate__shakeX">
    <p class="bio-text">
      Hi, I’m Advikar, a high schooler from Massachusetts. I like pens, rocks, stars, and deer (among other things). I wanted to try making a personal website in order to learn HTML/CSS and to hold some info and projects I’ve accumulated over the past few years. A lot of the things I’m working on are mostly comp sci focused, but I’m involved in a ton of other random stuff. If you want to contact me, I got socials somewhere below.
    </p>
    <p class="bio-text-small">This website is pretty raw and I'm not the best at HTML/CSS so bear with</p>
  </div>
  
  <div class="social-icons">
    <a href="https://github.com/{{ site.github_username }}" title="GitHub"><i class="fa-brands fa-github"></i></a>
    <a href="https://open.spotify.com/user/{{ site.spotify_id }}" title="Spotify"><i class="fa-brands fa-spotify"></i></a>
    <a href="https://discord.com/users/{{ site.discord_id }}" title="Discord"><i class="fa-brands fa-discord"></i></a>
  </div>
</body>

<script src="https://kit.fontawesome.com/9e06b409af.js" crossorigin="anonymous"></script>

<!--[![Wakatime stats](https://github-readme-stats.vercel.app/api/wakatime?username=AdvikarA)](https://github.com/anuraghazra/github-readme-stats)-->



            
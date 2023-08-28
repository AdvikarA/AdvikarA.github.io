---
layout: page
title: SciOly
permalink: /scioly/
weight: 3
---

### What

<div class="scienceteam">
        <p class="blurbt">
          Science Olympiad/Science Team has been the most influencial experience of High School for me. This page is for some notes and tests I've written. Lots of cool stuff 
        </p>
      </div>

<h3>Tests</h3>
<script src="https://kit.fontawesome.com/9e06b409af.js" crossorigin="anonymous"></script>

<ul class="noindent">
    <li> 
        <a href="https://drive.google.com/drive/folders/19dpm8k1W71dZIXnDxzovbOWfOix-4Gt5?usp=sharing" target="_blank"><i class="far fa-folder"></i></a>
    2023 UMASO Invitational [Dynamic Planet]
    </li>
    <li>
        <a href="https://drive.google.com/drive/folders/1l8lhq-HD-iNDor_TD7ZOK2erw_JkncWF?usp=sharing" target="_blank"><i class="far fa-folder"></i></a>
    2023 LexSO Invitational [Rocks and Minerals]
    </li>
    <li>
        <a href="https://drive.google.com/drive/folders/1l8lhq-HD-iNDor_TD7ZOK2erw_JkncWF?usp=sharing" target="_blank"><i class="far fa-folder"></i></a>
    {coming soon} 2023 AB Tryouts [Dynamic Planet]
    </li>
    <li>
        <a href="https://drive.google.com/drive/folders/1l8lhq-HD-iNDor_TD7ZOK2erw_JkncWF?usp=sharing" target="_blank"><i class="far fa-folder"></i></a>
    {coming soon} 2023 AB Tryouts [Fossils]
    </li>
    <li>
        <a href="https://drive.google.com/drive/folders/1l8lhq-HD-iNDor_TD7ZOK2erw_JkncWF?usp=sharing" target="_blank"><i class="far fa-folder"></i></a>
    {coming soon} 2023 AB Tryouts [Geologic Mapping]
    </li>
    <li>
        <a href="https://drive.google.com/drive/folders/1l8lhq-HD-iNDor_TD7ZOK2erw_JkncWF?usp=sharing" target="_blank"><i class="far fa-folder"></i></a>
    {coming soon} 2023 AB Tryouts [Astronomy]
    </li>
</ul>
<h3>Bridge</h3>
<div id="slideshow-example" data-component="slideshow" class="slideshow-container">
    <div role="list" class="slides">
        <div class="slide">
            <img src="/img/b1.jpg" alt="">
        </div>
        <div class="slide">
            <img src="/img/b2.jpg" alt="">
        </div>
        <div class="slide">
            <img src="/img/b3.jpg" alt="">
        </div>
    </div>
</div>

<script>
  var slideshows = document.querySelectorAll('[data-component="slideshow"]');
  slideshows.forEach(initSlideShow);
  function initSlideShow(slideshow) {
    var slides = document.querySelectorAll(`#${slideshow.id} [role="list"] .slide`);
    var index = 0;
    var time = 5000;
    // Apply initial state to slides
    slides.forEach((slide, i) => {
      slide.style.animation = i === index ? 'fade-in 1s ease-in-out' : 'none';
      slide.style.opacity = i === index ? '1' : '0';
    });
    setInterval(() => {
      slides[index].style.animation = 'fade-out 1s ease-in-out';
      slides[index].style.opacity = '0';
      index++;
      if (index === slides.length) {
        index = 0;
      }
      slides[index].style.animation = 'fade-in 1s ease-in-out';
      slides[index].style.opacity = '1';
    }, time);
  }
</script>


<div class="vid-container project-vid">
  <h3 class="project-title">Bridge Video</h3>
  <p class="project-details">
    <iframe width="700" height="400" src="https://www.youtube.com/embed/s9GFkTlP6ME" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
  </p>
</div>
<!---
### Extra
<div class="idk">
        <p class="blurbt">
          Some other stuff  
        </p>
      </div>
<h3>Debate</h3>
<script src="https://kit.fontawesome.com/9e06b409af.js" crossorigin="anonymous"></script>
<h1>Resources</h1>
<ul class="noindent">
    <li> 
    <span class="inline-icon">
        <a href="https://plato.stanford.edu/index.html" target="_blank"><i class="far fa-folder"></i></a>
    </span> 
    Stanford Encyclopedia of Philosophy
    </li>
    <li> 
    <span class="inline-icon">
        <a href="https://www.elsewhere.org/pomo/" target="_blank"><i class="far fa-folder"></i></a>
    </span> 
    Postmodernism site for spreading drills
    </li> 
</ul>
<h3>Student Goverment</h3>
<ul>
    <li><a href="https://sites.google.com/abschools.org/studentcouncil/home?authuser=0">AB Student Council</a></li>
</ul>
<h3>Politics</h3>
<img src="/img/PoliticalCompass.jpg" alt="">
### Links
<div class="links">
        <p class="blurbt">
            Links for convience 
        </p>
</div>
--->
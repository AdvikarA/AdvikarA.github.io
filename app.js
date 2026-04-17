(function () {
  const site = window.SITE_DATA || {};
  const content = window.SITE_CONTENT || {};
  const pageKey = document.body.dataset.page || "";
  const HOME_TREE_CONFIG = {
    left: {
      seed: 87,
      scale: 144,
      maxDepth: 9,
      lineWidth: 48.760000000000005,
      lineWidthFalloff: 1.44,
      lengthVar: 2.1,
      branchiness: 0.031,
      curveAmount: 0.15,
      upAmount: 0.0085,
      spread: 0.58,
      swayStrength: 0.0045,
      spreadOscillation: 0.0045,
      leafPulse: 0.18,
      startX: 340,
      startY: 1060,
      cssWidth: 430,
      cssHeight: 500,
      stroke: "rgb(83,53,10)",
      leafMode: "pink",
      leafSizeMultiplier: 1.84,
      baseLineWidth: 48.760000000000005,
      baseScale: 144,
      interactiveStrength: 0.16
    },
    desktopForeground: {
      seed: 31,
      scale: 172,
      maxDepth: 11,
      lineWidth: 76.32000000000001,
      lineWidthFalloff: 1.46,
      lengthVar: 2.3,
      branchiness: 0.034,
      curveAmount: 0.15,
      upAmount: 0.0085,
      spread: 0.58,
      swayStrength: 0.006,
      spreadOscillation: 0.006,
      leafPulse: 0.2,
      startX: 620,
      startY: 1500,
      cssWidth: 760,
      cssHeight: 760,
      stroke: "rgb(83,53,10)",
      leafMode: "pink",
      leafSizeMultiplier: 1.84,
      baseLineWidth: 76.32000000000001,
      baseScale: 172,
      interactiveStrength: 0.2
    },
    mobile: {
      seed: 31,
      scale: 94.60000000000001,
      maxDepth: 11,
      lineWidth: 55.120000000000005,
      lineWidthFalloff: 1.52,
      lengthVar: 2.3,
      branchiness: 0.034,
      curveAmount: 0.15,
      upAmount: 0.0085,
      spread: 0.58,
      swayStrength: 0.006,
      spreadOscillation: 0.006,
      leafPulse: 0.2,
      startX: null,
      startY: null,
      cssWidth: null,
      cssHeight: 360,
      stroke: "rgb(83,53,10)",
      leafMode: "pink",
      leafSizeMultiplier: 1.84,
      baseLineWidth: 55.120000000000005,
      baseScale: 94.60000000000001,
      interactiveStrength: 0.16
    }
  };
  function $(id) {
    return document.getElementById(id);
  }

  function SeededRandom(seed) {
    this.seed = seed;
  }

  SeededRandom.prototype.random = function () {
    const x = Math.sin(this.seed) * 10000;
    this.seed += 1;
    return x - Math.floor(x);
  };

  SeededRandom.prototype.gaussian = function (mean, std) {
    let rand = 0;
    for (let i = 0; i < 6; i += 1) {
      rand += this.random();
    }
    return ((rand - 3) / 6) * std + mean;
  };

  SeededRandom.prototype.unif = function (a, b) {
    return this.random() * (b - a) + a;
  };

  function leafStyle(random, frame, mode, alphaPulse) {
    const alpha = 0.8 + alphaPulse * Math.sin(frame / 50);

    if (mode === "summer") {
      const hue = random.gaussian(112, 12);
      const sat = random.unif(42, 60);
      const light = random.unif(28, 39);
      return `hsla(${hue}, ${sat}%, ${light}%, ${alpha})`;
    }

    if (mode === "pink") {
      const hue = random.gaussian(336, 16);
      const sat = random.unif(64, 92);
      const light = random.unif(66, 84);
      return `hsla(${hue}, ${sat}%, ${light}%, ${alpha})`;
    }

    const hue = random.gaussian(28, 30);
    const sat = random.unif(90, 100);
    const light = random.unif(38, 45);
    return `hsla(${hue}, ${sat}%, ${light}%, ${alpha})`;
  }

  function drawTreeBranch(x, y, angle, depth, random, config, ctx, frame) {
    if (depth >= config.maxDepth) {
      return;
    }

    let cursorX = x;
    let cursorY = y;
    let cursorAngle = angle;
    const length = (config.scale / depth) * random.gaussian(1, config.lengthVar);
    const segments = Math.max(1, Math.floor(length / 10));

    ctx.lineWidth = config.lineWidth / Math.pow(config.lineWidthFalloff, depth);
    ctx.strokeStyle = config.stroke;
    ctx.lineCap = "round";

    let curveDirection = -1;
    let curve = config.curveAmount * curveDirection;
    if (depth === 1) {
      curve *= 0.25;
    }

    for (let i = 0; i < segments; i += 1) {
      const up = Math.PI / 2 - angle;
      cursorAngle += curve + up * config.upAmount * depth;
      cursorX = x + 20 * Math.cos(angle);
      cursorY = y + 20 * Math.sin(angle);

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(cursorX, cursorY);
      ctx.stroke();

      x = cursorX;
      y = cursorY;
      angle = cursorAngle;

      if (random.unif(0, 1) < config.branchiness) {
        const direction = random.unif(0, 1) < 0.5 ? -1 : 1;
        drawTreeBranch(
          x,
          y,
          angle + (config.spread / 2) * direction,
          depth + 1,
          random,
          config,
          ctx,
          frame
        );
        ctx.lineWidth = config.lineWidth / Math.pow(config.lineWidthFalloff, depth);
      }
    }

    const direction = random.unif(0, 1) < 0.5 ? -1 : 1;
    drawTreeBranch(x, y, angle + config.spread * direction, depth + 1, random, config, ctx, frame);
    drawTreeBranch(x, y, angle + config.spread * -direction, depth + 1, random, config, ctx, frame);

    if (depth >= config.maxDepth - 2) {
      const size = Math.max(1.5, random.gaussian(14, 24)) * (config.leafSizeMultiplier || 1);
      const rotation = random.unif(0, Math.PI * 2);
      ctx.fillStyle = leafStyle(random, frame, config.leafMode, config.leafPulse);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.fillRect(-size / 2, -size / 2, size, size);
      ctx.restore();
    }
  }

  function fitCanvas(canvas, config) {
    if (!canvas) return null;
    const cssWidth = config.cssWidth || canvas.clientWidth || canvas.getBoundingClientRect().width;
    const cssHeight = config.cssHeight || canvas.clientHeight || canvas.getBoundingClientRect().height;
    canvas.style.width = `${cssWidth}px`;
    canvas.style.height = `${cssHeight}px`;
    canvas.width = Math.max(1, Math.floor(cssWidth * 2));
    canvas.height = Math.max(1, Math.floor(cssHeight * 2));
    const ctx = canvas.getContext("2d");
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    return { ctx, width: canvas.width, height: canvas.height, cssWidth, cssHeight };
  }

  function createAnimatedTree(canvas, baseConfig) {
    if (!canvas) return null;

    let frame = 0;
    let rafId = 0;
    let metrics = fitCanvas(canvas, baseConfig);
    let targetOffset = 0;
    let currentOffset = 0;

    function updatePointer(event) {
      const rect = canvas.getBoundingClientRect();
      const px = event.clientX - rect.left;
      const py = event.clientY - rect.top;

      if (px < -140 || px > rect.width + 140 || py < -140 || py > rect.height + 140) {
        return;
      }

      const nx = px / Math.max(rect.width, 1);
      const distanceX = Math.abs(nx - 0.5);
      const influence = Math.max(0, 1 - distanceX * 1.6);
      targetOffset = ((nx - 0.5) * (baseConfig.interactiveStrength || 0)) * influence;
    }

    function draw() {
      if (!metrics) return;
      const { ctx, width, height } = metrics;
      const random = new SeededRandom(baseConfig.seed);
      currentOffset += (targetOffset - currentOffset) * 0.04;
      const interactiveShift = currentOffset;
      const startAngle = -1 * (Math.PI / 2) + random.gaussian(0, 0.5) + interactiveShift * 0.4;
      const delta = Math.sin(frame / 140) * baseConfig.swayStrength + baseConfig.curveAmount;

      const animatedConfig = Object.assign({}, baseConfig, {
        spread: baseConfig.spread
          + baseConfig.spreadOscillation * Math.sin(frame / 30)
          + interactiveShift * 0.18,
        curveAmount: -0.15 + Math.pow(Math.max(delta, 0.001), 0.8) + interactiveShift * 0.12
      });

      ctx.clearRect(0, 0, width, height);
      drawTreeBranch(
        baseConfig.startX ?? width * 0.8,
        baseConfig.startY ?? height,
        startAngle,
        1,
        random,
        animatedConfig,
        ctx,
        frame
      );

      frame += 1;
      rafId = window.requestAnimationFrame(draw);
    }

    function resize() {
      if (!baseConfig.cssWidth) {
        baseConfig.cssWidth = canvas.parentElement ? canvas.parentElement.clientWidth : canvas.clientWidth;
      }
      metrics = fitCanvas(canvas, baseConfig);
    }

    window.addEventListener("mousemove", updatePointer, { passive: true });

    draw();
    return {
      resize,
      destroy() {
        window.removeEventListener("mousemove", updatePointer);
        window.cancelAnimationFrame(rafId);
      }
    };
  }

  function initHomeTrees() {
    if (pageKey !== "home") return;

    const mobileCanvas = $("tree-mobile");
    if (mobileCanvas) {
      HOME_TREE_CONFIG.mobile.cssWidth = mobileCanvas.parentElement
        ? mobileCanvas.parentElement.clientWidth
        : window.innerWidth;
      HOME_TREE_CONFIG.mobile.startX = HOME_TREE_CONFIG.mobile.cssWidth * 1.6;
      HOME_TREE_CONFIG.mobile.startY = HOME_TREE_CONFIG.mobile.cssHeight * 2;
    }

    const trees = [
      createAnimatedTree($("tree-left"), HOME_TREE_CONFIG.left),
      createAnimatedTree($("tree-foreground"), HOME_TREE_CONFIG.desktopForeground),
      createAnimatedTree($("tree-mobile"), HOME_TREE_CONFIG.mobile)
    ].filter(Boolean);

    function onResize() {
      trees.forEach(tree => tree.resize());
    }

    window.addEventListener("resize", onResize);
  }

  function initPetalField() {
    if (pageKey !== "home") return;

    const field = $("petal-field");
    if (!field) return;

    const random = new SeededRandom(912);
    const petalCount = window.innerWidth < 700 ? 20 : 34;
    const bottomPetalCount = window.innerWidth < 700 ? 120 : 220;
    field.innerHTML = "";

    for (let i = 0; i < petalCount; i += 1) {
      const petal = document.createElement("span");
      const size = 10;
      const hue = random.gaussian(336, 14);
      const sat = random.unif(68, 90);
      const light = random.unif(70, 84);
      const alpha = random.unif(0.42, 0.78);

      petal.className = "petal";
      petal.style.left = `${random.unif(0, 100)}vw`;
      petal.style.top = `${random.unif(6, 94)}vh`;
      petal.style.width = `${size}px`;
      petal.style.height = `${size}px`;
      petal.style.opacity = `${alpha}`;
      petal.style.transform = `rotate(${random.unif(0, 360)}deg)`;
      petal.style.background = `hsla(${hue}, ${sat}%, ${light}%, ${alpha})`;
      field.appendChild(petal);
    }

    for (let i = 0; i < bottomPetalCount; i += 1) {
      const petal = document.createElement("span");
      const size = 10;
      const hue = random.gaussian(336, 16);
      const sat = random.unif(68, 92);
      const light = random.unif(70, 86);
      const alpha = random.unif(0.5, 0.84);

      petal.className = "petal";
      petal.style.left = `${random.unif(-2, 102)}vw`;
      petal.style.bottom = `${random.unif(-2, 8)}px`;
      petal.style.top = "auto";
      petal.style.width = `${size}px`;
      petal.style.height = `${size}px`;
      petal.style.opacity = `${alpha}`;
      petal.style.transform = `rotate(${random.unif(0, 360)}deg)`;
      petal.style.background = `hsla(${hue}, ${sat}%, ${light}%, ${alpha})`;
      field.appendChild(petal);
    }
  }

  function renderNav() {
    const navName = $("nav-name");
    const navList = $("nav-links");
    if (!navName || !navList) return;

    document.title = site.siteTitle || "";
    navName.textContent = site.name || "";
    navList.innerHTML = (site.navLinks || []).map(link => {
      const current = link.key === pageKey ? ' aria-current="page"' : "";
      return `<li><a href="${link.href}"${current}>${link.label}</a></li>`;
    }).join("");
  }

  function renderFooter() {
    const footer = $("footer-copy");
    if (!footer) return;
    footer.textContent = `${site.name || ""} · updated 2026`;
  }

  function slugify(text) {
    return (text || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function renderHome() {
    const home = (content.site && content.site.home) || {};
    if (!home) return;
    const title = $("home-title");
    const paragraphs = $("home-paragraphs");
    const bio = $("home-bio");
    const links = $("home-links");

    if (title) {
      title.textContent = home.introTitle;
    }

    if (paragraphs) {
      paragraphs.innerHTML = home.introParagraphs.map(text => `<p class="lede">${text}</p>`).join("");
    }

    if (bio) {
      bio.textContent = site.bio || "";
    }

    if (links) {
      links.innerHTML = (site.socialLinks || []).map(link => (
        `<li><a href="${link.href}">${link.label}</a></li>`
      )).join("");
    }
  }

  function renderWriting() {
    const list = $("writing-list");
    if (!list) return;
    if (!content.writing || content.writing.length === 0) {
      list.innerHTML = `<li class="home-note">Nothing here yet.</li>`;
      return;
    }
    list.innerHTML = (content.writing || []).map(item => `
      <li>
        <a class="index-link" href="essay.html?slug=${item.slug}">
          <span class="index-title">${item.title}</span>
          <div class="index-meta">${item.date}</div>
          <div class="index-summary">${item.summary}</div>
        </a>
      </li>
    `).join("");
  }

  function renderEssay() {
    const title = $("essay-title");
    if (!title) return;

    const params = new URLSearchParams(window.location.search);
    const slug = params.get("slug") || (content.writing && content.writing[0] && content.writing[0].slug);
    const essay = content.essays && content.essays[slug];

    if (!essay) {
      title.textContent = "Essay not found";
      $("essay-meta").textContent = "";
      $("essay-body").innerHTML = `<p>The requested essay could not be found.</p>`;
      return;
    }

    title.textContent = essay.title;
    $("essay-meta").textContent = essay.date;
    $("essay-body").innerHTML = [
      `<p>${essay.intro}</p>`,
      ...essay.body.map(paragraph => `<p>${paragraph}</p>`)
    ].join("");
  }

  function renderBookshelf() {
    const list = $("books-list");
    if (!list) return;
    list.innerHTML = (content.books || []).map(book => `
      <li>
        <span class="book-title">${book.title}</span>
        <div class="book-meta">${book.author}</div>
        <div class="book-note">${book.note}</div>
      </li>
    `).join("");
  }

  function renderProjects() {
    const list = $("projects-list");
    const toc = $("projects-toc");
    if (!list) return;
    const projects = (content.site && content.site.projects) || [];
    function renderEntryLinks(entry) {
      return entry.links.map(link => {
        const isExternal = /^https?:\/\//.test(link.href);
        const attrs = isExternal ? ' target="_blank" rel="noreferrer"' : "";
        return `<a href="${link.href}"${attrs}>${link.label}</a>`;
      }).join(entry.featured ? "" : " · ");
    }
    if (toc) {
      toc.innerHTML = projects.map(project => {
        const sectionId = `project-group-${slugify(project.title)}`;
        return `<li><a href="#${sectionId}">${project.title}</a></li>`;
      }).join("");
    }
    list.innerHTML = projects.map(project => `
      <li id="project-group-${slugify(project.title)}">
        <h2 class="project-title">${project.title}</h2>
        <div class="project-meta">${project.years}</div>
        <p class="project-blurb">${project.blurb}</p>
        ${project.entries ? `
          <div class="project-entries">
            ${project.entries.map((entry, entryIndex) => `
              <section class="project-entry project-entry-split ${entry.featured ? "project-entry-featured" : ""} ${entry.images && entry.images.length ? "" : "project-entry-no-media"}">
                <div class="project-entry-top ${entry.images && entry.images.length ? "" : "project-entry-top-no-media"}">
                  <div class="project-entry-body">
                    ${entry.featured ? `<div class="project-entry-kicker">${entry.featureLabel || "Featured"}</div>` : ""}
                    <h2 class="project-entry-title">${entry.title}</h2>
                    <div class="project-entry-meta">${entry.meta}</div>
                    ${entry.featured && entry.links && entry.links.length ? `
                      <p class="project-entry-link project-entry-link-primary">
                        ${renderEntryLinks(entry)}
                      </p>
                    ` : ""}
                    ${entry.paragraphs.slice(0, 2).map(paragraph => `<p class="project-entry-copy">${paragraph}</p>`).join("")}
                  </div>
                  ${entry.images && entry.images.length ? `
                    <div class="project-entry-media">
                      <div class="project-slideshow" data-project-slideshow data-slideshow-id="${entryIndex}">
                        <div class="project-slide-viewport" style="--project-slide-ratio: ${entry.slideRatio || "1.6 / 1"};">
                          ${entry.images.map((image, imageIndex) => `
                            <figure class="project-slide ${imageIndex === 0 ? "is-active" : ""}">
                              <img class="project-entry-image" src="${image.src}" alt="${image.alt}" loading="lazy" />
                            </figure>
                          `).join("")}
                          ${entry.images.length > 1 ? `
                            <button class="project-slide-button project-slide-prev" type="button" aria-label="Previous image">←</button>
                            <button class="project-slide-button project-slide-next" type="button" aria-label="Next image">→</button>
                          ` : ""}
                        </div>
                      </div>
                      ${entry.images.length > 1 ? `
                        <div class="project-slide-dots" role="tablist" aria-label="${entry.title} images">
                          ${entry.images.map((image, imageIndex) => `
                            <button
                              class="project-slide-dot ${imageIndex === 0 ? "is-active" : ""}"
                              type="button"
                              aria-label="Go to image ${imageIndex + 1}"
                              data-project-dot
                              data-slide-index="${imageIndex}"
                            ></button>
                          `).join("")}
                        </div>
                      ` : ""}
                    </div>
                  ` : ""}
                </div>
                <div class="project-entry-details">
                  ${entry.paragraphs.slice(2).map(paragraph => `<p class="project-entry-copy">${paragraph}</p>`).join("")}
                  <ul class="project-entry-list">
                    ${entry.bullets.map(item => `<li>${item}</li>`).join("")}
                  </ul>
                  <p class="project-entry-impact"><strong>Impact:</strong> ${entry.impact}</p>
                  ${!entry.featured && entry.links && entry.links.length ? `
                    <p class="project-entry-link">
                      ${renderEntryLinks(entry)}
                    </p>
                  ` : ""}
                  ${entry.link ? `<p class="project-entry-link"><a href="${entry.link}" target="_blank" rel="noreferrer">${entry.linkLabel || "Link"}</a></p>` : ""}
                </div>
              </section>
            `).join("")}
          </div>
        ` : ""}
      </li>
    `).join("");
  }

  function initProjectOrbit() {
    if (pageKey !== "projects") return;

    const canvas = $("projects-orbit-field");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let time = 0.28;
    let stars = [];
    let planetSquares = [];
    let moonSquares = [];
    const random = new SeededRandom(2026);

    function resize() {
      width = document.documentElement.clientWidth;
      height = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        window.innerHeight
      );
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      generateScene();
    }

    function rotateSquare(x, y, size, angle, fill, alpha) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = fill;
      ctx.fillRect(-size / 2, -size / 2, size, size);
      ctx.restore();
      ctx.globalAlpha = 1;
    }

    function lerp(a, b, amount) {
      return a + (b - a) * amount;
    }

    function rgb(r, g, b) {
      return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
    }

    function mixColor(c1, c2, amount) {
      return rgb(
        lerp(c1[0], c2[0], amount),
        lerp(c1[1], c2[1], amount),
        lerp(c1[2], c2[2], amount)
      );
    }

    function clamp(value, min, max) {
      return Math.max(min, Math.min(max, value));
    }

    function generateStars() {
      stars = [];
      random.seed = 2026;
      const count = window.innerWidth < 700 ? 120 : 240;
      const colors = [
        "rgba(121, 137, 227, 0.58)",
        "rgba(141, 151, 233, 0.54)",
        "rgba(167, 175, 238, 0.48)",
        "rgba(104, 124, 214, 0.52)"
      ];

      for (let i = 0; i < count; i += 1) {
        stars.push({
          x: random.unif(8, width - 8),
          y: random.unif(8, height - 8),
          size: random.unif(4, 9),
          angle: random.unif(0, Math.PI / 2),
          color: colors[i % colors.length],
          alpha: random.unif(0.28, 0.72)
        });
      }
    }

    function generatePlanetSquares(radius, dark, light, count) {
      const squares = [];

      for (let i = 0; i < count; i += 1) {
        const angle = Math.random() * Math.PI * 2;
        const distance = radius * Math.sqrt(Math.random());
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        const dx = x / radius;
        const dy = y / radius;
        const lightDirX = 0.88;
        const lightDirY = -0.78;

        let shade = (dx * lightDirX + dy * lightDirY + 1) / 2;
        shade = clamp(shade, 0, 1);

        const edgeFade = 1 - Math.min(1, Math.sqrt(dx * dx + dy * dy));
        let contrastShade = Math.pow(shade, 0.62);
        contrastShade += (Math.random() - 0.5) * 0.22;
        contrastShade = clamp(contrastShade, 0, 1);

        squares.push({
          x,
          y,
          size: lerp(11, 24, Math.random()) * (0.86 + edgeFade * 0.24),
          angle: Math.random() * 0.28 - 0.14,
          color: mixColor(dark, light, contrastShade),
          alpha: 0.76 + Math.random() * 0.08,
          shade: contrastShade
        });
      }

      squares.sort((a, b) => a.shade - b.shade);
      return squares;
    }

    function generateMoonSquares(radius, dark, light, count) {
      const squares = [];

      for (let i = 0; i < count; i += 1) {
        const angle = Math.random() * Math.PI * 2;
        const distance = radius * Math.sqrt(Math.random());
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        const dx = x / radius;
        const dy = y / radius;
        const lightDirX = 0.84;
        const lightDirY = -0.58;

        let shade = (dx * lightDirX + dy * lightDirY + 1) / 2;
        shade = clamp(shade, 0, 1);

        let contrastShade = Math.pow(shade, 0.67);
        contrastShade += (Math.random() - 0.5) * 0.18;
        contrastShade = clamp(contrastShade, 0, 1);

        squares.push({
          x,
          y,
          size: lerp(7, 13, Math.random()),
          angle: Math.random() * 0.24 - 0.12,
          color: mixColor(dark, light, contrastShade),
          alpha: 0.86 + Math.random() * 0.08,
          shade: contrastShade
        });
      }

      squares.sort((a, b) => a.shade - b.shade);
      return squares;
    }

    function generateScene() {
      const planetRadius = Math.min(window.innerWidth, window.innerHeight) * 0.165;
      const moonRadius = planetRadius * 0.19;

      planetSquares = generatePlanetSquares(
        planetRadius,
        [52, 46, 170],
        [240, 233, 252],
        1500
      );

      moonSquares = generateMoonSquares(
        moonRadius,
        [196, 163, 74],
        [252, 242, 208],
        420
      );

      generateStars();
    }

    function drawBackground() {
      stars.forEach(star => {
        rotateSquare(star.x, star.y, star.size, star.angle, star.color, star.alpha);
      });
    }

    function drawSquareObject(cx, cy, squares) {
      squares.forEach(square => {
        rotateSquare(cx + square.x, cy + square.y, square.size, square.angle, square.color, square.alpha);
      });
    }

    function getOrbitPoint(cx, cy, rx, ry, rotation, angle) {
      const ex = Math.cos(angle) * rx;
      const ey = Math.sin(angle) * ry;

      return {
        x: cx + ex * Math.cos(rotation) - ey * Math.sin(rotation),
        y: cy + ex * Math.sin(rotation) + ey * Math.cos(rotation)
      };
    }

    function frameLoop() {
      ctx.clearRect(0, 0, width, height);
      drawBackground();

      const cx = width * 0.8;
      const cy = Math.min(460, window.innerHeight * 0.4);
      const planetRadius = Math.min(window.innerWidth, window.innerHeight) * 0.165;
      const orbitRx = planetRadius * 1.4;
      const orbitRy = planetRadius * 0.3;
      const orbitRotation = -0.1;
      const moon = getOrbitPoint(cx, cy, orbitRx, orbitRy, orbitRotation, time);
      const moonInFront = Math.sin(time) > 0;

      if (!moonInFront) {
        drawSquareObject(moon.x, moon.y, moonSquares);
      }

      drawSquareObject(cx, cy, planetSquares);

      if (moonInFront) {
        drawSquareObject(moon.x, moon.y, moonSquares);
      }

      time += 0.02;
      window.requestAnimationFrame(frameLoop);
    }

    window.addEventListener("resize", resize);
    resize();
    frameLoop();
  }

  function initProjectSlideshows() {
    const slideshows = document.querySelectorAll("[data-project-slideshow]");
    slideshows.forEach(slideshow => {
      const slides = Array.from(slideshow.querySelectorAll(".project-slide"));
      const dots = Array.from(slideshow.parentElement.querySelectorAll("[data-project-dot]"));
      const prev = slideshow.querySelector(".project-slide-prev");
      const next = slideshow.querySelector(".project-slide-next");
      if (!slides.length) return;

      let currentIndex = 0;

      function render(index) {
        currentIndex = (index + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
          slide.classList.toggle("is-active", slideIndex === currentIndex);
        });
        dots.forEach((dot, dotIndex) => {
          dot.classList.toggle("is-active", dotIndex === currentIndex);
        });
      }

      prev && prev.addEventListener("click", () => render(currentIndex - 1));
      next && next.addEventListener("click", () => render(currentIndex + 1));
      dots.forEach((dot, dotIndex) => {
        dot.addEventListener("click", () => render(dotIndex));
      });
      render(0);
    });
  }

  function renderContact() {
    const copy = $("contact-note");
    const links = $("contact-links");
    if (!copy || !links) return;
    copy.textContent = (content.contact && content.contact.note) || "";
    links.innerHTML = (site.socialLinks || []).map(link => `
      <li><a href="${link.href}">${link.label}</a></li>
    `).join("");
  }

  renderNav();
  renderFooter();
  renderHome();
  renderWriting();
  renderEssay();
  renderBookshelf();
  renderProjects();
  renderContact();
  initProjectSlideshows();
  initHomeTrees();
  initPetalField();
  initProjectOrbit();
})();

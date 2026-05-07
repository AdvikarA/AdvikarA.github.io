function projectImage(src, alt) {
  return { src, alt };
}

function projectEntry(config) {
  return {
    title: config.title,
    meta: config.meta,
    slideRatio: config.slideRatio,
    images: config.images || [],
    paragraphs: config.paragraphs || [],
    bullets: config.bullets || [],
    impact: config.impact || "",
    link: config.link || "",
    linkLabel: config.linkLabel || "",
    links: config.links || [],
    featured: config.featured || false,
    featuredPlain: config.featuredPlain || false,
    featureLabel: config.featureLabel || ""
  };
}

const PROJECT_MOMENTUM_EOSS = projectEntry({
  title: "Momentum Further Constrains Sharpness at the Edge of Stochastic Stability",
  meta: "2026 · Optimization Research · arXiv:2604.14108",
  featured: true,
  featureLabel: "Featured research",
  paragraphs: [
    "A research project on how momentum changes the instability boundary that stochastic gradient methods organize around during neural network training.",
    "The paper studies SGD with momentum and Nesterov acceleration through the Edge of Stochastic Stability lens, showing that momentum does not have one simple stability threshold in mini-batch training. Instead, the curvature level selected by training depends strongly on batch size."
  ],
  bullets: [
    "Showed that momentum produces two batch-size regimes at the stochastic edge: a small-batch plateau near 2(1 - beta) / eta and a large-batch plateau aligned with deterministic momentum stability thresholds",
    "Found a qualitative flip in the small-batch regime, where momentum tightens the operative curvature constraint and biases training toward flatter regions than vanilla SGD",
    "Used intervention experiments to test whether the observed plateaus behave like active stability boundaries rather than passive measurements"
  ],
  impact: "The result sharpens the practical picture of momentum, batch size, and learning-rate coupling: momentum can either permit sharper solutions or constrain training toward flatter regions depending on the stochastic regime.",
  links: [
    { href: "momentum-edge-stochastic-stability.html", label: "Read the research note" },
    { href: "momentum-edge-stochastic-stability.pdf", label: "PDF" }
  ]
});

const PROJECT_DIAGQUANT = projectEntry({
  title: "DiagQuant / DiagBoost",
  meta: "2025 · CS 2420 · LLM Quantization",
  paragraphs: [
    "A research project on improving low-bit transformer quantization by extending SpinQuant with a bounded learned diagonal matrix.",
    "The report proposes DiagBoost, an affine transformation method that combines learned rotations with cheap coordinate-wise scaling, aiming to reduce quantization error while keeping the method practical for deployment."
  ],
  bullets: [
    "Generalized SpinQuant from a pure orthogonal rotation into a bounded affine transform, using a learned diagonal matrix after the rotation",
    "Developed the theoretical argument that diagonal scaling can strictly reduce quantization error on anisotropic data while matching SpinQuant on isotropic data",
    "Implemented simulated 4-bit weight and 8-bit activation quantization for GPT-2 Small on WikiText-2, with learned rotation and diagonal modules inserted around attention and MLP layers",
    "Compared baseline quantization, SpinQuant, joint DiagBoost training, and separate rotation-then-diagonal training regimes",
    "Found that DiagBoost improved GPT-2 perplexity under aggressive settings and that separate diagonal training achieved competitive perplexity with lower wall-clock training time"
  ],
  impact: "The project explored a low-overhead path for making aggressive LLM quantization more accurate by combining rotation-based outlier smoothing with hardware-friendly diagonal scaling.",
  links: [
    { href: "files/CS2420_Fall25_Report_11__Advikar_Ananthkumar__Sam_Huang__Nathan_Wei__Josh_Zyzak_pdf.pdf", label: "PDF report" }
  ]
});

const T4SG_INEEDANA = projectEntry({
  title: "INeedAnA AI Chatbot",
  meta: "2025–2026 · Harvard Tech for Social Good × INeedAnA",
  slideRatio: "1.95 / 1",
  images: [
    projectImage("images/ineedana1.png", "INeedAnA chatbot interface"),
    projectImage("images/ineedana2.png", "INeedAnA clinic and policy conversation flow"),
    projectImage("images/ineedana3.png", "INeedAnA admin and document-grounding workflow"),
    projectImage("images/ineedanaarch.png", "INeedAnA system architecture")
  ],
  paragraphs: [
    "As part of Harvard Tech for Social Good, I worked on an AI chatbot for INeedAnA, a reproductive healthcare resource platform.",
    "The goal was to preserve the functionality of INeedAnA's existing search flow while making it more accessible through natural-language interaction, with careful attention to accuracy, ease of use, and scalability.",
    "The system combined a Next.js frontend, a GPT-4o backend with tool calling, and a Supabase-based retrieval pipeline backed by an admin dashboard for maintaining document-grounded context."
  ],
  bullets: [
    "Built an LLM-powered chatbot that provided conversational access to clinic and abortion policy information while preserving the core utility of the platform's existing search experience",
    "Developed frontend chat flows with responsive UI, typing and loading states, markdown rendering, and resilient error handling so the chat experience felt like a native extension of the site",
    "Implemented a backend AI endpoint using GPT-4o with conversation history and tool routing between nearby clinic lookup, policy retrieval, and geocoding workflows",
    "Built a retrieval-augmented generation pipeline using Supabase vector search so answers could be grounded in document context rather than only model priors",
    "Created an admin dashboard for adding, deleting, viewing, and syncing documents into the retrieval system, including chunk inspection and CMS-to-vector-store synchronization",
    "Added authentication and route protection for dashboard access using Supabase Auth and a whitelist-based signup flow"
  ],
  impact: "The project extended INeedAnA's search experience with a conversational interface and maintainable document-grounded context, while preserving trust and operational scalability in a sensitive domain."
});

const T4SG_HOPEBOUND = projectEntry({
  title: "Hopebound Data Visualization Platform",
  meta: "2025 · React · Supabase · Project Management",
  slideRatio: "1.62 / 1",
  images: [
    projectImage("images/hopebound1.png", "Hopebound dashboard"),
    projectImage("images/hopebound2.png", "Hopebound impact metrics"),
    projectImage("images/hopebound3.png", "Hopebound admin panel"),
    projectImage("images/hopeboundarchitechture.png", "Hopebound system architecture")
  ],
  paragraphs: [
    "I led a team of six engineers building an interactive data platform for Hopebound, a nonprofit addressing the youth mental health crisis.",
    "The goal was to help the organization communicate both the scale of the crisis and their own impact to donors, stakeholders, and the public."
  ],
  bullets: [
    "Turn mental health statistics and impact metrics into accessible visual narratives",
    "Build an admin workflow so staff could update and manage data without engineering support",
    "Create an interactive story around Hopebound's role in clients' and providers' experiences",
    "Design a foundation that could scale with the organization"
  ],
  impact: "The finished platform improved Hopebound's ability to communicate its mission, support fundraising, and inform strategic planning."
});

const T4SG_AMPLEHARVEST = projectEntry({
  title: "AmpleHarvest Webscraper",
  meta: "2024 · Python · Web Scraping · LLM Integration",
  slideRatio: "2.48 / 1",
  images: [
    projectImage("images/AH2.png", "AmpleHarvest pipeline"),
    projectImage("images/AH3.png", "AmpleHarvest output")
  ],
  paragraphs: [
    "AmpleHarvest connects farmers with excess food to local food pantries, but the organization's pantry data had to be verified manually across thousands of locations.",
    "I worked on an automated pipeline for scraping pantry information, comparing it to the existing database, and identifying discrepancies more efficiently."
  ],
  bullets: [
    "MVP 0: basic spider pipeline for scraping and comparison using regex, extraction scripts, and error handling",
    "MVP 1: LLM-assisted extraction and smarter discrepancy handling against the current database",
    "MVP 2: faster, cheaper, and more reliable validation with refined prompting and address checking"
  ],
  impact: "The scraper substantially reduced the time and cost of data verification across more than 4,000 food pantries."
});

const T4SG_GRANSON_AI = projectEntry({
  title: "Granson AI Desktop Assistant",
  meta: "2026 · Harvard Tech for Social Good × Computers 4 People",
  slideRatio: "2.32 / 1",
  images: [
    projectImage("images/c4p1.png", "Granson AI home, tutorial, and options overlay screens"),
    projectImage("images/c4p2.png", "Granson AI interactive tutorial running over a browser")
  ],
  paragraphs: [
    "Granson AI is an AI-powered desktop companion built through Harvard Tech for Social Good for Computers 4 People, focused on real-time digital literacy support.",
    "The product is an always-available Electron overlay that sits on top of desktop applications and helps underserved users complete digital tasks with contextual instructions, multilingual chat, voice support, and step-by-step tutorials.",
    "The system combines an Electron shell, a Next.js backend, OpenAI and Anthropic model calls, screenshot analysis, speech-to-text, translation, tutorial data structures, and API-cost-aware design."
  ],
  bullets: [
    "Always-on-top desktop assistant with draggable, resizable overlay behavior and lightweight tutorial/chat surfaces that can run while the user works in other apps",
    "LLM pipelines for chat, tutorial generation, screenshot interpretation, coordinate extraction, and constrained digital-literacy responses",
    "Computer Use API-style interaction model using screen capture, vision-based bounding boxes, tool calls for locating interface elements, dynamic failure messages, and adaptive next-step guidance",
    "OpenAI and Anthropic API integrations across chatbot responses, interactive tutorials, vision analysis, voice transcription, and bilingual English/Spanish support",
    "Accessibility controls including larger text, opacity settings, language settings, audio input/output, simplified tabs, clearer buttons, and introductory app-tour flows",
    "Tutorial infrastructure for app tours, Google search, Gmail, Wi-Fi, and interactive user-prompted lessons that can update based on what is visible on screen"
  ],
  impact: "The team turned digital literacy help into a contextual desktop workflow: users could ask for help, receive screen-aware instructions, and move through tutorials without leaving the application they were trying to use.",
  links: [
    { href: "files/C4P x T4SG FINAL .pdf", label: "Final presentation" }
  ]
});

const T4SG_PROJECTS = [
  T4SG_GRANSON_AI,
  T4SG_INEEDANA,
  T4SG_HOPEBOUND,
  T4SG_AMPLEHARVEST
];

const PROJECT_NEWSAI = projectEntry({
  title: "NewsAI",
  meta: "2025 · Anthropic Hackathon · React · Node.js · Claude",
  slideRatio: "1.72 / 1",
  images: [
    projectImage("images/newsai1.png", "NewsAI dashboard"),
    projectImage("images/newsai2.png", "NewsAI comparison view"),
    projectImage("images/newsai3.png", "NewsAI assistant interface")
  ],
  paragraphs: [
    "A news product experiment built around showing multiple viewpoints instead of reinforcing one information bubble.",
    "It combined a personalized feed, perspective comparison, and an AI assistant for summarizing current events."
  ],
  bullets: [
    "Built a personalized news dashboard designed to challenge user beliefs while still surfacing relevant stories",
    "Created a multi-perspective analysis experience that contrasted differences, highlighted similarities, and surfaced source bias",
    "Integrated an AI assistant for summarization and conversational interaction around recent events",
    "Worked through authentication, image fetching and caching, and API-rate-limit constraints across multiple providers"
  ],
  impact: "The project explored a more reflective news experience centered on comparison, bias awareness, and better information hygiene."
});

const PROJECT_KALSHI = projectEntry({
  title: "Kalshi Trading Bot",
  meta: "2026 · Independent · In Progress",
  paragraphs: [
    "Its still in the works. Right now i've lost $7 trying to find alpha. >:/"
  ],
  bullets: [],
  impact: "none lol"
});

const PROJECT_EARTHQUAKE = projectEntry({
  title: "Applications of Large Language Models in Seismology",
  meta: "2025 · Google × Harvard Earth & Planetary Sciences · Gemini · Seismology",
  featured: true,
  featuredPlain: true,
  featureLabel: "Featured research",
  images: [],
  paragraphs: [
    "A completed research project with the Harvard Earth & Planetary Sciences Department studying whether Gemini can interpret three-component seismogram images inside an end-to-end seismology workflow.",
    "The project moved from controlled waveform datasets to a curated 23-event earthquake catalog, testing classification, phase picking, earthquake location, magnitude estimation, first-motion polarity reading, and focal-mechanism inference."
  ],
  bullets: [
    "Built a catalog pipeline that retrieves FDSN waveforms, renders six-panel raw and bandpass seismogram images, calls Gemini for structured waveform interpretation, and feeds LLM-derived picks into deterministic location and focal-mechanism stages",
    "Evaluated a five-run progression across prompt rules, model scale, forced magnitude estimation, Geiger inversion, azimuth-balanced station selection, and analyst-centered polarity zooms",
    "Found that LLM-derived P picks can support earthquake location with 9.6 km median epicentral error, improving to 6.6 km after geometric quality control",
    "Found that forced magnitude estimation from raw-count waveform images achieved 0.295 mean absolute error and 0.125 median error on the requested USGS magnitude scale",
    "Showed that first-motion polarity reading remained at chance, even when polarity windows were centered on analyst P picks, suggesting a vision-model capability ceiling"
  ],
  impact: "The work separates where multimodal LLMs are useful in seismology from where physics, station geometry, and signal-processing constraints still dominate.",
  links: [
    { href: "gemini-earthquake-research.html", label: "Research note" },
    { href: "files/EPS_210_Paper (2) copy.pdf", label: "PDF" },
    { href: "https://github.com/AdvikarA/Seismo-LLM", label: "Code" }
  ]
});

const PROJECT_QAOA = projectEntry({
  title: "Quantum Approximate Optimization Algorithm",
  meta: "2024 · qBraid Research Mentorship Program · Quantum Computing",
  slideRatio: "1.5 / 1",
  images: [
    projectImage("images/qaoa.png", "Quantum optimization diagram")
  ],
  paragraphs: [
    "This project was done through Harvard's Undergraduate Quantum Computing Association and the qBraid Research Mentorship Program.",
    "The work focused on the Maximum Cut problem and on whether a more deliberate classical intervention inside QAOA could improve optimization performance and convergence speed."
  ],
  bullets: [
    "Studied the MaxCut problem as a standard optimization benchmark for quantum approaches",
    "Explored adaptive measurement ideas and the role of partial measurements in optimization loops",
    "Learned core quantum-computing concepts, Qiskit tooling, and optimization framing through the project"
  ],
  impact: "The project served as an entry point into quantum optimization research and sharpened my understanding of hybrid quantum-classical methods."
});

const PROJECT_FACIES = projectEntry({
  title: "Geographic Facies Predictor",
  meta: "2022–2023 · Machine Learning · Streamlit · Geoscience",
  slideRatio: "1.77 / 1",
  images: [
    projectImage("images/facies1.png", "Geographic Facies Predictor application view")
  ],
  paragraphs: [
    "A web application that used machine learning to predict geological facies from well log data.",
    "I built a Streamlit interface so users could upload data, inspect predictions, and visualize the results in a browser-accessible workflow."
  ],
  bullets: [
    "Applied machine-learning methods to well log data for facies prediction",
    "Built a Streamlit app for upload, visualization, and interactive inspection",
    "Worked at the intersection of geoscience, data analysis, and lightweight product design"
  ],
  impact: "The project translated a research-style prediction task into a usable web interface for exploration and visualization.",
  link: "https://www.researchgate.net/publication/378331837_Using_Machine_Learning_to_Predict_Lithostratigraphic_Facies",
  linkLabel: "Paper"
});

const PROJECT_BOULDER = projectEntry({
  title: "Planetary Boulder Detection",
  meta: "2023 · Computer Vision · CNNs · Planetary Science",
  paragraphs: [
    "A computer-vision project aimed at identifying and outlining boulders in high-resolution planetary imagery for terrain characterization.",
    "My contribution was limited, but the work gave me hands-on exposure to geospatial workflows and to the practical framing of remote-sensing problems."
  ],
  bullets: [
    "Worked around convolutional approaches for boulder identification in orbital or satellite imagery",
    "Learned supporting geospatial tooling, including QGIS, through the project workflow",
    "Contributed to a terrain-analysis problem relevant to planetary exploration"
  ],
  impact: "A smaller contribution for me personally, but a useful project for learning geospatial tooling and applied vision workflows.",
  link: "https://github.com/astroNils/MLtools/tree/main",
  linkLabel: "Repository"
});

window.SITE_CONTENT = {
  site: {
    home: {
      introTitle: "The context window",
      introParagraphs: [
        "I'm Advikar. I study Computer Science and Statistics at Harvard. I'm interested in frontier ML, behavioral AI, interpretibiliy, and applied computational systems. I am currently building a project centered on context-rich systems that model patterns in human behavior over time",
        "This site is a personal archive and record of my work."
      ]
    },
    projects: [
      {
        title: "Research",
        years: "2022–2025",
        blurb: "Research-oriented work spanning geoscience, quantum computing, planetary vision, and current earthquake modeling efforts.",
        entries: [
          PROJECT_MOMENTUM_EOSS,
          PROJECT_EARTHQUAKE,
          PROJECT_DIAGQUANT,
          PROJECT_QAOA,
          PROJECT_FACIES,
          PROJECT_BOULDER
        ]
      },
      {
        title: "Tech for Social Good",
        years: "2024–2026",
        blurb: "A single umbrella project containing my work with Harvard's Tech for Social Good, focused on building software for nonprofits.",
        entries: T4SG_PROJECTS
      },
      {
        title: "Independent",
        years: "2025",
        blurb: "Additional venture and game development projects have been done but are not listed here.",
        entries: [
          PROJECT_KALSHI,
          PROJECT_NEWSAI
        ]
      }
    ]
  },
  writing: [],
  essays: {},
  books: [
    {
      title: "The Essays of Michel de Montaigne",
      author: "Michel de Montaigne",
      note: "A model for reflective writing that feels alive, skeptical, and generous."
    },
    {
      title: "The Beginning of Infinity",
      author: "David Deutsch",
      note: "A book that expands the scale of intellectual ambition."
    },
    {
      title: "The Peregrine",
      author: "J. A. Baker",
      note: "For the precision of its observation and the severity of its language."
    },
    {
      title: "The Art of Learning",
      author: "Josh Waitzkin",
      note: "Useful whenever I need to think about skill as a long-term practice."
    }
  ],
  contact: {
    note: "I am always happy to hear from thoughtful people working on difficult problems, unusual ideas, or careful projects."
  }
};

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
    { href: "files/2604.14108v1.pdf", label: "PDF" }
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

const T4SG_PROJECTS = [
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
  title: "Gemini-based LLM Earthquake Research",
  meta: "2025 · Google × Harvard Earth Science Department · In Progress",
  paragraphs: [
    "An in-progress research project focused on using Gemini to classify and predict earthquakes from seismic waveform data.",
    "The work sits at the boundary between Earth science, sequence modeling, and practical analysis workflows for seismic signals."
  ],
  bullets: [
    "Exploring LLM-assisted approaches for earthquake classification and forecasting tasks",
    "Working with waveform data and research workflows in collaboration with Earth science partners",
    "Still early enough that the system design and empirical results are evolving"
  ],
  impact: "Ongoing work. The current emphasis is on framing the problem well and building a research workflow that can support meaningful evaluation."
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
        blurb: "Independent builds outside formal research and nonprofit work. Game development work and the Harvard Purity Test still exist in the archive, but are intentionally omitted from this page.",
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

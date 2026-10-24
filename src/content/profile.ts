/**
 * Single source of truth for everything that isn't an album or a track.
 * Every string here is traceable to `C:\Users\rohan\Downloads\Resume.pdf`
 * or to the linked GitHub / LinkedIn profiles — no invented facts.
 */

export type SkillGroup = {
  /** mono label above the card, e.g. "ON REPEAT" */
  kicker: string;
  title: string;
  /** the short list rendered inside the card */
  items: string[];
  note?: string;
};

export type Experience = {
  kind: "experience" | "open-source";
  kicker: string;
  role: string;
  org: string;
  period: string;
  bullets: string[];
  link?: { label: string; href: string };
};

export type Certification = {
  title: string;
  issuer: string;
  summary: string;
};

export const profile = {
  name: "Rohan Dabhade",
  firstName: "Rohan",
  lastName: "Dabhade",
  handle: "Roahncodes",

  /** the one-line billboard under the name */
  tagline: "Computer Science student. Python enthusiast. Exploring AI & ML.",
  /** the chip above the name */
  badge: "Independent builder",

  location: "Bangalore, India",
  university: "Jain University",
  degree: "Computer Science",
  year: "Second-year student",
  classOf: "2028",
  availability: "Open to internships",

  email: "rohandabhade58@gmail.com",
  phone: "+91 951 2693 422",
  linkedin: "https://www.linkedin.com/in/rohan-dabhade",
  github: "https://github.com/Roahncodes",

  /** `SUMMARY` block of the resume, lightly edited for tone only */
  summary:
    "Computer Science student focused on Python, data science and machine learning, with hands-on experience building practical applications and an AI/ML internship behind me. Comfortable learning new tools by building with them, and using code to solve concrete problems.",

  /** "Behind the tracks" — the two-paragraph bio used on the home page */
  bio: [
    "I'm a Computer Science student building practical applications with Python and exploring the possibilities of machine learning. I learn by making, experimenting and turning real problems into working solutions.",
    "Recently an AI/ML intern at Shivohini, building a fire-safety recommendation rule engine, and a deep-learning pipeline for calorimeter super-resolution. Most of what I know came from building something small, understanding what's underneath it, then making it useful.",
  ],

  /** meta line: `Bangalore, India · Jain University · Class of 2028` */
  metaLine: "Bangalore, India · Jain University · Class of 2028",

  footerLeft: "Made of curiosity. Always in rotation.",
  footerRight: "Rohan Dabhade / 2026",
} as const;

/** The four "ON REPEAT" cards on /curiosity — mirrors the reference layout. */
export const skillGroups: SkillGroup[] = [
  {
    kicker: "ON REPEAT",
    title: "The building blocks",
    items: [
      "Python · NumPy · Pandas",
      "C · C++ · Java",
      "JavaScript · TypeScript",
      "HTML · CSS",
    ],
    note: "Comfortable in Python, reading C-family languages well enough to learn from them.",
  },
  {
    kicker: "ON REPEAT",
    title: "Working with data",
    items: ["MongoDB", "SQL", "NumPy · Pandas", "Scikit-learn (learning)", "Matplotlib (learning)"],
    note: "Schemas, queries and the slow work of getting data into a shape worth modelling.",
  },
  {
    kicker: "ON REPEAT",
    title: "Ideas into applications",
    items: ["PyQt5", "Speech recognition", "Encryption", "Git · GitHub", "Vercel"],
    note: "Desktop tools, voice interfaces and shipping something that runs on a real URL.",
  },
  {
    kicker: "ON REPEAT",
    title: "Still exploring",
    items: [
      "Scikit-learn",
      "Matplotlib",
      "Set-to-set transformers",
      "Flow matching",
      "GPU training on NVIDIA",
    ],
    note: "Building on my understanding of machine learning, one experiment at a time.",
  },
];

/** The highlighted "ON CONTINUOUS PLAY" card on /curiosity. */
export const currentlyStudying = {
  kicker: "ON CONTINUOUS PLAY",
  eyebrow: "GETTING STARTED",
  title: "Jain University",
  meta: "Computer Science — Second-year student. Bangalore, Karnataka",
  footnote: "Expected graduation: September 2028",
} as const;

export const experiences: Experience[] = [
  {
    kind: "experience",
    kicker: "ON REPEAT",
    role: "AI/ML Intern",
    org: "Shivohini",
    period: "May 26, 2026 — Aug 1, 2026",
    bullets: [
      "Built and refined a rule engine for a fire-safety tool recommendation model.",
      "Translated fire-safety requirements into structured rules used to generate recommendations.",
    ],
    link: { label: "May – Aug, 2026", href: "https://www.linkedin.com/in/rohan-dabhade" },
  },
  {
    kind: "open-source",
    kicker: "OPEN SOURCE",
    role: "ML4SCI — JetNet-SR-PFlow",
    org: "GSoC 2026 Contributor",
    period: "2026",
    bullets: [
      "Contributed to a machine learning pipeline for optimizing LHC calorimeter simulations.",
      "Implemented a two-stage system using Generative Flow Matching and Set-to-Set Transformers.",
      "Achieved 1:1 particle matching (30/30) on the JetNet dataset.",
      "Worked with GPU-accelerated training (NVIDIA) for improved validation.",
    ],
    link: {
      label: "Explore the project album",
      href: "https://github.com/Roahncodes/JetNet-SuperRes-PFlow",
    },
  },
];

export const hackathons = {
  kicker: "SIDE STAGE",
  title: "3+ hackathons, prototypes under pressure.",
  summary:
    "Participated in 3+ hackathons and worked with teams to build functional prototypes under time constraints — mostly on the backend, where I built systems and database logic with Supabase and MongoDB.",
} as const;

export const certifications: Certification[] = [
  {
    title: "Software Engineering Job Simulation",
    issuer: "Electronic Arts · Forage",
    summary:
      "Completed practical tasks replicating those of a Software Engineer at Electronic Arts.",
  },
  {
    title: "Solutions Architecture Job Simulation",
    issuer: "AWS APAC · Forage",
    summary:
      "Completed modules on designing and implementing cloud solutions, gaining exposure to core AWS services and architectural best practices.",
  },
];

/** The scrolling ticker under the hero — real tech, no filler. */
export const rotationStrip: string[] = [
  "Python",
  "PyTorch",
  "PyTorch Lightning",
  "NumPy",
  "Pandas",
  "MongoDB",
  "SQL",
  "TypeScript",
  "React",
  "Next.js",
  "PyQt5",
  "Speech recognition",
  "Encryption",
  "Scikit-learn",
  "Matplotlib",
  "Git",
  "Vercel",
];

/**
 * Every way to reach me, in one place. The rail, the home hero, the footer and
 * `/connect` all render from this list, so a new channel is added once.
 *
 * `icon` is a key into `components/social-links.tsx` rather than JSX — content
 * stays data, and the icon set stays in the components folder.
 */
export type Social = {
  key: string;
  icon: "github" | "linkedin" | "mail" | "phone";
  /** what the link reads as, e.g. `github.com/Roahncodes` */
  value: string;
  href: string;
  /** one line shown on /connect */
  note: string;
  /** show it as a button in the home hero */
  hero: boolean;
};

export const socials: Social[] = [
  {
    key: "GitHub",
    icon: "github",
    value: `github.com/${profile.handle}`,
    href: profile.github,
    note: "Two repositories, opened up as albums on the discography page.",
    hero: true,
  },
  {
    key: "LinkedIn",
    icon: "linkedin",
    value: "linkedin.com/in/rohan-dabhade",
    href: profile.linkedin,
    note: "Work history, posts and the professional version of all this.",
    hero: true,
  },
  {
    key: "Email",
    icon: "mail",
    value: profile.email,
    href: `mailto:${profile.email}`,
    note: "Best for internships, collaborations and anything with a deadline.",
    hero: true,
  },
  {
    key: "Phone",
    icon: "phone",
    value: profile.phone,
    href: `tel:${profile.phone.replace(/\s/g, "")}`,
    note: "Reachable in Indian Standard Time, Bangalore.",
    hero: false,
  },
];

export const navItems = [
  { label: "Artist home", href: "/" },
  { label: "Curiosity", href: "/curiosity" },
  { label: "GitHub projects", href: "/projects" },
  { label: "Liner notes", href: "/notes" },
  { label: "Resume", href: "/resume" },
] as const;

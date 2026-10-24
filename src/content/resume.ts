/**
 * The resume assets and the summary shown on /resume.
 *
 * Both files live in `public/resume/` and are the single source for the page:
 * `pdf` is the master document the download button hands over, `image` is a
 * 200 DPI A4 render of page one used for the inline preview. Replacing the PDF
 * means re-rendering the PNG at 1654×2339; the README has the command. The old
 * `scripts/make-resume-pdf.mjs` wrapper still exists for image-first resumes.
 */

export const resume = {
  /** the downloadable document */
  pdf: "/resume/rohan-dabhade-resume.pdf",
  /** a 200 DPI A4 render of the same page, used for the inline preview */
  image: "/resume/rohan-dabhade-resume.png",
  imageWidth: 1654,
  imageHeight: 2339,
  /** the name the browser saves it as */
  downloadName: "Rohan-Dabhade-Resume.pdf",
  /** shown above the title */
  kicker: "One page · A4 · the short version of everything here",
} as const;

/**
 * What's actually on the page — so the section is useful before anyone opens
 * the PDF, and so the page has real content for search engines. Every line
 * comes from the resume itself.
 */
export const resumeSections: { kicker: string; title: string; items: string[]; note?: string }[] = [
  {
    kicker: "EDUCATION",
    title: "Jain University",
    items: ["Computer Science", "Second-year student", "Bangalore, Karnataka"],
    note: "Expected graduation September 2028",
  },
  {
    kicker: "EXPERIENCE",
    title: "AI/ML Intern — Shivohini",
    items: ["May 26 — Aug 1, 2026", "Fire-safety recommendation rule engine"],
    note: "Built and refined the rule engine, and translated fire-safety requirements into the structured rules it recommends from.",
  },
  {
    kicker: "PROJECTS",
    title: "Four builds",
    items: [
      "AI Voice Assistant",
      "Message Encryption Tool",
      "Personal Portfolio Website",
      "ML4SCI — JetNet-SR-PFlow",
    ],
    note: "Voice commands in Python, applied cryptography, a deployed portfolio, and flow matching for LHC calorimeter super-resolution.",
  },
  {
    kicker: "HACKATHONS",
    title: "3+ hackathons",
    items: ["Functional prototypes under time pressure", "Backend systems and database logic"],
    note: "Built with teams, including Supabase and MongoDB for data management.",
  },
  {
    kicker: "CERTIFICATIONS",
    title: "Two job simulations",
    items: ["Electronic Arts · Forage", "AWS APAC · Forage"],
    note: "Software engineering and cloud solutions architecture.",
  },
];

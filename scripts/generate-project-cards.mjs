import { readFile, writeFile } from "node:fs/promises";

// Keep these descriptions short enough to read at GitHub's two-column profile width.
const projects = [
  {
    file: "tabweave",
    name: "TabWeave",
    category: "BROWSER EXTENSION",
    description: ["Keep crowded Chrome tabs organized", "with rules that fit your workflow."],
    technology: "TYPESCRIPT",
    accent: "#7559E8",
  },
  {
    file: "portpilot",
    name: "PortPilot",
    category: "macOS UTILITY",
    description: ["See which process owns a local port", "right from your macOS menu bar."],
    technology: "SWIFT",
    accent: "#3478E8",
  },
  {
    file: "MockKit",
    name: "MockKit",
    category: "DEVELOPER TOOL",
    description: ["Manage DevTools Local Overrides", "in a native-feeling macOS app."],
    technology: "TYPESCRIPT",
    accent: "#3478E8",
  },
  {
    file: "dom-ai-annotator",
    name: "DOM AI Annotator",
    category: "UI REVIEW",
    description: ["Mark up UI, measure details, and", "share feedback ready for AI tools."],
    technology: "TYPESCRIPT",
    accent: "#10A6B8",
  },
  {
    file: "tabworks",
    name: "TabWorks",
    category: "BROWSER AUTOMATION",
    description: ["Record and replay browser workflows", "in your signed-in Chrome session."],
    technology: "TYPESCRIPT",
    accent: "#7559E8",
  },
  {
    file: "search-mate",
    name: "Search Mate",
    category: "WEB UTILITY",
    description: ["Make shareable searches for Google", "and Baidu with a playful twist."],
    technology: "JAVASCRIPT",
    accent: "#10A6B8",
  },
];

const themes = {
  light: {
    background: "#F8FAFD",
    border: "#DCE4EE",
    title: "#172033",
    body: "#536176",
    quiet: "#718096",
  },
  dark: {
    background: "#0D131E",
    border: "#29364A",
    title: "#F3F6FB",
    body: "#B0BED0",
    quiet: "#8FA0B8",
  },
};

function escapeXml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function render(project, index, theme) {
  const color = themes[theme];
  const [firstLine, secondLine] = project.description.map(escapeXml);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="158" viewBox="0 0 400 158" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(project.name)}</title>
  <desc id="desc">${firstLine} ${secondLine}</desc>
  <rect x="0.5" y="0.5" width="399" height="157" rx="14" fill="${color.background}" stroke="${color.border}"/>
  <path d="M17 1H383" stroke="${project.accent}" stroke-width="2" stroke-linecap="round"/>
  <g font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif">
    <circle cx="24" cy="29" r="3" fill="${project.accent}"/>
    <text x="36" y="32" fill="${color.quiet}" font-size="9" font-weight="700" letter-spacing="1.3">${escapeXml(project.category)}</text>
    <text x="376" y="32" fill="${color.quiet}" font-size="9" font-weight="700" text-anchor="end">0${index + 1}</text>
    <text x="21" y="65" fill="${color.title}" font-size="23" font-weight="750" letter-spacing="-0.6">${escapeXml(project.name)}</text>
    <text x="21" y="91" fill="${color.body}" font-size="13">${firstLine}</text>
    <text x="21" y="109" fill="${color.body}" font-size="13">${secondLine}</text>
    <path d="M21 126.5H379" stroke="${color.border}"/>
    <text x="21" y="145" fill="${color.quiet}" font-size="9" font-weight="700" letter-spacing="1">${project.technology}</text>
    <text x="379" y="145" fill="${project.accent}" font-size="9" font-weight="700" letter-spacing="0.8" text-anchor="end">VIEW SOURCE ↗</text>
  </g>
</svg>
`;
}

let stale = false;
for (const [index, project] of projects.entries()) {
  for (const theme of Object.keys(themes)) {
    const path = new URL(`../project-cards/${project.file}-${theme}.svg`, import.meta.url);
    const svg = render(project, index, theme);
    if (process.argv.includes("--check")) {
      if ((await readFile(path, "utf8")) !== svg) {
        console.error(`Outdated card: ${path.pathname}`);
        stale = true;
      }
    } else {
      await writeFile(path, svg);
    }
  }
}

if (stale) process.exitCode = 1;

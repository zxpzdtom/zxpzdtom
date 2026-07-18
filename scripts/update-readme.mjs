import { readFile, writeFile } from "node:fs/promises";

const owner = process.env.PROFILE_OWNER || "zxpzdtom";
const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
const readmePath = new URL("../README.md", import.meta.url);
const shipLogPath = new URL("../assets/ship-log-v3.svg", import.meta.url);
const projectLabels = new Map([
  ["tabweave", "TabWeave"],
  ["MockKit", "MockKit"],
  ["portpilot", "PortPilot"],
  ["search-mate", "Search Mate"],
  ["dom-ai-annotator", "DOM AI Annotator"],
  ["tabworks", "TabWorks"],
]);
const projects = [...projectLabels.keys()];

const headers = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "User-Agent": `${owner}-profile-updater`,
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
};

async function github(path) {
  const response = await fetch(`https://api.github.com${path}`, { headers });
  if (!response.ok) {
    throw new Error(`GitHub API ${response.status}: ${path}`);
  }
  return response.json();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function date(value) {
  return new Date(value).toISOString().slice(0, 10);
}

function activityLine(signal, entry) {
  return `<kbd>${signal.toUpperCase()}</kbd>&nbsp; <a href="${escapeHtml(entry.url)}"><strong>${escapeHtml(entry.label)}</strong></a>&nbsp; <code>${date(entry.timestamp)}</code>`;
}

function truncate(value, length) {
  const text = String(value);
  return text.length > length ? `${text.slice(0, length - 1)}…` : text;
}

function renderShipLogSvg(releaseItems, updateItems) {
  const visualReleases = releaseItems.slice(0, 2);
  while (visualReleases.length < 2) {
    visualReleases.push({
      label: visualReleases.length ? "Next release in progress" : "No releases published yet",
      timestamp: null,
    });
  }

  const releaseRows = visualReleases
    .map((entry, index) => {
      const x = 28 + index * 407;
      const entryDate = entry.timestamp ? date(entry.timestamp) : "STATUS / OPEN";
      const accentColor = index === 0 ? "#7C5CFF" : "#367BF5";
      return `<text class="sans faint" x="${x}" y="91" font-size="8.4" font-weight="750" letter-spacing="1.25">0${index + 1} / RELEASE</text>
      <circle cx="${x}" cy="112" r="3" fill="${accentColor}"/>
      <text class="sans ink" x="${x + 14}" y="117" font-size="16" font-weight="760" letter-spacing="-0.3">${escapeHtml(truncate(entry.label, 30))}</text>
      <text class="sans muted" x="${x + 14}" y="139" font-size="9.5" font-weight="650">${entryDate}</text>
      <line class="hairline" x1="${x}" y1="151.5" x2="${x + 379}" y2="151.5"/>`;
    })
    .join("\n      ");

  const visualUpdates = updateItems.slice(0, 4);
  while (visualUpdates.length < 4) {
    visualUpdates.push({ label: "Awaiting activity", timestamp: null });
  }

  const updateCells = visualUpdates
    .map((entry, index) => {
      const x = 28 + index * 203.5;
      const entryDate = entry.timestamp ? date(entry.timestamp) : "—";
      return `<text class="sans faint" x="${x}" y="182" font-size="8" font-weight="750" letter-spacing="1.1">0${index + 1}</text>
      <circle cx="${x + 1}" cy="199" r="2.75" fill="#08B8D8"/>
      <text class="sans ink" x="${x + 13}" y="202.5" font-size="10.2" font-weight="720">${escapeHtml(truncate(entry.label, 19))}</text>
      <text class="sans muted" x="${x + 13}" y="218" font-size="8.5" font-weight="620">${entryDate}</text>`;
    })
    .join("\n      ");

  return `<svg width="850" height="232" viewBox="0 0 850 232" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="title desc">
  <title id="title">Live product ship log</title>
  <desc id="desc">Two featured releases and four recently updated projects, refreshed from GitHub.</desc>
  <defs>
    <linearGradient id="accent" x1="28" y1="49" x2="822" y2="49" gradientUnits="userSpaceOnUse">
      <stop stop-color="#7C5CFF"/>
      <stop offset="0.5" stop-color="#367BF5"/>
      <stop offset="1" stop-color="#08B8D8"/>
    </linearGradient>
  </defs>
  <style>
    .canvas { fill: #F8FAFD; }
    .ink { fill: #172033; }
    .muted { fill: #728097; }
    .faint { fill: #A5B0C1; }
    .hairline { stroke: #DCE3ED; }
    .sans { font-family: -apple-system, BlinkMacSystemFont, 'Avenir Next', sans-serif; }
    @media (prefers-color-scheme: dark) {
      .canvas { fill: #080B11; }
      .ink { fill: #F3F6FB; }
      .muted { fill: #93A0B4; }
      .faint { fill: #526076; }
      .hairline { stroke: #263246; }
    }
  </style>
  <rect class="canvas" width="850" height="232" rx="24"/>
  <circle cx="30" cy="30" r="3.5" fill="#14B8A6"/>
  <text class="sans muted" x="42" y="34" font-size="9.5" font-weight="750" letter-spacing="1.7">SHIP LOG / LIVE FROM GITHUB</text>
  <text class="sans faint" x="702" y="34" font-size="8" font-weight="700" letter-spacing="1.25">GITHUB · REFRESH / 6H</text>
  <line class="hairline" x1="28" y1="48.5" x2="822" y2="48.5"/>
  <path d="M28 49H822" stroke="url(#accent)" stroke-width="2.5" stroke-linecap="round"/>
  <text class="sans muted" x="28" y="71" font-size="9" font-weight="750" letter-spacing="1.4">LATEST RELEASES</text>
  <line class="hairline" x1="421.5" y1="77" x2="421.5" y2="151"/>
  ${releaseRows}
  <text class="sans muted" x="28" y="173" font-size="9" font-weight="750" letter-spacing="1.4">RECENTLY UPDATED</text>
  <line class="hairline" x1="219.5" y1="180" x2="219.5" y2="220"/>
  <line class="hairline" x1="423.5" y1="180" x2="423.5" y2="220"/>
  <line class="hairline" x1="627.5" y1="180" x2="627.5" y2="220"/>
  ${updateCells}
</svg>
`;
}

const repositories = await Promise.all(
  projects.map((name) => github(`/repos/${owner}/${name}`)),
);

const releasesByProject = await Promise.all(
  projects.map((name) => github(`/repos/${owner}/${name}/releases?per_page=4`)),
);

const releases = releasesByProject
  .map((projectReleases, index) => {
    const release = projectReleases.find((candidate) => !candidate.draft);
    return release
      ? { ...release, projectLabel: projectLabels.get(projects[index]) }
      : null;
  })
  .filter(Boolean)
  .sort((a, b) => new Date(b.published_at) - new Date(a.published_at))
  .slice(0, 4);

const recentlyUpdated = repositories
  .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))
  .slice(0, 4);

const releaseItems = releases.map((release) => {
      const name = release.name || release.tag_name;
      const label = name.toLowerCase().includes(release.projectLabel.toLowerCase())
        ? name
        : `${release.projectLabel} ${name}`;
      return { url: release.html_url, label, timestamp: release.published_at };
    });

const updateItems = recentlyUpdated.map((repo) => ({
  url: repo.html_url,
  label: projectLabels.get(repo.name) || repo.name,
  timestamp: repo.pushed_at,
}));

const releaseLines = releaseItems.length
  ? releaseItems.map((entry) => activityLine("Release", entry))
  : ["<kbd>RELEASE</kbd>&nbsp; <strong>No releases published yet</strong>&nbsp; <code>—</code>"];

const updateLines = updateItems.map((entry) => activityLine("Updated", entry));

const shipLog = `<!-- SHIP_LOG:START -->
<p align="center">
  <img width="100%" src="./assets/ship-log-v3.svg" alt="Latest releases and recently updated projects" />
</p>

### 🔗 Release & Activity Index

<blockquote>
<p><strong>LATEST RELEASES</strong></p>
<p>
${releaseLines.join("<br>\n")}
</p>
<hr>
<p><strong>RECENTLY UPDATED</strong></p>
<p>
${updateLines.join("<br>\n")}
</p>
<p><sub>Automatically refreshed from GitHub every six hours.</sub></p>
</blockquote>
<!-- SHIP_LOG:END -->`;

const readme = await readFile(readmePath, "utf8");
const marker = /<!-- SHIP_LOG:START -->[\s\S]*?<!-- SHIP_LOG:END -->/;

if (!marker.test(readme)) {
  throw new Error("Ship log markers are missing from README.md");
}

const updated = readme.replace(marker, shipLog);
const shipLogSvg = renderShipLogSvg(releaseItems, updateItems);

if (updated !== readme) {
  await writeFile(readmePath, updated);
  console.log("Updated README ship log.");
} else {
  console.log("README ship log is already current.");
}

let existingShipLogSvg = "";
try {
  existingShipLogSvg = await readFile(shipLogPath, "utf8");
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

if (existingShipLogSvg !== shipLogSvg) {
  await writeFile(shipLogPath, shipLogSvg);
  console.log("Updated ship log visual.");
} else {
  console.log("Ship log visual is already current.");
}

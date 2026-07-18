import { readFile, writeFile } from "node:fs/promises";

const owner = process.env.PROFILE_OWNER || "zxpzdtom";
const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
const readmePath = new URL("../README.md", import.meta.url);
const shipLogPath = new URL("../assets/ship-log.svg", import.meta.url);
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

function item(url, label, timestamp) {
  return `• <a href="${escapeHtml(url)}"><strong>${escapeHtml(label)}</strong></a> — ${date(timestamp)}`;
}

function truncate(value, length) {
  const text = String(value);
  return text.length > length ? `${text.slice(0, length - 1)}…` : text;
}

function renderShipLogSvg(releaseItems, updateItems) {
  const releaseRows = (releaseItems.length
    ? releaseItems
    : [{ label: "No releases published yet", timestamp: null }]
  )
    .slice(0, 4)
    .map((entry, index) => {
      const y = 120 + index * 31;
      const entryDate = entry.timestamp ? date(entry.timestamp) : "—";
      return `<circle cx="54" cy="${y - 4}" r="4" fill="#7C5CFF"/>
      <text class="sans ink" x="68" y="${y}" font-size="12" font-weight="700">${escapeHtml(truncate(entry.label, 34))}</text>
      <text class="sans muted" x="390" y="${y}" text-anchor="end" font-size="10.5">${entryDate}</text>`;
    })
    .join("\n      ");

  const updateRows = updateItems
    .slice(0, 4)
    .map((entry, index) => {
      const y = 120 + index * 31;
      return `<circle cx="456" cy="${y - 4}" r="4" fill="#08B8D8"/>
      <text class="sans ink" x="470" y="${y}" font-size="12" font-weight="700">${escapeHtml(truncate(entry.label, 28))}</text>
      <text class="sans muted" x="792" y="${y}" text-anchor="end" font-size="10.5">${date(entry.timestamp)}</text>`;
    })
    .join("\n      ");

  return `<svg width="850" height="268" viewBox="0 0 850 268" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="title desc">
  <title id="title">Live product ship log</title>
  <desc id="desc">Latest releases and recently updated projects, refreshed from GitHub.</desc>
  <defs>
    <linearGradient id="accent" x1="32" y1="35" x2="818" y2="233" gradientUnits="userSpaceOnUse">
      <stop stop-color="#7C5CFF"/>
      <stop offset="0.5" stop-color="#367BF5"/>
      <stop offset="1" stop-color="#08B8D8"/>
    </linearGradient>
  </defs>
  <style>
    .canvas { fill: #F8FAFD; }
    .shell { fill: #E9EEF5; stroke: #D9E1EC; }
    .core { fill: #FFFFFF; stroke: #FFFFFF; }
    .ink { fill: #172033; }
    .muted { fill: #728097; }
    .hairline { stroke: #DCE3ED; }
    .sans { font-family: 'Plus Jakarta Sans', 'Avenir Next', 'Segoe UI', sans-serif; }
    @media (prefers-color-scheme: dark) {
      .canvas { fill: #080B11; }
      .shell { fill: #111722; stroke: #1D2634; }
      .core { fill: #0C111A; stroke: #18202C; }
      .ink { fill: #F3F6FB; }
      .muted { fill: #93A0B4; }
      .hairline { stroke: #263246; }
    }
  </style>
  <rect class="canvas" width="850" height="268" rx="26"/>
  <rect class="shell" x="20.5" y="20.5" width="809" height="227" rx="22"/>
  <rect class="core" x="26.5" y="26.5" width="797" height="215" rx="16"/>
  <rect x="48" y="49" width="754" height="3" rx="1.5" fill="url(#accent)"/>
  <text class="sans muted" x="48" y="76" font-size="9.5" font-weight="750" letter-spacing="1.7">LIVE PRODUCT SIGNALS / REFRESHED EVERY 6 HOURS</text>
  <line class="hairline" x1="425" y1="93" x2="425" y2="220" stroke-dasharray="2 6"/>
  <text class="sans ink" x="48" y="101" font-size="13" font-weight="750">Latest Releases</text>
  <text class="sans ink" x="450" y="101" font-size="13" font-weight="750">Recently Updated</text>
  ${releaseRows}
  ${updateRows}
  <text class="sans muted" x="802" y="229" text-anchor="end" font-size="8.5" font-weight="700" letter-spacing="1.2">SOURCE / GITHUB</text>
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
  ? releaseItems.map((entry) => item(entry.url, entry.label, entry.timestamp))
  : ["• No releases published yet"];

const updateLines = updateItems.map((entry) => item(entry.url, entry.label, entry.timestamp));

const shipLog = `<!-- SHIP_LOG:START -->
<p align="center">
  <img width="100%" src="./assets/ship-log.svg" alt="Latest releases and recently updated projects" />
</p>

<details>
<summary><strong>Release links and exact dates</strong></summary>
<br>
<strong>Latest Releases</strong><br>
${releaseLines.join("<br>\n")}

<strong>Recently Updated</strong><br>
${updateLines.join("<br>\n")}
</details>
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

import { readFile, writeFile } from "node:fs/promises";

const owner = process.env.PROFILE_OWNER || "zxpzdtom";
const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
const readmePath = new URL("../README.md", import.meta.url);
const shipLogPath = new URL("../assets/ship-log-v2.svg", import.meta.url);
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

function activityRow(signal, entry) {
  const isRelease = signal === "Release";
  const marker = isRelease ? "🟣" : "🔵";
  const channel = isRelease ? "GitHub Release" : "Repository";
  const label = escapeHtml(entry.label).replaceAll("|", "&#124;");
  return `<tr>
  <td width="18%">${marker} <strong>${signal}</strong></td>
  <td width="36%"><a href="${escapeHtml(entry.url)}"><strong>${label}</strong></a></td>
  <td width="26%">${channel}</td>
  <td width="20%" align="right"><code>${date(entry.timestamp)}</code></td>
</tr>`;
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

  const releaseCards = visualReleases
    .map((entry, index) => {
      const x = 28 + index * 401;
      const entryDate = entry.timestamp ? date(entry.timestamp) : "STATUS / OPEN";
      const accentColor = index === 0 ? "#7C5CFF" : "#367BF5";
      return `<rect class="release-shell" x="${x + 0.5}" y="81.5" width="393" height="82" rx="19"/>
      <rect class="release-core" x="${x + 5.5}" y="86.5" width="383" height="72" rx="14"/>
      <rect x="${x + 20}" y="101" width="3" height="34" rx="1.5" fill="${accentColor}"/>
      <text class="sans faint" x="${x + 366}" y="105" text-anchor="end" font-size="8.5" font-weight="750" letter-spacing="1.2">0${index + 1} / RELEASE</text>
      <text class="sans ink" x="${x + 34}" y="122" font-size="15.5" font-weight="760" letter-spacing="-0.25">${escapeHtml(truncate(entry.label, 30))}</text>
      <text class="sans muted" x="${x + 34}" y="144" font-size="9.5" font-weight="650">${entryDate}</text>`;
    })
    .join("\n      ");

  const visualUpdates = updateItems.slice(0, 4);
  while (visualUpdates.length < 4) {
    visualUpdates.push({ label: "Awaiting activity", timestamp: null });
  }

  const updateCells = visualUpdates
    .map((entry, index) => {
      const x = 52 + index * 196;
      const entryDate = entry.timestamp ? date(entry.timestamp) : "—";
      return `<circle cx="${x}" cy="216" r="3" fill="#08B8D8"/>
      <text class="sans ink" x="${x + 12}" y="219.5" font-size="10.5" font-weight="720">${escapeHtml(truncate(entry.label, 20))}</text>
      <text class="sans muted" x="${x + 12}" y="236" font-size="8.8" font-weight="620">${entryDate}</text>`;
    })
    .join("\n      ");

  return `<svg width="850" height="262" viewBox="0 0 850 262" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="title desc">
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
    .release-shell, .rail-shell { fill: #EAF0F7; stroke: #DAE3EF; }
    .release-core, .rail-core { fill: #FFFFFF; }
    .ink { fill: #172033; }
    .muted { fill: #728097; }
    .faint { fill: #A5B0C1; }
    .hairline { stroke: #DCE3ED; }
    .sans { font-family: -apple-system, BlinkMacSystemFont, 'Avenir Next', sans-serif; }
    @media (prefers-color-scheme: dark) {
      .canvas { fill: #080B11; }
      .release-shell, .rail-shell { fill: #121925; stroke: #202A39; }
      .release-core, .rail-core { fill: #0C111A; }
      .ink { fill: #F3F6FB; }
      .muted { fill: #93A0B4; }
      .faint { fill: #526076; }
      .hairline { stroke: #263246; }
    }
  </style>
  <rect class="canvas" width="850" height="262" rx="26"/>
  <circle cx="30" cy="30" r="3.5" fill="#14B8A6"/>
  <text class="sans muted" x="42" y="34" font-size="9.5" font-weight="750" letter-spacing="1.7">SHIP LOG / LIVE SIGNALS</text>
  <text class="sans faint" x="822" y="34" text-anchor="end" font-size="8.5" font-weight="700" letter-spacing="1.5">GITHUB · REFRESH / 6H</text>
  <line class="hairline" x1="28" y1="48.5" x2="822" y2="48.5"/>
  <path d="M28 49H822" stroke="url(#accent)" stroke-width="2.5" stroke-linecap="round"/>
  <text class="sans muted" x="28" y="71" font-size="9" font-weight="750" letter-spacing="1.4">LATEST RELEASES / 02</text>
  ${releaseCards}
  <text class="sans muted" x="28" y="186" font-size="9" font-weight="750" letter-spacing="1.4">RECENTLY UPDATED / 04</text>
  <rect class="rail-shell" x="27.5" y="196.5" width="795" height="50" rx="17"/>
  <rect class="rail-core" x="33.5" y="201.5" width="783" height="40" rx="12"/>
  <line class="hairline" x1="229.5" y1="207" x2="229.5" y2="237"/>
  <line class="hairline" x1="425.5" y1="207" x2="425.5" y2="237"/>
  <line class="hairline" x1="621.5" y1="207" x2="621.5" y2="237"/>
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

const activityRows = [
  ...(releaseItems.length
    ? releaseItems.map((entry) => activityRow("Release", entry))
    : [`<tr>
  <td width="18%">🟣 <strong>Release</strong></td>
  <td width="36%">No releases published yet</td>
  <td width="26%">GitHub Release</td>
  <td width="20%" align="right"><code>—</code></td>
</tr>`]),
  ...updateItems.map((entry) => activityRow("Updated", entry)),
];

const shipLog = `<!-- SHIP_LOG:START -->
<p align="center">
  <img width="100%" src="./assets/ship-log-v2.svg" alt="Latest releases and recently updated projects" />
</p>

### 🔗 Release & Activity Index

<table width="100%">
<thead>
<tr>
  <th align="left">Signal</th>
  <th align="left">Project</th>
  <th align="left">Channel</th>
  <th align="right">Exact date</th>
</tr>
</thead>
<tbody>
${activityRows.join("\n")}
</tbody>
</table>

<sub>Automatically refreshed from GitHub every six hours.</sub>
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

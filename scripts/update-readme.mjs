import { readFile, writeFile } from "node:fs/promises";

const owner = process.env.PROFILE_OWNER || "zxpzdtom";
const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
const readmePath = new URL("../README.md", import.meta.url);
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

const releaseLines = releases.length
  ? releases.map((release) => {
      const name = release.name || release.tag_name;
      const label = name.toLowerCase().includes(release.projectLabel.toLowerCase())
        ? name
        : `${release.projectLabel} ${name}`;
      return item(release.html_url, label, release.published_at);
    })
  : ["• No releases published yet"];

const updateLines = recentlyUpdated.map((repo) =>
  item(repo.html_url, projectLabels.get(repo.name) || repo.name, repo.pushed_at),
);

const shipLog = `<!-- SHIP_LOG:START -->
<strong>Latest Releases</strong><br>
${releaseLines.join("<br>\n")}

<br>

<strong>Recently Updated</strong><br>
${updateLines.join("<br>\n")}
<!-- SHIP_LOG:END -->`;

const readme = await readFile(readmePath, "utf8");
const marker = /<!-- SHIP_LOG:START -->[\s\S]*?<!-- SHIP_LOG:END -->/;

if (!marker.test(readme)) {
  throw new Error("Ship log markers are missing from README.md");
}

const updated = readme.replace(marker, shipLog);
if (updated !== readme) {
  await writeFile(readmePath, updated);
  console.log("Updated README ship log.");
} else {
  console.log("README ship log is already current.");
}

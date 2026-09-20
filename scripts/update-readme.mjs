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
  if (!response.ok) throw new Error(`GitHub API ${response.status}: ${path}`);
  return response.json();
}

function date(value) {
  return new Date(value).toISOString().slice(0, 10);
}

function link(url, label) {
  return `[${label.replaceAll("[", "\\[").replaceAll("]", "\\]")}](${encodeURI(url)})`;
}

const repositories = await Promise.all(projects.map((name) => github(`/repos/${owner}/${name}`)));
const releasesByProject = await Promise.all(
  projects.map((name) => github(`/repos/${owner}/${name}/releases?per_page=4`)),
);

const releases = releasesByProject
  .flatMap((items, index) =>
    items.filter((item) => !item.draft && item.published_at).map((item) => {
      const project = projectLabels.get(projects[index]);
      const releaseName = item.name || item.tag_name;
      return {
        label: releaseName.toLowerCase().includes(project.toLowerCase())
          ? releaseName
          : `${project} ${releaseName}`,
        url: item.html_url,
        timestamp: item.published_at,
      };
    }),
  )
  .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  .slice(0, 2);

const recentlyUpdated = repositories
  .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))
  .slice(0, 4);

const releaseLine = releases.length
  ? releases.map((item) => `${link(item.url, item.label)} <sub>${date(item.timestamp)}</sub>`).join(" · ")
  : "No releases published yet";
const updateLine = recentlyUpdated
  .map((repo) => `${link(repo.html_url, projectLabels.get(repo.name) || repo.name)} <sub>${date(repo.pushed_at)}</sub>`)
  .join(" · ");

const shipLog = `<!-- SHIP_LOG:START -->
**Latest releases:** ${releaseLine}

**Recently updated:** ${updateLine}

<sub>Refreshed from GitHub every six hours.</sub>
<!-- SHIP_LOG:END -->`;

const readme = await readFile(readmePath, "utf8");
const marker = /<!-- SHIP_LOG:START -->[\s\S]*?<!-- SHIP_LOG:END -->/;
if (!marker.test(readme)) throw new Error("Ship log markers are missing from README.md");

const updated = readme.replace(marker, shipLog);
if (updated !== readme) {
  await writeFile(readmePath, updated);
  console.log("Updated README ship log.");
} else {
  console.log("README ship log is already current.");
}

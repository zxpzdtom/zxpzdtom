import { readFile, writeFile } from "node:fs/promises";

// Short, concrete outcomes from TabWeave, PortPilot, and DOM AI Annotator.
const phrases = [
  "Keep tabs in order.",
  "Know what's using that port.",
  "Turn UI notes into action.",
];

const cycleSeconds = 12;
const secondsPerPhrase = 4;
const textX = 54;
const characterWidth = 10.8;

function escapeXml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function animationFrames(index, length) {
  const start = index * secondsPerPhrase;
  const frames = [[0, 0]];
  if (start > 0) frames.push([start, 0]);

  for (let character = 1; character <= length; character++) {
    frames.push([start + 0.12 + (1.38 * character) / length, character * characterWidth]);
  }

  frames.push([start + 3.75, length * characterWidth]);
  frames.push([start + 3.88, 0]);
  frames.push([cycleSeconds, 0]);
  return frames;
}

function animate(attribute, frames, offset = 0) {
  const values = frames.map(([, value]) => Number((value + offset).toFixed(2))).join(";");
  const keyTimes = frames.map(([time]) => Number((time / cycleSeconds).toFixed(5))).join(";");
  return `<animate attributeName="${attribute}" values="${values}" keyTimes="${keyTimes}" dur="${cycleSeconds}s" calcMode="discrete" repeatCount="indefinite"/>`;
}

function animatedLine(phrase, index) {
  const frames = animationFrames(index, phrase.length);
  const activeStart = index * secondsPerPhrase;
  const visibility = [
    [0, 0],
    [activeStart + 0.01, 1],
    [activeStart + 3.88, 0],
    [cycleSeconds, 0],
  ];

  return `<clipPath id="line-${index + 1}"><rect x="${textX}" y="56" width="${index === 0 ? (phrase.length * characterWidth).toFixed(2) : 0}" height="27">${animate("width", frames)}</rect></clipPath>
  <text class="line" x="${textX}" y="76" clip-path="url(#line-${index + 1})">${escapeXml(phrase)}</text>
  <g opacity="${index === 0 ? 1 : 0}">${animate("opacity", visibility)}<rect class="caret" x="${(textX + phrase.length * characterWidth + 2).toFixed(2)}" y="59" width="2.5" height="19" rx="1">${animate("x", frames, textX + 2)}</rect></g>`;
}

function render(animated) {
  const title = "Small tools for real workflows";
  const description = phrases.join(" ");
  const lines = animated
    ? phrases.map(animatedLine).join("\n  ")
    : `<text class="line" x="${textX}" y="76">${escapeXml(phrases[0])}</text>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="850" height="92" viewBox="0 0 850 92" role="img" aria-labelledby="title desc">
  <title id="title">${title}</title>
  <desc id="desc">${escapeXml(description)}</desc>
  <defs>
    <linearGradient id="accent" x1="28" y1="45" x2="822" y2="45" gradientUnits="userSpaceOnUse">
      <stop stop-color="#7C5CFF"/><stop offset="0.5" stop-color="#367BF5"/><stop offset="1" stop-color="#08B8D8"/>
    </linearGradient>
  </defs>
  <style>
    .canvas { fill: #F8FAFD; stroke: #DCE4EF; }
    .label { fill: #68758A; }
    .quiet { fill: #8C99AD; }
    .line { fill: #172033; font: 600 18px SFMono-Regular, Consolas, 'Liberation Mono', monospace; }
    .prompt, .caret { fill: #367BF5; }
    .meta { font-family: -apple-system, BlinkMacSystemFont, 'Avenir Next', sans-serif; }
    @media (prefers-color-scheme: dark) {
      .canvas { fill: #090D14; stroke: #263247; }
      .label { fill: #97A4B8; }
      .quiet { fill: #64748B; }
      .line { fill: #F3F6FB; }
      .prompt, .caret { fill: #70A5FF; }
    }
  </style>
  <rect class="canvas" x="0.5" y="0.5" width="849" height="91" rx="19.5"/>
  <circle cx="30" cy="25" r="3.5" fill="#14B8A6"/>
  <text class="meta label" x="42" y="29" font-size="9" font-weight="750" letter-spacing="1.5">EVERYDAY DEVELOPMENT / THREE SMALL FIXES</text>
  <text class="meta quiet" x="684" y="29" font-size="8.5" font-weight="700" letter-spacing="1.1">BROWSER · macOS · UI</text>
  <path d="M28 45H822" stroke="url(#accent)" stroke-width="2.5" stroke-linecap="round"/>
  <text class="prompt" x="28" y="76" font-family="SFMono-Regular, Consolas, 'Liberation Mono', monospace" font-size="19" font-weight="700">&gt;</text>
  ${lines}
</svg>
`;
}

let stale = false;
for (const [file, animated] of [["typing-focus.svg", true], ["typing-focus-static.svg", false]]) {
  const path = new URL(`../assets/${file}`, import.meta.url);
  const svg = render(animated);
  if (process.argv.includes("--check")) {
    if ((await readFile(path, "utf8")) !== svg) {
      console.error(`Outdated asset: ${path.pathname}`);
      stale = true;
    }
  } else {
    await writeFile(path, svg);
  }
}

if (stale) process.exitCode = 1;

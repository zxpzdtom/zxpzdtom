# Profile maintenance

The profile follows established GitHub Profile README patterns and combines widely used dynamic components with repository-owned automation.

## Dynamic components

- Header and footer: `capsule-render.vercel.app`
- Typing introduction: `readme-typing-svg.demolab.com`
- Repository cards and analytics: `github-stats-extended.vercel.app`
- Contribution streak: `streak-stats.demolab.com`
- Activity graph: `github-readme-activity-graph.vercel.app`
- Trophies: `github-profile-trophy-rust.vercel.app`
- Technology icons: `skillicons.dev`
- Badges: `img.shields.io` and `komarev.com`

The profile intentionally avoids the public `github-readme-stats.vercel.app` deployment because it returned HTTP 503 during implementation. The compatible extended deployment was verified before publishing.

## Repository-owned automation

### Ship log

`.github/workflows/update-profile.yml` runs every six hours. It calls `scripts/update-readme.mjs`, reads public repository and release data from GitHub, and replaces the section between the `SHIP_LOG` markers in `README.md`.

The tracked projects are configured in the `projects` array near the top of `scripts/update-readme.mjs`.

### Contribution snake

`.github/workflows/contribution-snake.yml` refreshes the light and dark contribution animations daily. Generated SVG files are committed to `assets/` so the animation remains under repository control.

Both workflows share the `profile-writes` concurrency group to prevent simultaneous bot pushes.

## Manual refresh

Open **Actions** and run either **Refresh profile content** or **Refresh contribution animation**.

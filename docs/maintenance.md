# Profile maintenance

The profile combines established GitHub Profile README components with two repository-owned update workflows.

## External presentation components

- Header and footer: `capsule-render.vercel.app`
- Typing introduction: `readme-typing-svg.demolab.com`
- Repository cards and language analytics: `github-stats-extended.vercel.app`
- Contribution streak: `streak-stats.demolab.com`
- Technology icons: `skillicons.dev`
- Badges: `img.shields.io`

The public `github-readme-stats.vercel.app` deployment returned HTTP 503 during implementation, so the verified compatible deployment is used for repository and language cards.

## Ship log

`.github/workflows/update-profile.yml` runs every six hours. It calls `scripts/update-readme.mjs`, reads public repository and release data from GitHub, and replaces the section between the `SHIP_LOG` markers in `README.md`.

Tracked projects are configured in the `projectLabels` map near the top of `scripts/update-readme.mjs`.

## 3D contribution calendar

`.github/workflows/profile-3d.yml` uses `yoshi389111/github-profile-3d-contrib` once a day. It writes a responsive light/dark SVG to `profile-3d-contrib/profile-3d-contrib.svg` using `profile-3d-settings.json`.

This component uses the repository's built-in `GITHUB_TOKEN`; no personal access token or third-party runtime image service is required.

Both workflows share the `profile-writes` concurrency group to prevent simultaneous bot pushes.

## Manual refresh

Open **Actions** and run either **Refresh profile content** or **Refresh 3D contribution graph**.

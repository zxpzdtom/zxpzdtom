# Profile maintenance

The profile combines established GitHub Profile README components with two repository-owned update workflows.

## External presentation components

- Header and footer: `capsule-render.vercel.app`
- Technology icons: `skillicons.dev`
- Badges: `img.shields.io`

## Featured project cards

`.github/workflows/project-cards.yml` uses `stats-organization/github-readme-stats-action` once a day to generate six repository cards in matching GitHub light and dark palettes.

Every generated card is exactly 400×140 with two reserved description lines, so the language, star, and fork rows stay aligned even when description lengths differ. The SVGs are stored in `project-cards/` and do not depend on a runtime image service.

## Ship log

`.github/workflows/update-profile.yml` runs every six hours. It calls `scripts/update-readme.mjs`, reads public repository and release data from GitHub, and replaces the section between the `SHIP_LOG` markers in `README.md`.

Tracked projects are configured in the `projectLabels` map near the top of `scripts/update-readme.mjs`.

## 3D contribution calendar

`.github/workflows/profile-3d.yml` uses `yoshi389111/github-profile-3d-contrib` once a day. It writes a responsive light/dark SVG to `profile-3d-contrib/profile-3d-contrib.svg` using `profile-3d-settings.json`.

This component uses the repository's built-in `GITHUB_TOKEN`; no personal access token or third-party runtime image service is required.

All three workflows share the `profile-writes` concurrency group to prevent simultaneous bot pushes.

## Manual refresh

Open **Actions** and run **Refresh profile content**, **Refresh featured project cards**, or **Refresh 3D contribution graph**.

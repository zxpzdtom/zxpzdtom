# Profile maintenance

This profile is designed to stay useful even when an optional external service is unavailable.

## Dynamic pieces

- `assets/github-contribution-grid-snake*.svg` is refreshed daily by `.github/workflows/contribution-snake.yml` and stored in this repository.
- GitHub profile summary cards come from `github-profile-summary-cards.vercel.app`.
- Technology icons come from `skillicons.dev`.
- Repository and release badges come from `img.shields.io`.

The custom header and contribution-animation placeholders are repository-owned assets, so the page retains its visual identity before the first workflow run or during an external outage.

## Manual refresh

Open **Actions → Refresh contribution animation → Run workflow**.

## Content refresh

When the product focus changes, update these areas together:

1. The product nodes in `assets/header-dark.svg` and `assets/header-light.svg`.
2. The cards under **Selected work** in `README.md`.
3. The pinned repositories on the GitHub profile.

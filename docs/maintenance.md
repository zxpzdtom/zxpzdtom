# Profile maintenance

The profile keeps the branded hero, product badges, contribution landscape, language icons, and Builder Map at the top. Six featured project cards and a compact ship log follow them.

The hero, Builder Map, and footer are repository-owned SVGs in `assets/`. The product badges use `img.shields.io`, and the language icons use `skillicons.dev`. The contribution landscape uses the generated SVG described below.

## Project cards

The cards are repository-owned SVG files in `project-cards/`. They have light and dark variants and do not call an image service at display time. Their copy is defined in `scripts/generate-project-cards.mjs`.

When a product description, category, or technology changes, edit that script and run:

```sh
node scripts/generate-project-cards.mjs
node scripts/generate-project-cards.mjs --check
```

The generator's descriptions are curated, not fetched from GitHub. Check each project's current README and homepage before changing its copy.

## Recent work

`.github/workflows/update-profile.yml` runs every six hours. `scripts/update-readme.mjs` reads public repository and release data from GitHub and replaces only the text between the `SHIP_LOG` markers in `README.md`. Tracked projects are configured in the `projectLabels` map.

Run **Refresh profile content** in GitHub Actions to update this section immediately. A failed API request stops the job without rewriting the README.

## Contribution calendar

`.github/workflows/profile-3d.yml` generates `profile-3d-contrib/profile-3d-contrib.svg` daily. Run **Refresh 3D contribution graph** in GitHub Actions to update it immediately.

The two workflows share the `profile-writes` concurrency group to avoid simultaneous bot pushes.

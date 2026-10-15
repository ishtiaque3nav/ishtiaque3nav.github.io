# Ishtiaque Ahmed Navid — GitHub Pages export

Original source commit: 2ef2f969e890823eb2002ba923f484fdc4e7c7cf

## Publish
1. Extract the ZIP.
2. Upload the contents of `portfolio-github-pages/` (including index.html, assets, style.css, script.js, api, and .nojekyll) into your GitHub Pages repository root. Do not upload the ZIP itself.
3. In Settings → Pages, select Deploy from a branch, your branch (usually main), and / (root).
4. Open the URL GitHub provides. Relative asset paths support both username.github.io and repository subpaths.

No build, npm installation, external image hosting, or custom domain is required for the exported page. To preview locally, run `python -m http.server 8000` in this directory and visit http://localhost:8000.

## Preservation and hosting differences
The served HTML is copied exactly from the current Site source. Original styling, responsive rules, navigation, artwork, logos, portrait, PDF CV, and animations are preserved. All 35 original public files are included without recompression. The original tracked application source is included byte-for-byte in original-source/, including package lockfile, original JavaScript, server routes, and build configuration. Git history, installed dependencies, temporary builds, and authentication credentials are excluded.

GitHub Pages is static hosting and cannot execute the original /api/scholar server route, Cloudflare R2 storage, or its unattended writer. The exported JavaScript instead reads a relative api/scholar.json snapshot: 2,808 citations, h-index 20, i10-index 29, last verified 2026-10-15T05:44:22.092Z. Its timestamp is displayed honestly as a saved snapshot. Edit this JSON to update the exported metrics. The original backend implementation remains in original-source/.

No original public asset was unavailable for export. Fonts are system fonts (Arial, Helvetica, Georgia, Times New Roman, Courier New); no third-party font binaries are bundled. Institutional marks are included as existing portfolio assets; their inclusion does not grant trademark or additional redistribution rights.

The original Site has not been edited, republished, or moved. No DNS or repository settings have been changed. An asset manifest records SHA-256 hashes of the original public files.

# GitHub Pages migration package (public files only)

Repository currently connected: `ishtiaque3nav/ishtiaque_navid.github.io`

1. Extract this ZIP and upload the **contents** of the extracted folder into the repository root (not the ZIP itself). Drag all files and the `assets` and `api` folders into GitHub’s **uploading an existing file** area. Preserve the directory paths.
2. Commit on `main` with a message such as `Publish professional portfolio`.
3. Under repository Settings > Pages, select `Deploy from a branch`, `main`, and `/(root)`; Save.
4. Given the repository's current name, the likely project-site URL is `https://ishtiaque3nav.github.io/ishtiaque_navid.github.io/`. For the cleaner root URL, rename repository to `ishtiaque3nav.github.io` (GitHub Settings > General > Repository name), then verify the Pages configuration.

All front-end assets, profile photo, CV, logos, artwork, original HTML/CSS, and static-adapted JavaScript are included. `script.js` deliberately reads the saved `api/scholar.json` metrics snapshot rather than a server-only endpoint. The original export ZIP provided separately retains `original-source/` as a private backup. Keep that backup; it is not needed to host the site and need not be posted publicly. No DNS change is needed.

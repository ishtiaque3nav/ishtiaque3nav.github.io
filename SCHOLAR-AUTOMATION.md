# Daily Google Scholar counter — setup and maintenance

This static portfolio reads `api/scholar.json` in the browser. GitHub Actions periodically fetches verified **all-time** counts via SerpAPI, saves the JSON, and deploys GitHub Pages from the same run. No credentials are embedded in frontend files.

## One-time owner actions

1. Create a SerpAPI account, copy the API key from its dashboard, and confirm your plan has search credits.
2. Visit `https://github.com/ishtiaque3nav/ishtiaque3nav.github.io/settings/secrets/actions` → **New repository secret**, name it exactly `SERPAPI_KEY`, paste your value, and save. Never post it in the repository, Issues, or ChatGPT.
3. Visit repository **Settings → Pages → Build and deployment → Source** and select **GitHub Actions** (not Deploy from a branch). The existing `.github/workflows/update-scholar.yml` is the publisher; do **not** generate another template workflow.
4. Check repository **Settings → Actions → General**: Actions must be enabled. The custom workflow needs `contents: write` for updating the JSON and `pages: write`/`id-token: write` for deployment. If a run shows a push-permission failure, enable **Workflow permissions → Read and write permissions** where your account permits it.
5. Visit **Actions → Portfolio and daily Scholar refresh → Run workflow → Branch: main → Run workflow**. Confirm that the **Fetch and verify daily Scholar metrics**, **Commit verified metrics**, and **Publish GitHub Pages** steps are green.
6. Open `https://ishtiaque3nav.github.io/#publications` and confirm the last-verified timestamp changes to the time of the successful run. Check the new `api/scholar.json` commit in `main`.

## Operating behavior

- Scheduled at `13:17 UTC` each day. GitHub can delay scheduled jobs; runs may be disabled by GitHub for inactivity and may need re-enabling.
- Pushes to `main` deploy the site without consuming SerpAPI searches. Manual runs and scheduled runs verify metrics first, then deploy. A JSON commit made with `GITHUB_TOKEN` does not start another workflow, so the running job deploys the artifact itself.
- Failures and unexpected API responses stop the run **before editing the snapshot**; the previous live numbers remain available. Inspect Actions logs, subscription/search credits and the `SERPAPI_KEY` secret, then use **Run workflow** to retry.
- `lastAttemptOk` becomes true only after the first successful verified API call. The browser displays a delay/pending notice if the timestamp is old. It refreshes the published JSON every 15 minutes when visible, but this does not make a new Scholar API call from a visitor's browser.
- For offline tests: `python -m unittest discover -s tests -v` and `python scripts/update_scholar.py --check-file`. Neither requires a secret nor consumes API credits.

Source: `https://scholar.google.com/citations?user=oIF2HdcAAAAJ&hl=en`. The counts belong to the profile returned for that author ID; they are not guaranteed to change daily. Do not publish the API key or a screenshot of it.

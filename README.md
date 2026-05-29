# cloud-devops-portfolio — Netlify deployment notes

This repository contains a static portfolio site. The project is prepared for Netlify deployment and includes a GitHub Actions workflow that triggers automated deployments.

Setup steps
- Create a Netlify site and note your `Site ID`.
- In the GitHub repository, add the following secrets: `NETLIFY_AUTH_TOKEN` (personal access token) and `NETLIFY_SITE_ID`.
- On Netlify, set the build settings: `Publish directory` -> `.` and `Functions directory` -> `netlify/functions` (these are also configured in `netlify.toml`).

Contact form
- The contact form uses Netlify Forms and is submitted via AJAX for a realtime UX. Submissions will appear in the Netlify Site dashboard under `Forms`.

CI/CD
- The GitHub Action `.github/workflows/netlify-deploy.yml` deploys on push to `main` or `master` using `netlify-cli`.

Environment variables (Netlify)
- `SENDGRID_API_KEY`: API key for SendGrid (used by the Netlify Function to send email).
- `TO_EMAIL`: Destination address to receive contact messages.
- `FROM_EMAIL` (optional): Verified sender address to use with SendGrid; defaults to `TO_EMAIL` if not set.

Set these in the Netlify site's Environment variables settings (Site settings → Build & deploy → Environment).

GitHub repository secrets (recommended)
- `NETLIFY_AUTH_TOKEN` — Netlify personal access token used by the deploy action.
- `NETLIFY_SITE_ID` — Your Netlify Site ID.
- `SLACK_WEBHOOK_URL` (optional) — Incoming webhook URL for Slack notifications.

Set secrets using GitHub UI or the GitHub CLI. Example (with `gh`):

```bash
gh secret set NETLIFY_AUTH_TOKEN --body "<your-token>"
gh secret set NETLIFY_SITE_ID --body "<your-site-id>"
gh secret set SLACK_WEBHOOK_URL --body "<your-slack-webhook>"  # optional
```

Local linting & tests
- Install dependencies and run the HTML linter:

```bash
npm ci
npm run lint
```

Test Netlify functions locally:

```bash
# start local dev server
npx netlify dev
```

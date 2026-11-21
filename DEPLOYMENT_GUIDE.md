# Deploying Open Research Nexus

It runs the same way as the Hangman game: **Render** hosts it, and the portfolio on
**Vercel** proxies a path to it.

```
harshitha-upadhyayula.vercel.app/research  ──(Vercel rewrite)──►  open-research-nexus.onrender.com/research   (static React site)
                                                                         │
                                                         browser calls   ▼
                                                  open-research-nexus-api.onrender.com/api/*                (Flask → Groq + OpenAlex)
Firebase (research-e9734): Auth, Firestore, Storage — called directly from the browser.
```

## 1. Two free API keys
- **Groq** (drafting, review, summaries): <https://console.groq.com/keys>. No card needed.
- **OpenAlex** (real papers for Find): create an account at <https://openalex.org>, then copy the key
  from Settings → API. The free allowance is $1/day of usage, roughly 1,000 searches.

Keep both out of git — Render asks for them. The same Groq key also powers **dictation**
(Whisper speech-to-text). The Stories sources — Open Library, Project Gutenberg (via Gutendex)
and Datamuse — need no keys.

Why these: Groq's free tier gives about 1,000 requests a day on an open model, and Groq says it doesn't
retain prompts by default. Gemini's free tier now allows only a handful of requests a day, Google uses
free-tier prompts to improve its products (not great for unpublished drafts), and search grounding
isn't free. OpenAlex makes Find return papers that exist, with DOIs, instead of model-generated
references. To use Gemini anyway, set `GEMINI_API_KEY` instead of `GROQ_API_KEY` and add
`google-genai` to `backend/requirements.txt`.

## 2. Render (one time)
1. Render → **New → Blueprint** → pick `U-Harshitha/Open-Research-Platform` → branch `main`.
2. It reads `render.yaml` and shows two services. Paste the keys into `GROQ_API_KEY` and `OPENALEX_API_KEY`.
3. **Apply**. The first deploy takes a few minutes.
4. Check the static site's URL in the dashboard. If it is not exactly
   `https://open-research-nexus.onrender.com` (Render adds a suffix when a name is taken):
   - update the second entry of `ALLOWED_ORIGINS` on the API service, and
   - update both `destination` hosts in the portfolio's `vercel.json`.

Every push to `main` redeploys whichever service changed (`buildFilter` in `render.yaml`).

The API is on Render's free plan, so it sleeps after ~15 minutes idle. The workspace pings it
when the assistant panel opens; the first AI request after a quiet spell can take up to a minute.

## 3. Firebase (one time)
Firebase stays on the free **Spark** plan for Auth and Firestore. File **uploads** use Cloud Storage,
which Google now only enables on the pay-as-you-go **Blaze** plan (it still has a free allowance;
set a budget alert). Without Blaze, uploads fail but linking files (Zenodo, OSF, GitHub) works.

In the [Firebase console](https://console.firebase.google.com/project/research-e9734):
- **Authentication → Settings → Authorized domains**: add
  `harshitha-upadhyayula.vercel.app` and `open-research-nexus.onrender.com`.
  Without this, Google sign-in fails with `auth/unauthorized-domain`.
- **Authentication → Sign-in method**: enable **Google** and **Email/Password**.
  Enable **Anonymous** too if you want “Try it as a guest” to create real accounts
  (otherwise guests get a local demo session saved in their browser).
- Deploy the database rules and indexes from this repo (again after this update — project chat
  needs the new `messages` rule and index):
  ```bash
  npx firebase-tools deploy --only firestore:rules,firestore:indexes --project research-e9734
  ```

## 4. Portfolio
Merge the portfolio PR that adds the `/research` rewrites to `vercel.json`. Vercel redeploys on merge.

## Check it
- `https://open-research-nexus-api.onrender.com/api/health` → `"provider": "groq"`
- `https://open-research-nexus.onrender.com/research/` → the site
- `https://harshitha-upadhyayula.vercel.app/research` → the same site, through the portfolio

## Environment variables

| Service | Variable | Purpose |
|---|---|---|
| static | `VITE_BASE_PATH` | Sub-path the app lives under (default `/research/`) |
| static | `VITE_API_URL` | API URL; Render fills in the API's service name automatically |
| static | `VITE_PORTFOLIO_URL` | “Back to the portfolio” links |
| api | `GROQ_API_KEY` | Secret, entered in Render |
| api | `GROQ_MODEL` | Default `openai/gpt-oss-120b`; any Groq chat model ID works |
| api | `OPENALEX_API_KEY` | Secret, entered in Render |
| api | `GEMINI_API_KEY`, `GEMINI_MODEL` | Optional alternative to Groq |
| api | `ALLOWED_ORIGINS` | Browser origins allowed by CORS |
| api | `FIREBASE_*` | Optional; only used to log searches |

## Alternative: Firebase Hosting
`firebase.json` also serves the build at `https://research-e9734.web.app/research/`
(`./deploy.sh`). If you use it, point the portfolio rewrites there instead and set
`VITE_API_URL` before building.

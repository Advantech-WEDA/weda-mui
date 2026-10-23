# WEDA UI Boilerplate

The official source release of the WEDA frontend — the management console for
the WEDA platform (organizations, devices, container stacks, registries,
members, client credentials, and AI model management).

> This repository contains official WEDA frontend source releases. External
> pull requests and code contributions are not accepted.

This repository does not include a backend. You must bring your own
compatible WEDA backend and identity/login environment — no mock backend,
test account, or hosted environment is provided here.

## Backend compatibility

This frontend requires a WEDA backend, but compatibility between a given
frontend release and a given backend version is not guaranteed. Check the
[official WEDA documentation](https://learn.advantech.com/weda/docs/Introduction)
for supported version combinations before you deploy.

## Requirements

- Node.js `>= 22.21.1` (see `engines` in `package.json`)
- A running, compatible WEDA backend (see above) reachable over HTTPS

## Getting started

```bash
npm install
cp .env.example .env   # then set VITE_ORIGIN and VITE_AUTH_CLIENT_ID
npm run dev             # http://localhost:9001
```

`npm run dev` proxies `/platform`, `/central/portal/api`, `/central/weda/api`
and `/api` to the backend named by `VITE_ORIGIN` (in `authcode` mode also
`/identity/connect/token` — see "Login and backend requirements"). Without
`VITE_ORIGIN` set, `npm run dev` stops immediately and tells you what to do,
instead of letting the proxy fail with an opaque connection error.

Other commands:

```bash
npm run verify     # lint + typecheck + build — run this after making changes
npm run lint       # eslint . && stylelint src/**/*.scss
npm run typecheck  # tsc -b
npm run build      # vite build (type checking lives in `typecheck`, not in the build)
npm run preview    # preview the production build
```

## Configuration

Two independent configuration mechanisms — don't mix them up:

- **`.env` / `VITE_ORIGIN`** (dev-server-only, build-time): the backend origin
  the **dev server** proxies to. Copy it from `.env.example`. It is only read
  by `vite.config.ts`'s dev proxy and, on a `localhost` origin, by application
  code that needs to reach the backend directly. A deployed build never runs
  on a `localhost` origin, so `npm run build` does not need it set — only
  `npm run dev` does. `VITE_AUTH_MODE` and `VITE_AUTH_CLIENT_ID` are
  dev-only too: they choose how `npm run dev` signs in (see below), and a
  production build ignores them.
- **`public/runtime-config.js` / `window.__ENV__`** (runtime, deploy-time):
  sets `tenantType` (`'singleTenant'` or `'saas'`, default `'singleTenant'`).
  It is loaded by `index.html` before the app script, so any static host can
  replace this one file per environment at deploy time — no server-side
  templating is required. Always read it through
  `src/shared/config/runtimeEnv.ts`, never `window.__ENV__` directly.

Multi-tenant routing is path-based: routes live under `/:tenant/weda/...`, and
`tenant` is read from the first path segment. This is a different thing from
`tenantType` above (single-tenant vs. SaaS), which comes from the runtime
config, not the URL. The fixed WEDA route topology is application code in
`src/shared/lib/appRoute.ts`, not deployment configuration.

## Login and backend requirements

How the frontend signs in depends on where it runs.

### Deployed builds: the Portal's shared cookie

An unauthenticated user is sent to `/{tenant}/portal/login`; after the OIDC
sign-in the session cookie is set on the backend's domain, and the frontend
exchanges it for its WEDA token at `POST /{tenant}/weda/api/v1/auth/tokens`
(every request is sent `withCredentials: true`). Apart from the login and
logout pages and the header's app grid, the frontend calls only WEDA APIs. For
this to work, your backend/identity provider must be configured to:

- Serve over HTTPS in any non-`localhost` environment (cookie-based sessions
  require it).
- Allow cross-origin requests with credentials from the origin this frontend
  is hosted on, if the frontend and backend are not served from the same
  origin.
- Redirect back to this frontend's login callback after a successful sign-in.

### `npm run dev`: Authorization Code + PKCE

The browser only sends the Portal's cookie to the backend's domain, never to
`localhost`, so `npm run dev` cannot use it. With `VITE_AUTH_MODE=authcode` in
`.env` (what `.env.example` sets), the app instead signs in as a public
Authorization Code + PKCE client of `<VITE_ORIGIN>/identity` and exchanges
that access token for its WEDA token. This needs:

- An identity server that lets you register a public Authorization Code client
  with PKCE. With desk-identity that is
  `POST /identity/api/v1.0/external/authcode-clients`, called with a token
  that has the `client:authcode:management` scope.
- A client registered with exactly these values — the identity server compares
  them character for character, and without the post-logout URI, Sign out ends
  on the identity server's error page:

  | Field                    | Value                                 |
  | ------------------------ | ------------------------------------- |
  | `clientType`             | `public`                              |
  | `domain`                 | `http://localhost:9001`               |
  | `redirectUris`           | `http://localhost:9001/auth/callback` |
  | `postLogoutRedirectUris` | `http://localhost:9001/`              |

- `VITE_AUTH_CLIENT_ID` set to that client's id (a public client has no
  secret).
- A WEDA backend whose `POST /{tenant}/weda/api/v1/auth/tokens` accepts the
  identity server's access token as a Bearer token.

The registered URIs name port 9001, so in this mode the dev server refuses to
start on any other port. The header hides the app grid and the tenant switch,
which are Portal features. Set `VITE_AUTH_MODE=cookie` (the default when
unset) to use the deployed login instead; on `localhost` that only works if
the Portal's cookie has been put there by other means.

A production build ignores both values: the check is gated on
`import.meta.env.DEV`, so `vite build` leaves the authcode code out and a
deployed build always uses the shared cookie.

## Deployment

This repository only produces the static build (`npm run build` → `dist/`).
Any static file host works, provided it:

- Serves `index.html` for any unmatched route (SPA fallback) — this is a
  client-side-routed single-page app.
- Allows `public/runtime-config.js` to be replaced per environment at deploy
  time (see "Configuration" above).

A reverse proxy / gateway in front of the static host is responsible for
routing backend API paths (`/platform`, `/central/portal/api`,
`/central/weda/api`, `/api`) to your WEDA backend; this repository does not
include that proxy or a backend-for-frontend.

The same gateway must strip the `/{tenant}/weda` prefix before passing all
other requests to the static host (for example `/central/weda/assets/app.js`
→ `/assets/app.js`). Without it, every page loads blank. `npm run preview`
does not strip the prefix, so app pages are blank there.

## Official support scope and known limitations

- This release does not include a backend-for-frontend (BFF) or any server
  component — it is frontend source only.
- External pull requests and code contributions are not accepted.
- Compatibility with a specific WEDA backend version is not guaranteed — see
  "Backend compatibility".

## Security

To report a security vulnerability, see [`SECURITY.md`](./SECURITY.md) for
private reporting instructions. Please do not open a public issue for
security reports.

## License

This project is licensed under the MIT License — see [`LICENSE`](./LICENSE).

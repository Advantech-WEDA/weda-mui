# Architecture

A one-page tour: the three layers, the rules each layer lives by, and the
standard flow for adding a feature.

## The three layers

```
src/
├─ app/                 # entry point, router table, providers, layout shells — assembly only
├─ features/<name>/     # vertical slices: devices, container-stacks, registries, organizations,
│                        # members, client-credentials, ai-models, home
│  ├─ domain/           # pure types / business rules — zero React, store or UI dependency
│  ├─ api/              # HTTP calls + DTO types + DTO→domain mapping
│  ├─ store/            # Zustand — only when client state must be shared across pages
│  ├─ hooks/            # use<X>Page() — page orchestration; returns domain-shaped data and callbacks
│  ├─ components/       # pure views, props-in
│  ├─ pages/            # route entry points — wire a hook to a view, nothing else
│  └─ index.ts          # public API — the ONLY thing other features may import from this one
└─ shared/
   ├─ api/              # axiosInstance, apiPath(), extractErrorMessage()
   ├─ auth/             # npm run dev sign-in: Authorization Code + PKCE (VITE_AUTH_MODE=authcode)
   ├─ config/           # runtime env access
   ├─ lib/               # appRoute, baseUrl, dayjs and other cross-feature utilities
   ├─ session/          # useIAmStore, useProfileStore, org context — platform-level state
   └─ ui/                # cross-feature design-system components; its index.ts is the public way in
```

Dependencies run one way, always: `app → features → shared`. `shared` may never
import anything from `features` or `app`; features may depend on each other, but
only through the other feature's `index.ts`.

## What each layer may and may not do

| Layer | What belongs here | What it must not do |
|---|---|---|
| `domain/` | Pure types, business-rule functions, constants | No React hooks, no store, no `@mui/*`, no `components/` or `pages/` |
| `api/` | HTTP calls (`axiosInstance` + `apiPath()`), DTO types, DTO→domain mapping | No UI; like `domain/`, it may not depend on the view layer |
| `store/` | Zustand state plus orchestration across actions (calling `api/`, triggering side effects) | Not every feature needs one — a simple list/form page can let `hooks/` call `api/` directly |
| `hooks/` | One `use<X>Page()` per route, using `useState`/`useEffect` internally, exposing only domain-shaped values and `onXxx` callbacks | It may not return raw UI event types (`React.ChangeEvent`, MUI's `SelectChangeEvent`); the event → value conversion stays in the calling view |
| `components/` | Pure views, with all data and behaviour arriving as props — plus **presentation constants only this component uses** (table column definitions, view model builders, label maps) | No business logic, no direct store or api calls |
| `pages/` | Call the matching `use<X>Page()` and hand its return value to the view | No `useState`/`useEffect`; no data transformation |

Two clarifications:

- **Presentation constants follow the same rule as styles: they live beside the
  component that owns them.** A table's column definitions sit next to the table
  that uses them (`components/XxxTable.columns.ts`); a view model containing
  `ReactNode` sits next to the component that renders it (existing example:
  `devices/components/Detail/Information/mapper.ts`). This is the same principle
  as the SCSS co-location in the next section, which is why there is no `view/`
  layer here — and why you should not add one. Colour, on the other hand, does
  not belong to a feature at all: a status's appearance is decided by
  `shared/ui`'s semantic tones. A feature says "this status means success", never
  "this status is #2E7D32".
- **A complex multi-tab route may split into sub-hooks.** "One `use<X>Page()` per
  route" describes the interface a page gets, not a demand that six tabs' worth
  of orchestration be crammed into one file. Splitting out `use<X><Tab>()`
  sub-hooks keeps the dependency direction unchanged (hooks → store/api; the view
  stays props-in) and lets each tab be read and tested on its own.

  **Who calls the sub-hook depends on whether that data belongs to one tab**, and
  this choice changes behaviour:
  - **Tab-specific** (a fetch, a polling timer, search/pagination state used by
    this tab alone) → keep it next to the tab, called by a five-line container
    component, with the view still purely props-in. `DetailPageLayout` mounts only
    the tab currently selected: hoisting the hook to the route hook would keep it
    issuing requests and running timers while you are on a different tab, and
    would leave tab state behind across switches instead of clearing it on
    unmount. Example: `devices/hooks/useDeviceTelemetryTab.ts` with
    `devices/components/Detail/Telemetry/{Index,TelemetryView}.tsx`.
  - **Shared by the whole route** (loaded on entry, read by every tab) → put it
    straight in the route hook; no container needed. Example:
    `devices/hooks/useDeviceDetailPage.ts` loads, in one place, what all five tabs
    need.

  The container imports the hook rather than a store or api module, so the
  `components/**` rule still holds.

These rules are enforced today by `no-restricted-imports` and
`eslint-plugin-boundaries` (`boundaries/dependencies`, set to `error`) in
`eslint.config.js` — they are not a gentlemen's agreement. `shared/ui` is treated
like a feature: its `index.ts` is the only way in, and reaching into
`@shared/ui/<file>` is blocked.

## Where SCSS goes

Style files are co-located with whoever owns them rather than gathered into one
global folder. Decide in this order:

1. **Truly global, with no awareness of any feature** (design tokens, theme,
   reset) → `app/styles/`, loaded exactly once by `app/main.tsx`
   (`app/styles/global.scss`).
2. **Shared across features, with a clear owning component** → put the stylesheet
   beside that component and let the component import it as a side effect (e.g.
   `ConfirmDialog.scss` next to `shared/ui/ConfirmDialog.tsx`, via
   `import './ConfirmDialog.scss'`).
3. **Shared across features, but genuinely owned by nothing** (the historical
   residue of several features copy-pasting the same class names) →
   `shared/styles/legacy/`, with a note at the top of the file saying this is
   debt and new code should not imitate it. Do not bolt it onto some component
   just to make it look owned.
4. **Feature-specific** → beside the `pages/`/`components/` file that owns it,
   again imported by that file; do not collect them into one feature-level file
   that belongs to no component.

Styles are always plain global class names imported as side effects
(`import './Foo.scss'`), **not** CSS Modules — the same class name in a different
file still applies, so before adding styles check whether that class name is
already defined elsewhere. ESLint does not check the contents of `.scss` files,
but the `import './Foo.scss'` line inside a `.tsx` file is checked by
`eslint-plugin-boundaries` like any other import, which means a component in
feature A cannot import feature B's `.scss` (unless it goes through `shared/`).
That rule has already caught one real copy-paste mistake. Separately,
`eslint.config.js` has a `no-restricted-imports` entry blocking
`@/assets/scss/**`, so styles cannot drift back into a global folder unrelated to
any component.

## The standard flow for adding a feature

1. Create `src/features/<name>/` with the directories above (`store/` only if
   needed).
2. Define the feature's core types in `domain/types.ts` first.
3. Write the HTTP calls in `api/<name>.api.ts`, returning types that match
   `domain/` (or the DTO directly, depending on how much they differ).
4. Add `store/` **only** if there is client state shared across pages; otherwise
   `hooks/` calls `api/` directly.
5. Write one `hooks/use<X>Page.ts` per route: `useState`/`useEffect` inside, data
   and `handleXxx` callbacks out.
6. Write pure views in `components/`, and let `pages/` connect the hook to the
   view.
7. Export only the page components the router needs from `index.ts`; list
   separately, and explicitly, any type or store another feature needs.
8. Register the route in `app/router/index.tsx`, importing through `index.ts`.

`src/features/registries/` is the worked example of all eight steps — this
project's **reference feature**. Why it was chosen, and the blemishes it
knowingly keeps, are documented at the top of that feature's `index.ts`; the
file-by-file reading order is in README's "30-minute tour of the architecture".

### Self-check before submitting

Lint catches most violations. These are the ones it cannot, so check them
yourself:

- [ ] **No colour in `domain/`.** A status's appearance is decided by
      `shared/ui`'s tones: `AppChip` takes `tone="success"`, not
      `{ color: 'var(--success-main, #2E7D32)' }`. Domain only answers what the
      status *means*.
- [ ] **`domain/` does not import DTO types from `api/`.** A DTO is transport;
      the conversion belongs in `api/`, and domain defines its own entities. The
      other way round lets a renamed backend field punch straight through into
      business rules.
- [ ] **Does this `store/` really have cross-page sharing?** The test: is there
      state that page A writes and page B reads? If every hook just fetches for
      its own use, you do not need a store — `hooks/` can call `api/` directly.
      Another store is another piece of state to keep in sync.
- [ ] **Can the view understand what the route hook returns?** It should be
      `{ rows, isLoading, onSearchChange(value: string) }` — not a store setter,
      an Axios response, a TUS object, or a React event.
- [ ] **Can `components/` render from props alone?** No `useXxxStore()` inside a
      component, and no importing `api/`.
- [ ] **Has "can this status do X" scattered into literal comparisons?** Once a
      check like `status === 'Deactivated'` appears in a second file, it should
      become a named function in `domain/` (example:
      `devices/domain/devicePolicy.ts`). The test is not "how many places" but
      "when a new status is added, do I have to grep to find them all". The
      converse matters too — **do not collapse everything**: if two comparisons
      that look alike would answer differently for an unknown status, they are
      two questions, and merging them quietly changes behaviour.
- [ ] **Does `index.ts` export anything merely for convenience?** Export what
      another feature needs, nothing more — do not throw a whole store over the
      wall. Once exported, the store's shape becomes a cross-feature interface.
- [ ] **Is there a question hiding inside this `useEffect` or callback that could
      be answered on its own?** The test is not how long it is, but what its
      branches are deciding. A chain like
      `if (has pending file) … else if (status === 'Pending' && size != null) … else …`
      is a decision; extract it into a pure function in `domain/` (example:
      `decideUploadBootstrap` in `ai-models/domain/uploadLifecycle.ts`) and
      "what happens if I reload mid-upload" becomes a test instead of a manual
      experiment. **Extract the judgement only and leave the side effects where
      they are** — afterwards the call site usually grows one or two extra `&&`
      type guards, which are there to narrow types for tsc, not because the
      decision might disagree with itself.
- [ ] `npm run verify` passes.

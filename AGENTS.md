# Dashni — Project Conventions

## Semantic Versioning (SemVer)

Version every release as `MAJOR.MINOR.PATCH` (https://semver.org):

- **MAJOR** — incompatible/breaking changes (removed or changed API endpoints,
  changed request/response shapes, DB migrations that drop or rename columns,
  breaking config/env changes).
- **MINOR** — new functionality added in a backward-compatible way (new endpoint,
  new page/component, new optional field).
- **PATCH** — backward-compatible bug fixes only.

Rules:
- **`frontend` and `backend` version independently.** Each package's `version`
  field in its own `package.json` is the source of truth, bumped only for
  changes to that package. (Currently: `backend` is `1.0.0`, `frontend` is
  `0.0.0`.) Bump in the same PR as the change that warrants it — never separately
  after the fact.
- Tag each release in git with a package-scoped tag: `backend-vMAJOR.MINOR.PATCH`
  and `frontend-vMAJOR.MINOR.PATCH` (e.g. `backend-v1.1.0`), on the deployed
  commit.
- Pre-1.0 (`0.y.z`, e.g. the current `frontend`): treat `MINOR` as the
  breaking-change slot and `PATCH` for everything else.
- A breaking DB change must ship with a migration and be called out in the PR
  description.

## Development Best Practices

- **Branch + PR, never push to `main` directly.** `main` is auto-deployed by
  `.github/workflows/build-and-deploy.yml`; every change reaches production
  through a reviewed PR.
- **Conventional Commits** for commit messages: `type(scope): subject`
  (`feat`, `fix`, `chore`, `refactor`, `docs`, `test`). `feat` → MINOR,
  `fix` → PATCH, `feat!`/`fix!` or a `BREAKING CHANGE:` footer → MAJOR.
- **No secrets in code or git.** All secrets come from env files / GitHub
  Actions secrets. Credentials, keys, and `.env*` files must stay untracked.
- **Validate and handle errors at boundaries.** API controllers validate input
  and return meaningful status codes; frontend network calls handle the failure
  path (loading/error state), as the existing components already do.
- **Keep changes small and focused.** One logical change per PR; split unrelated
  refactors out.
- **Don't leave dead code or commented-out blocks** in merged code. Remove it,
  or gate it behind a flag — git history is the backup.
- **Lint and build before opening a PR:** in `frontend`, run `npm run build`
  (`vite build`) and `npm run lint` (eslint, `--max-warnings 0`); in `backend`,
  confirm the server starts cleanly with `npm run dev`. (Backend has no lint or
  build script yet — add one before relying on it in CI.)

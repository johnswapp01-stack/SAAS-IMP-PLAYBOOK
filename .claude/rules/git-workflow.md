# git-workflow.md

## Conventional Commits
All commit messages follow the Conventional Commits spec:

```
<type>(<scope>): <short description>

[optional body]

[optional footer: BREAKING CHANGE, closes #issue]
```

**Types:**
- `feat` — new feature
- `fix` — bug fix
- `chore` — build, tooling, dependency updates
- `refactor` — code change that neither fixes a bug nor adds a feature
- `style` — formatting, whitespace (no logic change)
- `test` — adding or updating tests
- `docs` — documentation only
- `perf` — performance improvement

**Scopes (common):** `auth`, `engagements`, `templates`, `agents`, `billing`, `db`, `api`, `ui`

Examples:
```
feat(engagements): add go-live health status indicator
fix(auth): resolve session refresh loop on token expiry
chore(deps): upgrade @supabase/supabase-js to 2.102.0
refactor(templates): extract shared DocxTemplate base component
```

## Branch Naming
```
feat/<short-description>       # new feature
fix/<short-description>        # bug fix
chore/<short-description>      # maintenance
refactor/<short-description>   # refactoring
```
Use kebab-case. No spaces, no special characters.

Examples:
- `feat/lessons-learned-export`
- `fix/scope-change-form-validation`
- `chore/upgrade-stripe-sdk`

## Commit Discipline
- One logical change per commit. Don't batch unrelated changes.
- Never commit directly to `main`. Always branch, then PR or merge.
- Stage specific files — don't `git add .` blindly. `package-lock.json` commits alongside `package.json` only when deps changed.
- Never commit `.env`, `.env.local`, or any file containing secrets.
- Run `npm run lint` and `npm run build` before pushing. Broken builds don't ship.

## .gitignore Essentials (verify these are present)
- `.env.local`
- `.env*.local`
- `.next/`
- `node_modules/`
- `tsconfig.tsbuildinfo`

# Contributing to dotagents

Thanks for wanting to help. This repo is a shared home for **skills**, **hooks**, and
**extensions** used by [Claude Code](https://github.com/anthropics/claude-code) and
[pi](https://github.com/earendil-works/pi). The most useful contribution is usually a new
skill that others can drop straight into their setup.

## Quick start

```bash
git clone https://github.com/therapys/dotagents.git
cd dotagents
npm run check        # runs the skill validator + tests
```

There are no runtime dependencies — everything runs on Node 18+ out of the box.

## Adding a skill

A skill is one folder under `skills/` with a `SKILL.md` file. Both tools load it by its
frontmatter, so the frontmatter is the contract.

```
skills/
  your-skill-name/
    SKILL.md          # required — name + description frontmatter, then the guide
    scripts/          # optional — deterministic helpers the skill calls
    references/       # optional — deep-dive docs loaded on demand
```

`SKILL.md` must start with YAML frontmatter:

```markdown
---
name: your-skill-name
description: One or two sentences. Say what it does AND when to use it — this text is
  how the model decides to load the skill, so include the trigger words a user would say.
---

# Your Skill Name

The actual guide goes here…
```

Rules the validator enforces (`npm run validate`):

- `name` matches the folder name and is `kebab-case`.
- `description` is present and at least 20 characters.
- A description over 1500 characters gets a warning — run `/compress-skills` to trim it
  without losing behavior.

Tips for a skill that gets used:

- **Front-load the triggers.** The description is a search target. Include the phrases a
  user would actually type.
- **Keep it portable.** No company names, secrets, private endpoints, or machine-specific
  paths. See [`claude/rules/public-artifacts.md`](claude/rules/public-artifacts.md) and
  [SECURITY.md](SECURITY.md). Private, project-specific skills stay local via `.gitignore`.
- **Prefer deterministic scripts** for counting, parsing, or validating; leave judgment to
  the model. The `flesch-kincaid-proofreader` skill is a good template — a script plus tests.

## Before you open a PR

```bash
npm run check   # validate skills + run tests — CI runs the same thing
```

Commits follow [Conventional Commits](https://www.conventionalcommits.org/)
(`feat(skills): add …`, `fix(cli): …`, `docs: …`). If you use Claude Code, the `commit`
skill in this repo writes them for you.

## Reporting bugs and proposing skills

Open an issue using one of the [templates](.github/ISSUE_TEMPLATE). For anything that
looks like a leaked secret or a security problem, follow [SECURITY.md](SECURITY.md)
instead of filing a public issue.

By contributing, you agree that your work is licensed under the repo's
[MIT License](LICENSE).

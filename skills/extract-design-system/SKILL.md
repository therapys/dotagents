---
name: extract-design-system
description: "Reverse-engineer a project's real, shipped design language into a reusable design skill, so any agent can build or restyle pages that match it. Use when the user says 'create a design skill from this project', 'make a design skill from the current project', 'extract the design system', 'capture this app's design as a skill', 'codify our design language', or 'reverse-engineer the design system into a SKILL.md'."
---

# Extract Design System

Turn a codebase's **actual, shipped** design language into a reusable skill. The output is a
new `SKILL.md` — a tight rules + workflow + pitfalls guide — that lets any agent restyle or
build pages that look like they belong in this app. Ground **everything** in the real code
and the rendered UI. Never invent tokens; a design system you can't point to in the tree is
a guess.

This is the generator that produces a design skill. It is not `frontend` (which invents a
new aesthetic) — here the aesthetic already exists and your job is to codify it faithfully.

## Steps

1. **Read the tokens — don't guess.** Find where design decisions actually live:
   - *Config tokens:* Tailwind config (`theme.extend` — colors, `fontFamily`, `borderRadius`,
     `boxShadow`, spacing), CSS custom properties (`:root`, `@theme`, `data-theme`), SCSS/LESS
     variables, or a `tokens.*` / `theme.*` file.
   - *Typography:* font loading (`next/font`, `@font-face`, `<link>`), families, weights, the
     type scale, and any display/accent face used differently from body.
   - *Color & theming:* the palette and the **semantic** names layered on it (`background`,
     `surface`, `muted`, `accent`, `border`), plus the dark-mode strategy (class vs
     `prefers-color-scheme`) and how token pairs flip.
   - *Scales:* the real radius, spacing, shadow, and border values in use — and which size
     maps to which kind of element (control vs card vs sheet).
   - *Components:* open the base primitives (`Button`, `Card`, `Input`, layout shell). Note
     default radii, whether surfaces use borders / shadows / tone, and the variant set.
   - *Motion & atmosphere:* transition durations/easings, hover/active patterns,
     `prefers-reduced-motion` handling, and any grain, gradient, glow, or background wash.
2. **See it, don't just read it.** Run the app (or open Storybook / existing screenshots) and
   look at 2–3 real screens in **both themes**. Code lies — dead tokens, inline overrides,
   one-off styles. Trust what renders; reconcile it with the tokens.
3. **Derive the rules, not the inventory.** A design system is the handful of non-obvious
   constraints that make pages look right — what defines a surface, what never gets a border,
   the radius scale, how sections are separated, the one signature move. Aim for **6–9
   load-bearing rules**, each citing real class/token names. A dump of every variable is not
   a design system.
4. **Write the skill.** Create `skills/<name>-design/SKILL.md` following the skeleton below,
   named after the product or aesthetic. Put copy-paste token values and 2–4 **real** code
   snippets from the app in a sibling `REFERENCE.md` if they run long; keep `SKILL.md` dense.
5. **Validate and dogfood.** Run `npm run check`, then apply the new skill to restyle one
   small component and screenshot it in both themes — it should be indistinguishable from the
   source app. If it isn't, a rule is wrong or missing.

## Output skeleton (the design skill you generate)

```markdown
---
name: <product>-design
description: Apply the <product> "<aesthetic name>" design system — <3-5 word essence>. Use
  when building or restyling pages/components in <product>, or when the user mentions
  "<signature terms>" or asks to make a page match <product>.
---

# <Product> Design System

<one-paragraph thesis: the single mental model that explains the whole design>

## The N rules
1. **<Grammar rule>.** <real token values and the class names that carry them>
   … (6–9 rules)

## Workflow for a new page
1. … the order you actually build a screen in this system

## Pitfalls (each shipped as a bug once)
- <concrete failure mode observed in the code/UI> → <the fix>

## Tokens / reference
<the token table, or a link to REFERENCE.md>
```

Model the density and voice on the project's own well-written docs — every line should save
the next agent a lookup.

## Guardrails

- **Grounded only.** Never document a token, class, or component you haven't found in the
  tree and confirmed on screen.
- **Rules over inventory.** 6–9 constraints that carry the look beat a wall of variables.
- **Portability.** An extracted design skill is usually product-specific (brand colors,
  product name, private aesthetic). Keep it **local** unless it's genuinely generic and meant
  to be shared — add `skills/<name>-design/` to `.gitignore` so brand-specific design skills
  never publish by accident. Strip any secret, internal URL, or machine-specific path from
  the output.
- Leave committing to the `commit` / `ship` skills.

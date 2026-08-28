---
name: frontend
description: "Design and implement distinctive, production-ready frontend interfaces with strong aesthetic direction. Use when asked to create or restyle web pages, components, or applications (HTML/CSS/JS, React, Vue, etc.)."
---

# Frontend Design Skill

Ship real, working frontend code with a memorable, intentional aesthetic — not mood boards. Every visual choice should be rooted in purpose and context: **design thinking + execution**.

## When to Use

- Create a new web page, landing page, dashboard, or app UI
- Design or redesign frontend components or screens
- Improve typography, layout, color, motion, or overall visual polish
- Convert a concept or brief into a high-fidelity, coded interface

## Inputs to Gather (or Assume)

Before coding, identify:
- **Purpose & audience** — what problem does this UI solve? Who uses it?
- **Brand/voice** — reference brands, tone, visual inspiration?
- **Technical constraints** — framework, library, CSS strategy, accessibility, performance
- **Content constraints** — required copy, assets, data, features

If not provided, ask **2–4 targeted questions** or state reasonable assumptions in a short preface.

## Design Thinking (Required)

Commit to a **single, bold aesthetic direction**; name it and execute it consistently. E.g. brutalist/raw/utilitarian, editorial/magazine/typographic, luxury/refined/minimal, retro-futuristic/cyber/neon, art-deco/geometric/ornamental, handcrafted/organic/textured.

**Avoid generic AI aesthetics** — no default fonts, color schemes, or stock layouts.

Before writing code, define the system:
1. **Visual direction** — one sentence describing the vibe
2. **Differentiator** — what makes this UI memorable?
3. **Typography** — display + body fonts, scale, weight, casing
4. **Color** — dominant, accent, neutral; as CSS variables
5. **Layout** — grid rhythm, spacing scale, hierarchy plan
6. **Motion** — 1–2 meaningful interaction moments

If the user wants code only, skip the explanation but still follow this internally.

## Implementation Principles

- **Working code** — HTML/CSS/JS or framework code that runs as-is
- **Semantic & accessible** — headings, labels, focus states, keyboard nav
- **Responsive** — fluid layouts, breakpoints, responsive typography
- **Tokenized styling** — CSS variables for colors, spacing, radii, shadows
- **Modern layout** — prefer CSS Grid/Flex, avoid brittle positioning hacks

## Aesthetic Guidelines

- **Typography** — defines the voice; use a distinct display font + refined body font with clear hierarchy (size, weight, spacing, casing). Avoid default fonts (Inter, Roboto, Arial, system stacks).
- **Color & theme** — commit to a palette with a strong point-of-view; use contrast intentionally and check legibility. Avoid timid, overused gradients (e.g. purple-to-pink on white).
- **Composition & layout** — encourage asymmetry, scale contrast, overlap, grid breaks; use negative space deliberately (or controlled density if maximalist); build rhythm through spacing and alignment.
- **Detail & atmosphere** — add texture/depth when it serves the concept (noise, grain, subtle patterns); shadows/glows and unique borders/masks/clip-paths only when purposeful.
- **Motion & interaction** — sparing but meaningful; favor one standout interaction over many tiny ones; honor `prefers-reduced-motion`.

## Avoid

- Cookie-cutter hero + 3 card layouts
- Generic gradients and default fonts
- Unmotivated decorative elements
- Overly flat, characterless component libraries

## Deliverables

- Full code with file names or component boundaries
- Easy customization via CSS variables or config objects
- Needed assets as inline SVGs or generative CSS patterns

## Quality Checklist (Self-validate)

- Aesthetic direction unmistakable; typography intentional and expressive
- Layout/spacing consistent and purposeful; color cohesive and legible
- Interactions enhance without clutter
- Code runs as provided and is production-ready

**Remember:** a design is only as strong as its commitment. Choose a direction and execute it relentlessly.

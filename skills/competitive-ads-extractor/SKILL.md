---
name: competitive-ads-extractor
description: Extracts and analyzes competitors' ads from ad libraries (Facebook, LinkedIn, etc.) to understand what messaging, problems, and creative approaches are working. Helps inspire and improve your own ad campaigns.
---

# Competitive Ads Extractor

Extract competitors' ads from ad libraries (Facebook Ad Library, LinkedIn, TikTok, etc.), screenshot them, and analyze what's working — the problems they highlight, use cases/audiences they target, and copy/creative that resonates — to inspire and improve your own campaigns.

## What it does

1. **Extract** ads from ad libraries (Facebook, LinkedIn, TikTok, …).
2. **Screenshot** every ad.
3. **Analyze** messaging: problems, use cases, value props.
4. **Categorize** by theme / audience / format.
5. **Find patterns** — common successful approaches.
6. **Explain** why certain ads likely perform well.

## Invoking

- `Extract all current ads from [Competitor] on Facebook Ad Library`
- `Scrape ads from [Company] and analyze their messaging`
- `Get [Competitor]'s ads about [problem] — what pain points do they highlight?`
- `Extract ads from these competitors: [list]. Compare approaches and tell me what's working.`
- `Get LinkedIn ads from [Competitor] and analyze their B2B positioning`
- Trends: `Compare [Competitor]'s Q1 vs Q2 ads — what messaging changed?`
- Format: `Video vs static ads from [Competitor] — which gets more engagement (if data available)?`
- Industry: `Ad patterns across the top 10 [category] tools — what problems do they all focus on?`

## Output

Save screenshots to `~/competitor-ads/<name>/` (best performers in a `top-10/` subfolder), analysis to `~/competitor-ads/<name>/analysis.md`. Report structure:

- **Overview** — total ads, primary themes (%), formats (static/video %), CTA patterns.
- **Key problems highlighted** — each with the exact copy used and why it works.
- **Creative patterns** — e.g. before/after split, feature-showcase GIF, social proof; note how many ads use each.
- **Copy that's working** — best headlines and body-copy patterns (short sentences, outcomes over features, specific numbers).
- **Audience targeting insights** — segments inferred from ad variations (founders / team leads / enterprise / students).
- **Recommendations for your ads** — concrete, testable angles drawn from the patterns.

Deliverable formats: screenshots (images), markdown report, CSV (copy/CTAs/themes), slide deck of top performers, categorized pattern library.

## Analysis tips

- Look for repeating themes; track monthly to see evolution.
- Segment by audience — different messages for different targets.
- Compare platforms — LinkedIn vs Facebook messaging differs.
- Look at adjacent competitors too; build a reference library.
- Test insights as your own A/B experiments — inspiration, not copying.

## Legal & ethical

✓ Research and inspiration only ✓ respect IP ✓ inform original creative
✗ Don't copy ads, plagiarize copy, or steal designs

*Inspired by Sumant Subrahmanya's use case from Lenny's Newsletter.*

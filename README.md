# OpenClaw Arena Board

An Arena-style React dashboard for choosing models in agentic systems.

This version is tailored to OpenClaw-like stacks where you care about:

- current frontier-model quality
- API cost per loop
- tool-calling fluency
- context size
- whether a local fallback can fit on a single RTX 4090

## What is built

- A mobile-first React/Vite app with an Arena-inspired leaderboard surface
- An interactive cost-vs-capability scatter plot
- A focused API-usage panel for the selected hosted model
- A routing map for planner / executor / verifier / local-fallback patterns
- A separate 4090-only section for local models
- A repo roadmap for turning the snapshot into a live data product
- A dated June 1, 2026 research refresh with explicit source methodology

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Current data model

The UI now reads generated data from [`src/data.generated.js`](./src/data.generated.js), which is built from JSON source files in [`data/`](./data/).

- Vendor pricing, context windows, and launch status are sourced from current docs.
- Capability and agent-fit scores are editorial composites informed by benchmark trackers and vendor docs.
- Local-model 4090 fit is based on practical quantized footprints rather than raw parameter counts alone.
- The refresh workflow is documented in [`docs/refresh-playbook.md`](./docs/refresh-playbook.md).

Regenerate the UI snapshot with:

```bash
npm run generate:data
```

## Execution plan for the repo

1. Keep the hosted and local snapshot current with weekly refreshes.
2. Move the snapshot into JSON plus a small refresh script.
3. Add framework presets for OpenClaw, LangGraph, AutoGen, and CrewAI.
4. Store snapshots over time so the board can show drift, not just the latest state.
5. Add live filters for workload type, privacy level, and budget caps.

## Source references

- LM Arena reference: <https://huggingface.co/spaces/lmarena-ai/arena-leaderboard>
- OpenAI pricing: <https://openai.com/api/pricing/>
- OpenAI model compare: <https://developers.openai.com/api/docs/models/compare>
- Anthropic pricing: <https://platform.claude.com/docs/en/about-claude/pricing>
- Anthropic models overview: <https://platform.claude.com/docs/en/docs/about-claude/models>
- Google Gemini API pricing: <https://ai.google.dev/gemini-api/docs/pricing>
- Google Gemini models: <https://ai.google.dev/gemini-api/docs/models>
- xAI models and pricing: <https://docs.x.ai/developers/models>
- DeepSeek pricing: <https://api-docs.deepseek.com/quick_start/pricing>
- Mistral pricing: <https://mistral.ai/pricing/>
- Mistral model docs: <https://docs.mistral.ai/models>
- Ollama model library: <https://ollama.com/library>
- AGI Ranker: <https://www.agiranker.com/>

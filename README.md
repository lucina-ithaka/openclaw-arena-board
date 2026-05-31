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
- A dated May 31, 2026 research refresh with explicit source methodology

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

The UI currently uses a dated research snapshot stored in [`src/data.js`](./src/data.js).

- Vendor pricing, context windows, and launch status are sourced from current docs.
- Capability and agent-fit scores are editorial composites informed by benchmark trackers and vendor docs.
- Local-model 4090 fit is based on practical quantized footprints rather than raw parameter counts alone.
- The refresh workflow is documented in [`docs/refresh-playbook.md`](./docs/refresh-playbook.md).

## Execution plan for the repo

1. Keep the hosted and local snapshot current with weekly refreshes.
2. Move the snapshot into JSON plus a small refresh script.
3. Add framework presets for OpenClaw, LangGraph, AutoGen, and CrewAI.
4. Store snapshots over time so the board can show drift, not just the latest state.
5. Add live filters for workload type, privacy level, and budget caps.

## Source references

- LM Arena reference: <https://huggingface.co/spaces/lmarena-ai/arena-leaderboard>
- OpenAI pricing: <https://openai.com/api/pricing/>
- Anthropic pricing: <https://www.anthropic.com/pricing#api>
- Google Gemini API pricing: <https://ai.google.dev/gemini-api/docs/pricing>
- xAI model docs: <https://docs.x.ai/docs/models>
- Ollama model library: <https://ollama.com/library>
- AGI Ranker: <https://www.agiranker.com/>

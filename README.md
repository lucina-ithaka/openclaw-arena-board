# OpenClaw Arena Board

An Arena-style React dashboard for choosing models in agentic systems.

This first version is tailored to OpenClaw-like stacks where you care about:

- frontier-model quality
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

The UI currently uses a curated snapshot stored in [`src/data.js`](./src/data.js).

- Vendor API pricing links are official sources.
- Benchmark positioning and agent-fit scores are editorial blend values so the app can ship now without waiting on a full ingestion pipeline.
- Local-model 4090 fit is based on practical quantized footprints rather than raw parameter counts alone.

## Execution plan for the repo

1. Ship the UX shell and interaction model.
2. Replace hand-curated benchmark fields with a scheduled ingest job.
3. Add framework presets for OpenClaw, LangGraph, AutoGen, and CrewAI.
4. Store snapshots in JSON or Supabase so the board can diff changes over time.
5. Add live filters for workload type, privacy level, and budget caps.

## Source references

- LM Arena reference: <https://huggingface.co/spaces/lmarena-ai/arena-leaderboard>
- OpenAI pricing: <https://openai.com/api/pricing/>
- Anthropic pricing: <https://www.anthropic.com/pricing#api>
- Google Gemini API pricing: <https://ai.google.dev/gemini-api/docs/pricing>
- xAI model docs: <https://docs.x.ai/docs/models>
- Ollama model library: <https://ollama.com/library>

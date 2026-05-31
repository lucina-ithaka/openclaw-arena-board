# Refresh Playbook

This repo now treats model rankings as a dated research snapshot, not as timeless truth engraved into a CSS panel.

## Weekly refresh objective

Update the hosted and local model roster for the current week, verify major pricing and model-status changes, rebuild the site, and push the result if the snapshot changed materially.

## Source order

1. Official vendor docs first
2. Public benchmark trackers second
3. Local model distribution pages third
4. Commentary and blogs only if a primary source is missing

## Hosted-model checklist

For each provider:

- Confirm the current flagship model name
- Confirm the current fast or mini executor model
- Confirm input, cached input, and output pricing
- Confirm context window
- Confirm whether the model is GA, preview, deprecated, or rolling
- Confirm whether the model is still appropriate for agentic work

## Local-model checklist

For each candidate:

- Confirm the model still exists in Ollama or another official distribution page
- Confirm parameter size and modality support
- Confirm whether a realistic 24 GB deployment still makes sense
- Mark whether the fit is comfortable, good, or technically possible but annoying

## Ranking principles

- `arenaScore` is a capability signal, not a literal Arena Elo
- `agentScore` reflects likely OpenClaw usefulness: tool use, recovery, code, long tasks, and general reliability
- Penalize preview-only models slightly on deployability
- Penalize local models that only "fit" through absurd offloading gymnastics

## Update steps

1. Re-check official pricing pages
2. Re-check benchmark references
3. Update [`src/data.js`](../src/data.js)
4. Run `npm run build`
5. Review the generated site for layout regressions
6. Commit and push if the snapshot changed

## Current benchmark references

- AGI Ranker: <https://www.agiranker.com/>
- LM Arena reference board: <https://huggingface.co/spaces/lmarena-ai/arena-leaderboard>

## Current primary pricing and model references

- OpenAI: <https://openai.com/api/pricing/> and <https://developers.openai.com/api/docs/models>
- Anthropic: <https://platform.claude.com/docs/en/about-claude/pricing> and <https://platform.claude.com/docs/en/about-claude/models/overview>
- Google: <https://cloud.google.com/gemini-enterprise-agent-platform/generative-ai/pricing>
- xAI: <https://docs.x.ai/developers/models>
- Mistral: <https://mistral.ai/pricing/>
- Ollama library: <https://ollama.com/library>

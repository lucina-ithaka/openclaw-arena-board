import { useDeferredValue, useMemo, useState } from "react";
import {
  hostedModels,
  localModels,
  roadmap,
  snapshot,
  topology,
} from "./data.generated.js";

const sortOptions = {
  arenaScore: "Capability score",
  agentScore: "Agent fit",
  inputCost: "Lowest input cost",
  outputCost: "Lowest output cost",
  latency: "Lowest latency",
  contextWindow: "Largest context",
};

function formatMoney(value) {
  return `$${value.toFixed(value < 1 ? 2 : 1)}`;
}

function formatContext(value) {
  return value >= 1000 ? `${(value / 1000).toFixed(0)}M` : `${value}K`;
}

function sortModels(models, key) {
  const sorted = [...models];
  sorted.sort((left, right) => {
    if (key === "inputCost" || key === "outputCost" || key === "latency") {
      return left[key] - right[key];
    }

    return right[key] - left[key];
  });
  return sorted;
}

function buildScatterPoints(models) {
  const maxCost = Math.max(...models.map((model) => model.outputCost));
  const minCost = Math.min(...models.map((model) => model.inputCost));
  const maxScore = Math.max(...models.map((model) => model.agentScore));
  const minScore = Math.min(...models.map((model) => model.agentScore));

  return models.map((model) => {
    const xRatio = (model.inputCost - minCost) / Math.max(maxCost - minCost, 1);
    const yRatio = (model.agentScore - minScore) / Math.max(maxScore - minScore, 1);

    return {
      ...model,
      x: 52 + xRatio * 416,
      y: 256 - yRatio * 196,
    };
  });
}

function scoreClass(rank) {
  if (rank === 1) {
    return "score-badge top";
  }

  if (rank <= 3) {
    return "score-badge high";
  }

  return "score-badge";
}

function App() {
  const [provider, setProvider] = useState("All providers");
  const [sortKey, setSortKey] = useState("agentScore");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(hostedModels[0].id);

  const deferredQuery = useDeferredValue(query);

  const filteredModels = useMemo(() => {
    const lowered = deferredQuery.trim().toLowerCase();

    return hostedModels.filter((model) => {
      const providerMatch =
        provider === "All providers" || model.provider === provider;
      const queryMatch =
        !lowered ||
        `${model.name} ${model.provider} ${model.toolUse} ${model.notes}`
          .toLowerCase()
          .includes(lowered);

      return providerMatch && queryMatch;
    });
  }, [deferredQuery, provider]);

  const sortedModels = useMemo(
    () => sortModels(filteredModels, sortKey),
    [filteredModels, sortKey],
  );

  const selectedModel =
    hostedModels.find((model) => model.id === selectedId) ?? hostedModels[0];

  const scatterPoints = useMemo(
    () => buildScatterPoints(sortedModels.length ? sortedModels : hostedModels),
    [sortedModels],
  );

  const providerChoices = [
    "All providers",
    ...new Set(hostedModels.map((model) => model.provider)),
  ];

  const headlineStats = [
    {
      label: "Hosted models tracked",
      value: hostedModels.length,
      detail: "Refreshed to a May 31, 2026 snapshot",
    },
    {
      label: "4090-ready local models",
      value: localModels.length,
      detail: "Serious local picks, not nostalgia bait",
    },
    {
      label: "Cheapest hosted input",
      value: formatMoney(
        Math.min(...hostedModels.map((model) => model.inputCost)),
      ),
      detail: "Per 1M input tokens in the current snapshot",
    },
  ];

  return (
    <main className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <section className="hero panel">
        <div className="hero-copy">
          <p className="eyebrow">OpenClaw Arena Board</p>
          <h1>
            An Arena-style command center for agentic model selection.
          </h1>
          <p className="lede">
            Designed for OpenClaw-style systems where model quality is only half
            the story. This refreshed board weighs current frontier capability,
            agent fluency, API economics, release status, and whether a private
            local fallback can still live on a single RTX 4090.
          </p>

          <div className="hero-actions">
            <a className="primary-link" href="#leaderboard">
              Open leaderboard
            </a>
            <a className="secondary-link" href="#local-stack">
              Jump to local stack
            </a>
          </div>

          <div className="snapshot-note">
            <strong>Snapshot:</strong> {snapshot.asOf}
            <span>{snapshot.description}</span>
          </div>

          <div className="methodology-strip">
            {snapshot.methodology.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
        </div>

        <div className="hero-side">
          {headlineStats.map((stat) => (
            <article className="stat-card" key={stat.label}>
              <p>{stat.label}</p>
              <strong>{stat.value}</strong>
              <span>{stat.detail}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="metrics-grid">
        <article className="panel chart-panel">
          <div className="section-head">
            <div>
              <p className="eyebrow">Cost vs capability</p>
              <h2>Agent-fit scatter plot</h2>
            </div>
            <p className="section-copy">
              High and left is the sweet spot: stronger agent behavior at lower
              token burn. Preview models are included, but their status is
              surfaced explicitly instead of being passed off as boringly stable.
            </p>
          </div>

          <svg
            className="scatter-chart"
            viewBox="0 0 520 320"
            role="img"
            aria-label="Scatter plot of agent fit against input token price"
          >
            <line x1="52" y1="256" x2="480" y2="256" className="axis" />
            <line x1="52" y1="40" x2="52" y2="256" className="axis" />
            <text x="480" y="285" className="axis-label">
              higher token cost
            </text>
            <text x="20" y="40" className="axis-label vertical">
              stronger agent fit
            </text>

            {scatterPoints.map((point) => (
              <g
                className={`dot-group ${
                  point.id === selectedModel.id ? "active" : ""
                }`}
                key={point.id}
                onClick={() => setSelectedId(point.id)}
              >
                <circle cx={point.x} cy={point.y} r="10" className="dot" />
                <text x={point.x} y={point.y - 18} textAnchor="middle">
                  {point.provider}
                </text>
              </g>
            ))}
          </svg>
        </article>

        <article className="panel focus-panel">
          <div className="section-head">
            <div>
              <p className="eyebrow">API usage</p>
              <h2>{selectedModel.name}</h2>
            </div>
            <p className="section-copy">{selectedModel.notes}</p>
          </div>

          <div className="focus-meta">
            <span>{selectedModel.provider}</span>
            <span>{selectedModel.status}</span>
            <span>{selectedModel.toolUse}</span>
            <span>{formatContext(selectedModel.contextWindow)} context</span>
          </div>

          <div className="usage-bars">
            {[
              ["Input", selectedModel.inputCost, 15],
              ["Output", selectedModel.outputCost, 15],
              ["Cached input", selectedModel.cacheCost, 1],
            ].map(([label, value, scale]) => (
              <div className="usage-row" key={label}>
                <div className="usage-copy">
                  <p>{label}</p>
                  <strong>{formatMoney(value)} / 1M tokens</strong>
                </div>
                <div className="usage-track">
                  <span style={{ width: `${Math.min((value / scale) * 100, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>

          <dl className="detail-grid">
            <div>
              <dt>Latency</dt>
              <dd>{selectedModel.latency.toFixed(1)}s median loop</dd>
            </div>
            <div>
              <dt>Modalities</dt>
              <dd>{selectedModel.modalities.join(" • ")}</dd>
            </div>
            <div>
              <dt>Regions</dt>
              <dd>{selectedModel.regions.join(" • ").toUpperCase()}</dd>
            </div>
            <div>
              <dt>Tier</dt>
              <dd>{selectedModel.tier}</dd>
            </div>
            <div>
              <dt>Release status</dt>
              <dd>
                {selectedModel.status} · {selectedModel.releaseDate}
              </dd>
            </div>
            <div>
              <dt>Model ID</dt>
              <dd>{selectedModel.modelId}</dd>
            </div>
          </dl>
        </article>
      </section>

      <section className="panel leaderboard-panel" id="leaderboard">
        <div className="section-head">
          <div>
            <p className="eyebrow">Leaderboard</p>
            <h2>Hosted models for agentic frameworks</h2>
          </div>
          <p className="section-copy">
            Filtered for planning, tool use, production economics, and actual
            2026 release status rather than pure chat vibes.
          </p>
        </div>

        <div className="toolbar">
          <label>
            Search
            <input
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Claude, verifier, OpenAI..."
              type="search"
              value={query}
            />
          </label>

          <label>
            Provider
            <select
              onChange={(event) => setProvider(event.target.value)}
              value={provider}
            >
              {providerChoices.map((choice) => (
                <option key={choice} value={choice}>
                  {choice}
                </option>
              ))}
            </select>
          </label>

          <label>
            Sort by
            <select
              onChange={(event) => setSortKey(event.target.value)}
              value={sortKey}
            >
              {Object.entries(sortOptions).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="leaderboard-table">
          <div className="leaderboard-head">
            <span>Rank</span>
            <span>Model</span>
            <span>Agent fit</span>
            <span>Capability</span>
            <span>Input</span>
            <span>Output</span>
            <span>Latency</span>
          </div>

          {sortedModels.map((model, index) => (
            <button
              className={`leaderboard-row ${
                model.id === selectedModel.id ? "selected" : ""
              }`}
              key={model.id}
              onClick={() => setSelectedId(model.id)}
              type="button"
            >
              <span className={scoreClass(index + 1)}>#{index + 1}</span>
              <span className="model-cell">
                <strong>{model.name}</strong>
                <small>
                  {model.provider} · {model.status} · {model.toolUse}
                </small>
              </span>
              <span>{model.agentScore}</span>
              <span>{model.arenaScore}</span>
              <span>{formatMoney(model.inputCost)}</span>
              <span>{formatMoney(model.outputCost)}</span>
              <span>{model.latency.toFixed(1)}s</span>
            </button>
          ))}
        </div>
      </section>

      <section className="panel topology-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Map</p>
            <h2>Agent routing map for OpenClaw-style stacks</h2>
          </div>
          <p className="section-copy">
            The board is paired with a simple operating model: expensive models
            plan, cheaper models execute and verify, and a local GPU keeps
            private or offline tasks on-box.
          </p>
        </div>

        <div className="topology-grid">
          {topology.map((node) => (
            <article className={`topology-card ${node.color}`} key={node.title}>
              <h3>{node.title}</h3>
              <p>{node.blurb}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel local-panel" id="local-stack">
        <div className="section-head">
          <div>
            <p className="eyebrow">Local-only</p>
            <h2>Models that fit on a single RTX 4090</h2>
          </div>
          <p className="section-copy">
            Quantized or offload-aware picks for a 24 GB card, sorted for
            practical autonomy rather than theoretical maximums.
          </p>
        </div>

        <div className="local-grid">
          {localModels.map((model) => (
            <article className="local-card" key={model.id}>
              <div className="local-head">
                <div>
                  <h3>{model.name}</h3>
                  <p>
                    {model.family} · {model.quant}
                  </p>
                </div>
                <span>{model.fitScore}/100</span>
              </div>

              <div className="vram-meter">
                <div className="vram-track">
                  <span style={{ width: `${(model.vramGb / 24) * 100}%` }} />
                </div>
                <p>{model.vramGb.toFixed(1)} GB of 24 GB</p>
              </div>

              <dl className="detail-grid compact">
                <div>
                  <dt>Best for</dt>
                  <dd>{model.bestFor}</dd>
                </div>
                <div>
                  <dt>Context</dt>
                  <dd>{formatContext(model.contextWindow)}</dd>
                </div>
                <div>
                  <dt>Tool use</dt>
                  <dd>{model.toolUse}</dd>
                </div>
                <div>
                  <dt>Fit mode</dt>
                  <dd>{model.fitMode}</dd>
                </div>
                <div>
                  <dt>Capability signal</dt>
                  <dd>{model.arenaScore}</dd>
                </div>
              </dl>

              <p className="local-note">{model.notes}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel roadmap-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Build plan</p>
            <h2>What this repo needs next</h2>
          </div>
          <p className="section-copy">
            Pass 1 is the research refresh. Pass 2 is making the refresh
            repeatable so this board stops fossilizing between good intentions.
          </p>
        </div>

        <div className="roadmap-list">
          {roadmap.map((item) => (
            <article className="roadmap-card" key={item}>
              <span />
              <p>{item}</p>
            </article>
          ))}
        </div>

        <div className="source-list">
          {snapshot.sources.map((source) => (
            <a href={source.url} key={source.url} rel="noreferrer" target="_blank">
              {source.label}
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}

export default App;

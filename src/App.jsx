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

function buildScatterPoints(hosted, local) {
  const hostedPoints = hosted.map((model) => ({
    ...model,
    pointType: "hosted",
    pointLabel: model.provider,
    chartCost: model.outputCost,
    fitScore: model.agentScore,
  }));

  const localPoints = local.map((model) => ({
    ...model,
    pointType: "local",
    pointLabel: "Local",
    provider: model.family,
    chartCost: 0,
    fitScore: model.fitScore,
  }));

  const points = [...hostedPoints, ...localPoints];
  const maxCost = Math.max(...points.map((model) => model.chartCost));
  const maxScore = Math.max(...points.map((model) => model.fitScore));
  const minScore = Math.min(...points.map((model) => model.fitScore));

  return points.map((model) => {
    const xRatio = model.chartCost / Math.max(maxCost, 1);
    const yRatio = (model.fitScore - minScore) / Math.max(maxScore - minScore, 1);

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

  const scatterPoints = useMemo(
    () => buildScatterPoints(sortedModels.length ? sortedModels : hostedModels, localModels),
    [sortedModels],
  );

  const selectedModel =
    scatterPoints.find((model) => model.id === selectedId) ?? scatterPoints[0];

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

  const xGridLines = [52, 156, 260, 364, 468];
  const yGridLines = [60, 109, 158, 207, 256];
  const scoreMeaning = [
    "Agent fit is a board-relative operational score for planning quality, tool calling, coding loops, recovery after bad tool results, and how sane the model is to run inside a real agent stack.",
    "A 100 means the strongest current model in this snapshot for agentic use. A 99 means effectively one step below that reference point in practical use, not a universal scientific score.",
    "Local models use the same practical scale, but are judged within the constraints of a single 24 GB RTX 4090 setup rather than idealized multi-GPU deployments.",
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
              High and left is the sweet spot: stronger agent behavior with
              either local access or lower output-token cost. Hosted models move
              right as output cost rises; local models pin to the zero-cost edge.
            </p>
          </div>

          <svg
            className="scatter-chart"
            viewBox="0 0 520 320"
            role="img"
            aria-label="Scatter plot of agent fit against local access or output token price"
          >
            {yGridLines.map((y) => (
              <line
                className="grid-line"
                key={`y-${y}`}
                x1="52"
                x2="480"
                y1={y}
                y2={y}
              />
            ))}
            {xGridLines.map((x) => (
              <line
                className="grid-line"
                key={`x-${x}`}
                x1={x}
                x2={x}
                y1="40"
                y2="256"
              />
            ))}
            <line x1="52" y1="256" x2="480" y2="256" className="axis" />
            <line x1="52" y1="40" x2="52" y2="256" className="axis" />
            <text x="52" y="285" className="axis-label" textAnchor="start">
              local access
            </text>
            <text x="480" y="285" className="axis-label" textAnchor="end">
              higher output cost / 1M tokens
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
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={point.pointType === "local" ? "11" : "10"}
                  className={`dot ${point.pointType}`}
                />
                <text x={point.x} y={point.y - 18} textAnchor="middle">
                  {point.pointLabel}
                </text>
              </g>
            ))}
          </svg>
        </article>

        <article className="panel focus-panel">
          <div className="section-head">
            <div>
              <p className="eyebrow">
                {selectedModel.pointType === "local" ? "Local profile" : "API usage"}
              </p>
              <h2>{selectedModel.name}</h2>
            </div>
            <p className="section-copy">{selectedModel.notes}</p>
          </div>

          <div className="focus-meta">
            <span>{selectedModel.provider}</span>
            <span>
              {selectedModel.pointType === "local"
                ? selectedModel.fitMode
                : selectedModel.status}
            </span>
            <span>{selectedModel.toolUse}</span>
            <span>{formatContext(selectedModel.contextWindow)} context</span>
          </div>

          <div className="usage-bars">
            {(
              selectedModel.pointType === "local"
                ? [
                    ["Output API cost", 0, 15],
                    ["VRAM footprint", selectedModel.vramGb, 24],
                    ["Agent fit", selectedModel.fitScore, 100],
                  ]
                : [
                    ["Input", selectedModel.inputCost, 15],
                    ["Output", selectedModel.outputCost, 30],
                    ["Cached input", selectedModel.cacheCost, 1],
                  ]
            ).map(([label, value, scale]) => (
              <div className="usage-row" key={label}>
                <div className="usage-copy">
                  <p>{label}</p>
                  <strong>
                    {selectedModel.pointType === "local" && label === "VRAM footprint"
                      ? `${value.toFixed(1)} GB / 24 GB`
                      : selectedModel.pointType === "local" && label === "Agent fit"
                        ? `${value}/100`
                        : `${formatMoney(value)} / 1M tokens`}
                  </strong>
                </div>
                <div className="usage-track">
                  <span style={{ width: `${Math.min((value / scale) * 100, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>

          <dl className="detail-grid">
            <div>
              <dt>{selectedModel.pointType === "local" ? "Fit score" : "Latency"}</dt>
              <dd>
                {selectedModel.pointType === "local"
                  ? `${selectedModel.fitScore}/100`
                  : `${selectedModel.latency.toFixed(1)}s median loop`}
              </dd>
            </div>
            <div>
              <dt>{selectedModel.pointType === "local" ? "Quantization" : "Modalities"}</dt>
              <dd>
                {selectedModel.pointType === "local"
                  ? selectedModel.quant
                  : selectedModel.modalities.join(" • ")}
              </dd>
            </div>
            <div>
              <dt>{selectedModel.pointType === "local" ? "Footprint" : "Regions"}</dt>
              <dd>
                {selectedModel.pointType === "local"
                  ? `${selectedModel.vramGb.toFixed(1)} GB VRAM`
                  : selectedModel.regions.join(" • ").toUpperCase()}
              </dd>
            </div>
            <div>
              <dt>{selectedModel.pointType === "local" ? "Best for" : "Tier"}</dt>
              <dd>
                {selectedModel.pointType === "local"
                  ? selectedModel.bestFor
                  : selectedModel.tier}
              </dd>
            </div>
            <div>
              <dt>{selectedModel.pointType === "local" ? "Local access" : "Release status"}</dt>
              <dd>
                {selectedModel.pointType === "local"
                  ? `${selectedModel.fitMode} · ${formatContext(selectedModel.contextWindow)} context`
                  : `${selectedModel.status} · ${selectedModel.releaseDate}`}
              </dd>
            </div>
            <div>
              <dt>{selectedModel.pointType === "local" ? "Capability signal" : "Model ID"}</dt>
              <dd>
                {selectedModel.pointType === "local"
                  ? selectedModel.arenaScore
                  : selectedModel.modelId}
              </dd>
            </div>
          </dl>
        </article>
      </section>

      <section className="panel topology-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Scoring</p>
            <h2>What agent fit means on this board</h2>
          </div>
          <p className="section-copy">
            These are board-relative operational scores, not official vendor
            scores and not a raw benchmark dump pretending to be more objective
            than it really is.
          </p>
        </div>

        <div className="roadmap-list">
          {scoreMeaning.map((item) => (
            <article className="roadmap-card" key={item}>
              <span />
              <p>{item}</p>
            </article>
          ))}
        </div>
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
            <article
              className={`local-card ${model.id === selectedModel.id ? "selected" : ""}`}
              key={model.id}
              onClick={() => setSelectedId(model.id)}
            >
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

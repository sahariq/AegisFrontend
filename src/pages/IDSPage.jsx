// src/pages/IDSPage.jsx

import React, { useMemo, useState } from "react";
import {
  Shield,
  RadioTower,
  ChartPie,
  Activity,
  BrainCircuit,
  LineChart,
  ShieldAlert,
  Download,
  Search,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Info,
  Network,
  Lightbulb,
  Zap,
} from "lucide-react";

import "../index.css";

// --- Demo data (replace with real API later) ----------------------

const mockAlerts = [
  {
    id: "OB-109",
    timestamp: "21:24:07",
    srcIp: "203.0.113.45",
    destIp: "10.0.0.12",
    protocol: "TCP",
    label: "DDoS_SYN_Flood",
    score: 0.94,
    severity: "high",
    sensor: "Edge Firewall",
    srcPort: 52014,
    destPort: 443,
    type: "DDoS Attempt",
  },
  {
    id: "OB-110",
    timestamp: "21:23:32",
    srcIp: "198.51.100.77",
    destIp: "10.0.0.20",
    protocol: "TCP",
    label: "BruteForce_SSH",
    score: 0.88,
    severity: "medium",
    sensor: "VPN Gateway",
    srcPort: 51782,
    destPort: 22,
    type: "Brute-Force",
  },
  {
    id: "OB-111",
    timestamp: "21:22:10",
    srcIp: "192.0.2.200",
    destIp: "10.0.0.35",
    protocol: "UDP",
    label: "DNS_Tunnel",
    score: 0.91,
    severity: "high",
    sensor: "Core Sensor",
    srcPort: 52110,
    destPort: 53,
    type: "DNS Tunnel",
  },
  {
    id: "OB-112",
    timestamp: "21:21:03",
    srcIp: "10.0.0.94",
    destIp: "10.0.0.15",
    protocol: "TCP",
    label: "Recon_PortScan",
    score: 0.71,
    severity: "low",
    sensor: "Internal Sensor",
    srcPort: 50213,
    destPort: 8080,
    type: "Reconnaissance",
  },
];

const tabs = [
  { id: "overview", label: "Overview", icon: ChartPie },
  { id: "live-alerts", label: "Live Alerts", icon: Activity },
  { id: "explainability", label: "Explainability", icon: BrainCircuit },
  { id: "analytics", label: "Analytics", icon: LineChart },
  { id: "threat-intel", label: "Threat Intel", icon: ShieldAlert },
];

// Severity Pill Component
const SeverityPill = ({ severity, withIcon = true, className = "" }) => {
  if (severity === "high") {
    return (
      <span className={`ids-severity-pill ids-severity-high ${className}`}>
        {withIcon && <AlertTriangle className="ids-severity-icon" />}
        High
      </span>
    );
  }
  if (severity === "medium") {
    return (
      <span className={`ids-severity-pill ids-severity-medium ${className}`}>
        {withIcon && <AlertCircle className="ids-severity-icon" />}
        Medium
      </span>
    );
  }
  return (
    <span className={`ids-severity-pill ids-severity-low ${className}`}>
      {withIcon && <CheckCircle2 className="ids-severity-icon" />}
      Low
    </span>
  );
};

function IDSPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedAlertId, setSelectedAlertId] = useState(
    mockAlerts[0]?.id ?? ""
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");

  const totalAlerts = mockAlerts.length;
  const highCount = mockAlerts.filter((a) => a.severity === "high").length;
  const mediumCount = mockAlerts.filter((a) => a.severity === "medium").length;
  const lowCount = mockAlerts.filter((a) => a.severity === "low").length;

  const selectedAlert = useMemo(
    () => mockAlerts.find((a) => a.id === selectedAlertId) ?? mockAlerts[0],
    [selectedAlertId]
  );

  const filteredAlerts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return mockAlerts.filter((alert) => {
      const matchesSeverity =
        severityFilter === "all" || alert.severity === severityFilter;
      const matchesSearch =
        term.length === 0 ||
        alert.id.toLowerCase().includes(term) ||
        alert.srcIp.toLowerCase().includes(term) ||
        alert.destIp.toLowerCase().includes(term) ||
        alert.label.toLowerCase().includes(term) ||
        alert.type.toLowerCase().includes(term);
      return matchesSeverity && matchesSearch;
    });
  }, [searchTerm, severityFilter]);

  return (
    <div className="aegis-page">
      {/* Header */}
      <header className="ids-header-new">
        <div className="ids-header-left">
          <div className="ids-header-icon-wrap">
            <Shield className="ids-header-icon" size={24} />
          </div>
          <div className="ids-header-text">
            <h1 className="aegis-dash-title">
              Aegis IDS — Real-Time Threat Detection
            </h1>
            <p className="aegis-dash-subtitle">
              Live network threat intelligence with explainability and analytics
              for SME networks.
            </p>
            <div className="ids-last-updated">
              <span className="ids-status-dot ids-status-dot--pulse" />
              <span>Updated 32s ago</span>
            </div>
          </div>
        </div>
        <div className="ids-header-right">
          <div className="ids-status-pill">
            <span className="ids-status-dot" />
            IDS Online · Live Mode (Streaming)
          </div>
          <button className="ids-pentest-btn cursor-hotspot-action">
            <RadioTower size={16} />
            Run Pentest
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="ids-tab-container">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`ids-tab-new ${isActive ? "ids-tab-new--active" : ""}`}
            >
              <Icon className="ids-tab-icon" size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <section className="ids-overview-grid">
          {/* Left column */}
          <div className="ids-overview-left">
            {/* Enterprise-Ready Architecture */}
            <div className="aegis-card ids-arch-card">
              <div className="aegis-card-header">
                <h2>Enterprise-Ready Architecture</h2>
                <span className="aegis-card-subtitle">
                  How Aegis IDS operates in your environment.
                </span>
              </div>
              <div className="ids-arch-content">
                <p>
                  Aegis IDS runs as a 24/7 control-plane for SME networks, tuned
                  for noisy production traffic.
                </p>
                <ul className="ids-arch-list">
                  <li>
                    <span className="ids-arch-dot ids-arch-dot--purple" />
                    Backend sensors continuously capture traffic and stream alerts
                    to the IDS engine.
                  </li>
                  <li>
                    <span className="ids-arch-dot ids-arch-dot--cyan" />
                    <strong>Live Alerts</strong> supports optional auto-refresh
                    streaming for NOC-style monitoring.
                  </li>
                  <li>
                    <span className="ids-arch-dot ids-arch-dot--indigo" />
                    <strong>Explainability</strong>, <strong>Analytics</strong>{" "}
                    and <strong>Threat Intel</strong> remain static for deep-dive
                    investigations.
                  </li>
                  <li>
                    <span className="ids-arch-dot ids-arch-dot--emerald" />
                    Use <strong>"Refresh Dashboard"</strong> to sync metrics
                    across all tabs with the latest IDS state.
                  </li>
                </ul>
                <button className="ids-refresh-btn">
                  <LineChart size={14} />
                  Refresh Dashboard
                </button>
              </div>
            </div>

            {/* Security Overview */}
            <div className="aegis-card">
              <div className="aegis-card-header">
                <h2>Security Overview</h2>
                <span className="aegis-card-subtitle">
                  Last 5 min snapshot
                </span>
              </div>
              <div className="ids-kpi-grid">
                <div className="ids-kpi-card">
                  <div className="ids-kpi-label">Total Alerts</div>
                  <div className="ids-kpi-value">{totalAlerts}</div>
                  <div className="ids-kpi-meta">
                    Across all sensors and attack families.
                  </div>
                </div>
                <div className="ids-kpi-card">
                  <div className="ids-kpi-label">High Severity</div>
                  <div className="ids-kpi-value ids-kpi-value--red">
                    {highCount}
                  </div>
                  <SeverityPill severity="high" className="ids-kpi-pill" />
                  <div className="ids-kpi-meta">
                    Requires immediate triage and response.
                  </div>
                </div>
                <div className="ids-kpi-card">
                  <div className="ids-kpi-label">Medium Severity</div>
                  <div className="ids-kpi-value ids-kpi-value--amber">
                    {mediumCount}
                  </div>
                  <SeverityPill severity="medium" className="ids-kpi-pill" />
                  <div className="ids-kpi-meta">
                    Monitor and correlate with adjacent activity.
                  </div>
                </div>
                <div className="ids-kpi-card">
                  <div className="ids-kpi-label">Low Severity</div>
                  <div className="ids-kpi-value ids-kpi-value--emerald">
                    {lowCount}
                  </div>
                  <SeverityPill severity="low" className="ids-kpi-pill" />
                  <div className="ids-kpi-meta">
                    Benign or informational signals in current window.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right column: Distributions */}
          <div className="ids-overview-right">
            <div className="aegis-card">
              <div className="aegis-card-header">
                <h2>Distributions</h2>
                <span className="aegis-card-subtitle">
                  Based on active alerts
                </span>
              </div>
              <div className="ids-dist-grid-new">
                {/* Attack Type Distribution */}
                <div className="ids-dist-section">
                  <div className="ids-dist-section-title">
                    <ChartPie size={16} />
                    Attack Type Distribution
                  </div>
                  {[
                    { label: "DDoS", value: 48, color: "ids-bar-fill--purple" },
                    {
                      label: "DNS Tunnel",
                      value: 27,
                      color: "ids-bar-fill--cyan",
                    },
                    { label: "Recon", value: 18, color: "ids-bar-fill--amber" },
                    { label: "Other", value: 7, color: "ids-bar-fill--slate" },
                  ].map((item) => (
                    <div key={item.label} className="ids-bar-row">
                      <span>{item.label}</span>
                      <div className="ids-bar">
                        <div
                          className={`ids-bar-fill ${item.color}`}
                          style={{ width: `${item.value}%` }}
                        />
                      </div>
                      <span className="ids-bar-value">{item.value}%</span>
                    </div>
                  ))}
                </div>

                {/* Severity Distribution */}
                <div className="ids-dist-section">
                  <div className="ids-dist-section-title">
                    <ShieldAlert size={16} />
                    Severity Distribution
                  </div>
                  {[
                    { label: "High", value: 38, color: "ids-bar-fill--red" },
                    {
                      label: "Medium",
                      value: 42,
                      color: "ids-bar-fill--amber",
                    },
                    {
                      label: "Low",
                      value: 20,
                      color: "ids-bar-fill--green",
                    },
                  ].map((item) => (
                    <div key={item.label} className="ids-bar-row">
                      <span>{item.label}</span>
                      <div className="ids-bar">
                        <div
                          className={`ids-bar-fill ${item.color}`}
                          style={{ width: `${item.value}%` }}
                        />
                      </div>
                      <span className="ids-bar-value">{item.value}%</span>
                    </div>
                  ))}
                </div>

                {/* Protocol Distribution */}
                <div className="ids-dist-section">
                  <div className="ids-dist-section-title">
                    <Activity size={16} />
                    Protocol Distribution
                  </div>
                  {[
                    { label: "TCP", value: 68, color: "ids-bar-fill--blue" },
                    { label: "UDP", value: 22, color: "ids-bar-fill--purple" },
                    { label: "ICMP", value: 10, color: "ids-bar-fill--slate" },
                  ].map((item) => (
                    <div key={item.label} className="ids-bar-row">
                      <span>{item.label}</span>
                      <div className="ids-bar">
                        <div
                          className={`ids-bar-fill ${item.color}`}
                          style={{ width: `${item.value}%` }}
                        />
                      </div>
                      <span className="ids-bar-value">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Live Alerts Tab */}
      {activeTab === "live-alerts" && (
        <section className="ids-live-grid">
          {/* Left column */}
          <div className="ids-left-stack">
            {/* Streaming toolbar */}
            <div className="aegis-card">
              <div className="ids-live-toolbar">
                <div className="ids-live-left">
                  <div className="ids-live-status">
                    <span
                      className={`ids-live-dot ${
                        autoRefresh ? "ids-live-dot--on" : "ids-live-dot--off"
                      }`}
                    />
                    {autoRefresh
                      ? "LIVE STREAMING — auto-refresh enabled."
                      : "No auto-refresh — navigate freely between tabs."}
                  </div>
                  <div className="ids-live-toggle">
                    <span>Enable Auto-Refresh</span>
                    <button
                      type="button"
                      onClick={() => setAutoRefresh((prev) => !prev)}
                      className={`ids-toggle ${
                        autoRefresh ? "ids-toggle--on" : "ids-toggle--off"
                      }`}
                    >
                      <span className="ids-toggle-knob" />
                    </button>
                  </div>
                </div>
                <div className="ids-live-kpis">
                  <div className="ids-inline-kpi">
                    <span className="ids-inline-kpi-label">Total alerts:</span>
                    <span className="ids-inline-kpi-value">{totalAlerts}</span>
                  </div>
                  <div className="ids-inline-kpi">
                    <span className="ids-inline-kpi-label">Last 5 min:</span>
                    <span className="ids-inline-kpi-value">
                      10 <span className="ids-inline-kpi-delta">(+1)</span>
                    </span>
                  </div>
                  <div className="ids-inline-kpi">
                    <span className="ids-inline-kpi-label">Last update:</span>
                    <span className="ids-inline-kpi-value">21:24:07</span>
                  </div>
                  <button className="ids-download-btn cursor-hotspot-action">
                    <Download size={14} />
                    Download CSV
                  </button>
                </div>
              </div>
            </div>

            {/* Alerts feed */}
            <div className="aegis-card">
              <div className="aegis-card-header">
                <div>
                  <h2>Live Alerts Feed</h2>
                  <span className="aegis-card-subtitle">
                    Showing {filteredAlerts.length} of {totalAlerts} alerts
                    (after filters).
                  </span>
                </div>
                <div className="ids-table-controls">
                  <div className="ids-search-wrapper">
                    <Search size={14} className="ids-search-icon" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search alerts..."
                      className="ids-search-input"
                    />
                  </div>
                  <select
                    value={severityFilter}
                    onChange={(e) => setSeverityFilter(e.target.value)}
                    className="ids-select"
                  >
                    <option value="all">All severities</option>
                    <option value="high">High only</option>
                    <option value="medium">Medium only</option>
                    <option value="low">Low only</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="ids-table-wrapper">
                <table className="ids-table">
                  <thead>
                    <tr>
                      <th>Alert</th>
                      <th>Timestamp</th>
                      <th>Source IP</th>
                      <th>Dest IP</th>
                      <th>Protocol</th>
                      <th>Label</th>
                      <th>Score</th>
                      <th>Severity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAlerts.map((alert) => {
                      const isSelected = alert.id === selectedAlert?.id;
                      return (
                        <tr
                          key={alert.id}
                          onClick={() => setSelectedAlertId(alert.id)}
                          className={`ids-row ${
                            isSelected ? "ids-row--selected" : ""
                          }`}
                        >
                          <td>
                            <div className="ids-alert-id-cell">
                              <span
                                className={`ids-alert-dot ids-alert-dot--${alert.severity}`}
                              />
                              <span>{alert.id}</span>
                            </div>
                          </td>
                          <td>{alert.timestamp}</td>
                          <td>{alert.srcIp}</td>
                          <td>{alert.destIp}</td>
                          <td>{alert.protocol}</td>
                          <td>{alert.label}</td>
                          <td>{alert.score.toFixed(2)}</td>
                          <td>
                            <SeverityPill severity={alert.severity} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Frequency placeholder */}
              <div className="ids-chart-section">
                <div className="ids-chart-header">
                  <span>Alert Frequency (Last 60s)</span>
                  <span className="ids-chart-placeholder-label">
                    Timeseries chart placeholder
                  </span>
                </div>
                <div className="aegis-chart-placeholder">
                  <span>
                    Timeseries chart placeholder — plug in IDS API later.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="ids-right-stack">
            {/* Selected Alert Summary */}
            <div className="aegis-card ids-selected-summary">
              <div className="ids-selected-header">
                <div>
                  <h2 className="ids-selected-title">
                    {selectedAlert
                      ? `${selectedAlert.id} · ${selectedAlert.type}`
                      : "No alert selected"}
                  </h2>
                  {selectedAlert && (
                    <p className="ids-selected-meta">
                      {selectedAlert.timestamp} · {selectedAlert.sensor}
                    </p>
                  )}
                </div>
                {selectedAlert && (
                  <SeverityPill severity={selectedAlert.severity} />
                )}
              </div>
              {selectedAlert && (
                <>
                  <div className="ids-score-display">
                    <span className="ids-score-label">Detection score</span>
                    <span className="ids-score-value">
                      {selectedAlert.score.toFixed(2)}
                    </span>
                  </div>
                  <div className="ids-tags">
                    <span className="ids-tag">{selectedAlert.label}</span>
                    <span className="ids-tag">
                      {selectedAlert.protocol}
                      {selectedAlert.destPort ? ` · ${selectedAlert.destPort}` : ""}
                    </span>
                    <span className="ids-tag">{selectedAlert.sensor}</span>
                  </div>
                </>
              )}
            </div>

            {/* Alert Details */}
            <div className="aegis-card ids-details-card">
              <div className="ids-details-section">
                <h3>
                  <Info size={15} />
                  General Information
                </h3>
                {selectedAlert && (
                  <dl className="ids-details-grid">
                    <div>
                      <dt>Alert ID</dt>
                      <dd>{selectedAlert.id}</dd>
                    </div>
                    <div>
                      <dt>Type</dt>
                      <dd>{selectedAlert.type}</dd>
                    </div>
                    <div>
                      <dt>Severity</dt>
                      <dd className="ids-capitalize">{selectedAlert.severity}</dd>
                    </div>
                    <div>
                      <dt>Detection score</dt>
                      <dd>{selectedAlert.score.toFixed(2)}</dd>
                    </div>
                  </dl>
                )}
              </div>

              <div className="ids-details-section">
                <h3>
                  <Network size={15} />
                  Network Information
                </h3>
                {selectedAlert && (
                  <dl className="ids-details-grid">
                    <div>
                      <dt>Source IP</dt>
                      <dd>{selectedAlert.srcIp}</dd>
                    </div>
                    <div>
                      <dt>Destination IP</dt>
                      <dd>{selectedAlert.destIp}</dd>
                    </div>
                    <div>
                      <dt>Source port</dt>
                      <dd>{selectedAlert.srcPort ?? "—"}</dd>
                    </div>
                    <div>
                      <dt>Destination port</dt>
                      <dd>{selectedAlert.destPort ?? "—"}</dd>
                    </div>
                    <div>
                      <dt>Protocol</dt>
                      <dd>{selectedAlert.protocol}</dd>
                    </div>
                    <div>
                      <dt>Sensor</dt>
                      <dd>{selectedAlert.sensor}</dd>
                    </div>
                  </dl>
                )}
              </div>

              <div className="ids-details-section">
                <h3>
                  <Lightbulb size={15} />
                  Detection Notes
                </h3>
                <p className="ids-details-text">
                  High rate of suspicious packets observed from this source
                  within a short time window. Pattern matches DDoS / brute force
                  reconnaissance profiles used against exposed services in SME
                  networks.
                </p>
              </div>
            </div>

            {/* AI Advisory Insight */}
            <div className="aegis-card ids-advisory-card">
              <div className="ids-advisory-header">
                <div className="ids-advisory-icon-wrap">
                  <Zap size={18} />
                </div>
                <div>
                  <h2 className="ids-advisory-title">AI Advisory Insight</h2>
                  <p className="ids-advisory-subtitle">
                    Next best action for this alert.
                  </p>
                </div>
              </div>
              <ul className="ids-advisory-list">
                <li>
                  <span className="ids-advisory-dot ids-advisory-dot--purple" />
                  Rate-limit the suspicious source IP on the edge firewall and
                  VPN concentrator.
                </li>
                <li>
                  <span className="ids-advisory-dot ids-advisory-dot--cyan" />
                  Enable or tighten WAF DDoS protections on exposed HTTP / HTTPS
                  services.
                </li>
                <li>
                  <span className="ids-advisory-dot ids-advisory-dot--emerald" />
                  Add indicators of compromise to the threat intel watchlist and
                  SIEM correlation rules.
                </li>
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* Explainability Tab */}
      {activeTab === "explainability" && (
        <section className="ids-explain-grid">
          {/* SHAP overview */}
          <div className="aegis-card">
            <div className="aegis-card-header">
              <h2>ML Model Explainability (SHAP)</h2>
            </div>
            <div className="ids-explain-content">
              <p>
                Aegis IDS uses SHAP values to quantify how each traffic feature
                pushes a prediction towards benign or malicious. Values shown
                here are demo data wired for UI validation.
              </p>
              <p className="ids-explain-note">
                In production, this tab will render SHAP summaries for each
                model version, enabling analysts to validate decisions and meet
                compliance expectations.
              </p>
            </div>
          </div>

          {/* Model information */}
          <div className="aegis-card">
            <div className="aegis-card-header">
              <h2>Model Information</h2>
            </div>
            <div className="ids-model-info">
              <div className="ids-model-row">
                <span>Model</span>
                <span>XGBoost (Ensemble v2)</span>
              </div>
              <div className="ids-model-row">
                <span>Macro-F1</span>
                <span className="ids-model-value">92%</span>
              </div>
              <div className="ids-model-row">
                <span>Precision</span>
                <span className="ids-model-value">90%</span>
              </div>
              <div className="ids-model-row">
                <span>Recall</span>
                <span className="ids-model-value">93%</span>
              </div>
              <div className="ids-model-row">
                <span>ROC-AUC</span>
                <span className="ids-model-value">0.97</span>
              </div>
            </div>
          </div>

          {/* Feature importance */}
          <div className="aegis-card">
            <div className="aegis-card-header">
              <h2>Feature Importance (SHAP Values)</h2>
            </div>
            <div className="ids-feature-list">
              {[
                {
                  name: "pkt_rate",
                  desc: "Packets per second within the flow window.",
                  value: 0.41,
                },
                {
                  name: "syn_ratio",
                  desc: "Ratio of SYN flags to overall packets.",
                  value: 0.36,
                },
                {
                  name: "byte_rate",
                  desc: "Bytes per second to destination.",
                  value: 0.28,
                },
                {
                  name: "flow_duration",
                  desc: "Lifetime of the flow in seconds.",
                  value: 0.19,
                },
                {
                  name: "avg_pkt_size",
                  desc: "Average packet size across the flow.",
                  value: 0.12,
                },
              ].map((f) => (
                <div key={f.name} className="ids-feature-row">
                  <div className="ids-feature-main">
                    <div className="ids-feature-name">{f.name}</div>
                    <div className="ids-feature-desc">{f.desc}</div>
                  </div>
                  <div className="ids-feature-shap">
                    <div className="ids-bar">
                      <div
                        className="ids-bar-fill ids-bar-fill--purple"
                        style={{
                          width: `${Math.min(100, f.value * 100 + 10)}%`,
                        }}
                      />
                    </div>
                    <span className="ids-bar-value">{f.value.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Example explanation */}
          <div className="aegis-card ids-explain-example">
            <div className="aegis-card-header">
              <h2>Example: DDoS SYN Flood Prediction</h2>
            </div>
            <ul className="ids-explain-example-list">
              <li>
                <span className="ids-explain-dot ids-explain-dot--purple" />
                <strong>pkt_rate:</strong> extremely high packet rate relative
                to baseline traffic on this interface.
              </li>
              <li>
                <span className="ids-explain-dot ids-explain-dot--cyan" />
                <strong>syn_ratio:</strong> majority of packets contain SYN
                flags with very few ACKs observed, consistent with half-open
                connection floods.
              </li>
              <li>
                <span className="ids-explain-dot ids-explain-dot--amber" />
                <strong>flow_duration:</strong> flows are short-lived but
                repeated towards the same destination service.
              </li>
              <li>
                <span className="ids-explain-dot ids-explain-dot--emerald" />
                <strong>byte_rate:</strong> high byte rate to port 443 across
                many parallel connections.
              </li>
            </ul>
            <p className="ids-explain-verdict">
              <strong>Verdict:</strong> feature contributions strongly support a
              DDoS SYN flood classification with high confidence, targeting a
              public-facing HTTPS service.
            </p>
          </div>
        </section>
      )}

      {/* Analytics Tab */}
      {activeTab === "analytics" && (
        <section className="ids-analytics-grid">
          {/* Alert Timeline */}
          <div className="aegis-card">
            <div className="aegis-card-header">
              <h2>Alert Timeline</h2>
              <span className="aegis-card-subtitle">
                Alerts per hour · Last 24h
              </span>
            </div>
            <div className="aegis-chart-placeholder">
              <span>
                Timeline chart placeholder — integrate with IDS metrics API.
              </span>
            </div>
          </div>

          {/* Top Source IPs */}
          <div className="aegis-card">
            <div className="aegis-card-header">
              <h2>Top Source IPs</h2>
            </div>
            <ul className="ids-top-ips-new">
              {[
                { ip: "203.0.113.45", count: 142, sensor: "Edge Firewall" },
                { ip: "198.51.100.77", count: 96, sensor: "VPN Gateway" },
                { ip: "192.0.2.200", count: 63, sensor: "Core Sensor" },
                { ip: "10.0.0.94", count: 37, sensor: "Internal Sensor" },
              ].map((item) => (
                <li key={item.ip} className="ids-top-ip-item">
                  <div className="ids-top-ip-left">
                    <span className="ids-top-ip-dot" />
                    <div>
                      <p className="ids-top-ip-address">{item.ip}</p>
                      <p className="ids-top-ip-sensor">{item.sensor}</p>
                    </div>
                  </div>
                  <span className="ids-top-ip-count">{item.count} alerts</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Confidence distribution */}
          <div className="aegis-card">
            <div className="aegis-card-header">
              <h2>Confidence Score Distribution</h2>
              <span className="aegis-card-subtitle">
                Histogram of model score buckets
              </span>
            </div>
            <div className="aegis-chart-placeholder">
              <span>Histogram placeholder — plug in model score distribution.</span>
            </div>
          </div>

          {/* Model performance table */}
          <div className="aegis-card ids-metrics-table-card">
            <div className="aegis-card-header">
              <h2>IDS Model Performance</h2>
            </div>
            <table className="ids-metrics-table">
              <thead>
                <tr>
                  <th>Model</th>
                  <th>Macro-F1</th>
                  <th>Precision</th>
                  <th>Recall</th>
                  <th>ROC-AUC</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    name: "XGBoost Baseline",
                    f1: "0.89",
                    precision: "0.88",
                    recall: "0.90",
                    auc: "0.95",
                  },
                  {
                    name: "XGBoost Ensemble v2",
                    f1: "0.92",
                    precision: "0.90",
                    recall: "0.93",
                    auc: "0.97",
                  },
                  {
                    name: "CNN-LSTM Prototype",
                    f1: "0.90",
                    precision: "0.89",
                    recall: "0.91",
                    auc: "0.96",
                  },
                ].map((m) => (
                  <tr key={m.name}>
                    <td>{m.name}</td>
                    <td>{m.f1}</td>
                    <td>{m.precision}</td>
                    <td>{m.recall}</td>
                    <td>{m.auc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Threat Intel Tab */}
      {activeTab === "threat-intel" && (
        <section className="ids-intel-grid">
          {/* AI powered threat analysis */}
          <div className="aegis-card">
            <div className="aegis-card-header">
              <h2>AI-Powered Threat Analysis</h2>
            </div>
            <div className="ids-intel-grid-mini">
              <div className="ids-intel-card">
                <p className="ids-intel-card-label">Most prevalent attack</p>
                <p className="ids-intel-card-value">DDoS / Flooding</p>
                <p className="ids-intel-card-meta">46% of malicious traffic.</p>
              </div>
              <div className="ids-intel-card">
                <p className="ids-intel-card-label">Attack types detected</p>
                <p className="ids-intel-card-value ids-intel-card-value--sky">7</p>
                <p className="ids-intel-card-meta">Across L3–L7 telemetry.</p>
              </div>
              <div className="ids-intel-card">
                <p className="ids-intel-card-label">Total incidents (24h)</p>
                <p className="ids-intel-card-value">2,934</p>
                <p className="ids-intel-card-meta ids-intel-card-meta--emerald">
                  +18.4% vs previous day.
                </p>
              </div>
              <div className="ids-intel-card">
                <p className="ids-intel-card-label">High severity incidents</p>
                <p className="ids-intel-card-value ids-intel-card-value--red">124</p>
                <p className="ids-intel-card-meta">
                  Prioritized for immediate triage.
                </p>
              </div>
            </div>
          </div>

          {/* Recommended actions */}
          <div className="aegis-card">
            <div className="aegis-card-header">
              <h2>Recommended Security Actions</h2>
            </div>
            <ul className="ids-intel-list">
              <li>
                <span className="ids-intel-dot ids-intel-dot--purple" />
                Enforce rate-limiting and connection caps on public ingress
                points receiving DDoS-like traffic.
              </li>
              <li>
                <span className="ids-intel-dot ids-intel-dot--cyan" />
                Enable deeper L7 inspection on VPN and remote-access gateways
                to catch credential stuffing and brute-force attempts.
              </li>
              <li>
                <span className="ids-intel-dot ids-intel-dot--emerald" />
                Push high-risk indicators to firewall, WAF, and EDR policies via
                automated playbooks.
              </li>
              <li>
                <span className="ids-intel-dot ids-intel-dot--amber" />
                Schedule targeted threat-hunting sessions on DNS tunnels and
                suspicious long-lived flows.
              </li>
            </ul>
          </div>

          {/* Known malicious IPs */}
          <div className="aegis-card">
            <div className="aegis-card-header">
              <h2>Known Malicious IPs (Demo)</h2>
              <span className="aegis-card-subtitle">
                Ready to integrate AbuseIPDB / external feeds
              </span>
            </div>
            <table className="ids-metrics-table">
              <thead>
                <tr>
                  <th>IP Address</th>
                  <th>First seen</th>
                  <th>Last seen</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    ip: "203.0.113.45",
                    first: "2025-03-01",
                    last: "2025-03-09",
                    status: "Blocked at edge",
                    statusClass: "ids-status-badge ids-status-badge--red",
                  },
                  {
                    ip: "198.51.100.77",
                    first: "2025-02-12",
                    last: "2025-03-08",
                    status: "Under watch",
                    statusClass: "ids-status-badge ids-status-badge--amber",
                  },
                  {
                    ip: "192.0.2.200",
                    first: "2025-03-05",
                    last: "2025-03-09",
                    status: "Repeated DNS tunnel",
                    statusClass: "ids-status-badge ids-status-badge--purple",
                  },
                ].map((row) => (
                  <tr key={row.ip}>
                    <td>{row.ip}</td>
                    <td>{row.first}</td>
                    <td>{row.last}</td>
                    <td>
                      <span className={row.statusClass}>{row.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MITRE / CVEs */}
          <div className="aegis-card">
            <div className="aegis-card-header">
              <h2>Attack Signatures & MITRE ATT&CK</h2>
            </div>
            <ul className="ids-intel-list">
              <li>
                <span className="ids-intel-dot ids-intel-dot--purple" />
                <strong>DDoS / Resource Exhaustion</strong> — MITRE ATT&CK{" "}
                <code>T1499</code> (Endpoint Denial-of-Service).
              </li>
              <li>
                <span className="ids-intel-dot ids-intel-dot--cyan" />
                <strong>Credential Access / Brute Force</strong> — MITRE ATT&CK{" "}
                <code>T1110</code> (Brute Force) on VPN + SSH surfaces.
              </li>
              <li>
                <span className="ids-intel-dot ids-intel-dot--emerald" />
                <strong>Command & Control over DNS</strong> — MITRE ATT&CK{" "}
                <code>T1071.004</code> (Application Layer Protocol: DNS).
              </li>
              <li>
                <span className="ids-intel-dot ids-intel-dot--amber" />
                <strong>Reconnaissance / Network Scanning</strong> — MITRE ATT&CK{" "}
                <code>T1046</code> (Network Service Discovery).
              </li>
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}

export default IDSPage;

// src/pages/IDSPage.jsx

import React, { useState, useMemo } from "react";
import "../index.css";

const ALERTS = [
  {
    id: "OB-109",
    type: "DDoS Attempt",
    severity: "High",
    timestamp: "2025-10-19 14:23:08",
    srcIp: "192.168.1.5",
    destIp: "10.0.0.15",
    srcPort: "443",
    destPort: "80",
    protocol: "TCP",
    label: "SQL_INJECTION",
    score: 0.94,
    source: "Edge Firewall",
    description:
      "Unusually high volume of SYN packets targeting web front-end, matching known DDoS patterns.",
    recommendation:
      "Rate-limit traffic from this source, enable WAF rules for HTTP floods, and monitor for 15 minutes.",
  },
  {
    id: "OB-130",
    type: "DNS Tunnel",
    severity: "Medium",
    timestamp: "2025-10-19 14:23:11",
    srcIp: "172.16.5.11",
    destIp: "10.0.0.22",
    srcPort: "51432",
    destPort: "53",
    protocol: "UDP",
    label: "DNS_TUNNEL",
    score: 0.81,
    source: "Branch Office",
    description:
      "Suspicious DNS query patterns with long subdomains indicating possible data exfiltration via DNS tunneling.",
    recommendation:
      "Block suspicious domains, inspect DNS logs for similar activity, and review the host for malware.",
  },
  {
    id: "OB-121",
    type: "Ping Sweep",
    severity: "Low",
    timestamp: "2025-10-19 14:23:14",
    srcIp: "10.0.0.7",
    destIp: "10.0.0.8",
    srcPort: "-",
    destPort: "-",
    protocol: "ICMP",
    label: "PING_SWEEP",
    score: 0.67,
    source: "Internal Subnet",
    description:
      "Sequential ICMP echo requests across internal address range, likely network discovery.",
    recommendation:
      "Verify if this matches scheduled scanning. If not, flag the host for review in the next pentest window.",
  },
];

function IDSPage() {
  const [activeTab, setActiveTab] = useState("live");
  const [selectedAlertId, setSelectedAlertId] = useState(ALERTS[0].id);

  const selectedAlert = useMemo(
    () => ALERTS.find((a) => a.id === selectedAlertId),
    [selectedAlertId]
  );

  return (
    <div className="aegis-page">
      {/* ---------- PAGE HEADER ---------- */}
      <header className="ids-header">
        <div>
          <h1 className="aegis-dash-title">Intrusion Detection System</h1>
          <p className="aegis-dash-subtitle">
            Live network threat intelligence — detection, explainability, and
            performance metrics.
          </p>
          <p className="ids-last-updated">
            Last updated <span className="ids-green-dot" /> 8s ago
          </p>
        </div>

        <div className="ids-header-right">
          <div className="ids-status-pill">
            <span className="ids-status-dot" />
            IDS Healthy · SME Network
          </div>
          <button className="ids-pentest-btn cursor-hotspot-action">
            + Run Pentest
          </button>
        </div>
      </header>

      {/* ---------- TAB SWITCHER ---------- */}
      <div className="ids-tab-row">
        <button
          className={`ids-tab ${
            activeTab === "live" ? "ids-tab--active" : ""
          }`}
          onClick={() => setActiveTab("live")}
        >
          Live Alerts
        </button>
        <button
          className={`ids-tab ${
            activeTab === "explain" ? "ids-tab--active" : ""
          }`}
          onClick={() => setActiveTab("explain")}
        >
          Explainability
        </button>
        <button
          className={`ids-tab ${
            activeTab === "metrics" ? "ids-tab--active" : ""
          }`}
          onClick={() => setActiveTab("metrics")}
        >
          Metrics
        </button>
      </div>

      {/* ---------- LIVE ALERTS TAB ---------- */}
      {activeTab === "live" && (
        <>
          <section className="ids-live-grid">
            {/* LEFT: table + chart */}
            <div className="ids-left-stack">
              {/* Live Alerts Feed */}
              <div className="aegis-card ids-left-card">
                <div className="aegis-card-header ids-card-header-row">
                  <div>
                    <h2>Live Alerts Feed</h2>
                    <span className="aegis-card-subtitle">
                      Streaming from AEGIS IDS sensors.
                    </span>
                  </div>
                </div>

                {/* search + filter row */}
                <div className="ids-table-controls">
                  <input
                    className="ids-search-input"
                    placeholder="Search by IP, label, or ID..."
                  />
                  <select className="ids-select">
                    <option>Severity</option>
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>

                {/* table */}
                <div className="ids-table-wrapper">
                  <table className="ids-table">
                    <thead>
                      <tr>
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
                      {ALERTS.map((alert) => {
                        const sevClass =
                          alert.severity.toLowerCase() === "high"
                            ? "sev-high"
                            : alert.severity.toLowerCase() === "medium"
                            ? "sev-medium"
                            : "sev-low";

                        const isSelected = alert.id === selectedAlertId;

                        return (
                          <tr
                            key={alert.id}
                            className={`ids-row ${
                              isSelected ? "ids-row--selected" : ""
                            }`}
                            onClick={() => setSelectedAlertId(alert.id)}
                          >
                            <td>{alert.timestamp}</td>
                            <td>{alert.srcIp}</td>
                            <td>{alert.destIp}</td>
                            <td>{alert.protocol}</td>
                            <td>{alert.label}</td>
                            <td>{alert.score.toFixed(2)}</td>
                            <td>
                              <span className={`sev ${sevClass}`}>
                                {alert.severity}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Alert frequency chart placeholder */}
              <div className="aegis-card ids-chart-card">
                <div className="aegis-card-header ids-card-header-row">
                  <h2>Alert Frequency (Last 60s)</h2>
                  <span className="aegis-card-subtitle">
                    Peaks indicate bursts of suspicious activity.
                  </span>
                </div>
                <div className="aegis-chart-placeholder">
                  <span>Chart placeholder — plug in your timeseries later.</span>
                </div>
              </div>
            </div>

            {/* RIGHT: selected alert summary + details + AI insight */}
            <div className="ids-right-stack">
              {/* Selected alert summary card */}
              <div className="aegis-card ids-selected-summary">
                <div className="ids-selected-header">
                  <div>
                    <span className="ids-selected-label">Selected Alert</span>
                    <h2 className="ids-selected-title">
                      {selectedAlert.id} · {selectedAlert.type}
                    </h2>
                    <p className="ids-selected-meta">
                      {selectedAlert.timestamp} · {selectedAlert.source}
                    </p>
                  </div>
                  <span
                    className={`sev ids-selected-pill ${
                      selectedAlert.severity.toLowerCase() === "high"
                        ? "sev-high"
                        : selectedAlert.severity.toLowerCase() === "medium"
                        ? "sev-medium"
                        : "sev-low"
                    }`}
                  >
                    {selectedAlert.severity}
                  </span>
                </div>
              </div>

              {/* Alert Details */}
              <div className="aegis-card ids-details-card">
                <h2 className="ids-details-title">Alert Details</h2>

                <div className="ids-details-section">
                  <h3>📘 General Information</h3>
                  <ul>
                    <li>
                      <strong>Alert ID:</strong> {selectedAlert.id}
                    </li>
                    <li>
                      <strong>Type:</strong> {selectedAlert.type}
                    </li>
                    <li>
                      <strong>Severity:</strong> {selectedAlert.severity}
                    </li>
                    <li>
                      <strong>Label:</strong> {selectedAlert.label}
                    </li>
                    <li>
                      <strong>Detection Score:</strong>{" "}
                      {selectedAlert.score.toFixed(2)}
                    </li>
                  </ul>
                </div>

                <div className="ids-details-section">
                  <h3>🌐 Network Information</h3>
                  <ul>
                    <li>
                      <strong>Source IP:</strong> {selectedAlert.srcIp}
                    </li>
                    <li>
                      <strong>Destination IP:</strong> {selectedAlert.destIp}
                    </li>
                    <li>
                      <strong>Source Port:</strong> {selectedAlert.srcPort}
                    </li>
                    <li>
                      <strong>Destination Port:</strong>{" "}
                      {selectedAlert.destPort}
                    </li>
                    <li>
                      <strong>Protocol:</strong> {selectedAlert.protocol}
                    </li>
                    <li>
                      <strong>Sensor:</strong> {selectedAlert.source}
                    </li>
                  </ul>
                </div>

                <div className="ids-details-section">
                  <h3>🧠 Detection Notes</h3>
                  <p className="ids-details-text">
                    {selectedAlert.description}
                  </p>
                </div>
              </div>

              {/* AI Advisory Insight */}
              <div className="aegis-card ids-advisory-card">
                <div className="ids-advisory-header">
                  <div className="ids-advisory-icon">⚡</div>
                  <div>
                    <h2 className="ids-advisory-title">AI Advisory Insight</h2>
                    <p className="ids-advisory-subtitle">
                      Next best action based on current alert.
                    </p>
                  </div>
                </div>
                <p className="ids-advisory-text">
                  {selectedAlert.recommendation}
                </p>
                <button className="ids-advisory-btn cursor-hotspot-action">
                  Open in Advisor
                </button>
              </div>
            </div>
          </section>
        </>
      )}

      {/* ---------- EXPLAINABILITY TAB ---------- */}
      {activeTab === "explain" && (
        <section className="aegis-card ids-placeholder">
          <h2>Explainability Module</h2>
          <p>
            This will surface SHAP values, top contributing features, and model
            reasoning for each alert.
          </p>
        </section>
      )}

      {/* ---------- METRICS TAB ---------- */}
      {activeTab === "metrics" && (
        <section className="aegis-card ids-placeholder">
          <h2>Performance Metrics</h2>
          <p>
            Track detection latency, throughput, false positives, and coverage
            per sensor here.
          </p>
        </section>
      )}
    </div>
  );
}

export default IDSPage;

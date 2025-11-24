import React, { useState } from "react";
import "../index.css";
import RecentAlertCard from "../components/alerts/RecentAlertCard.jsx";

function IDSPage() {
  const [activeTab, setActiveTab] = useState("live");

  return (
    <div className="aegis-page">
      <header className="ids-header">
        <div>
          <h1 className="aegis-dash-title">Intrusion Detection System</h1>
          <p className="aegis-dash-subtitle">
            Live network threat intelligence — detection, explainability, and performance metrics.
          </p>
          <p className="ids-last-updated">
            Last updated <span className="ids-green-dot" /> 8s ago
          </p>
        </div>

        <button className="ids-pentest-btn">+ Run Pentest</button>
      </header>

      <div className="ids-tab-row">
        <button
          className={`ids-tab ${activeTab === "live" ? "ids-tab--active" : ""}`}
          onClick={() => setActiveTab("live")}
        >
          Live Alerts
        </button>
        <button
          className={`ids-tab ${activeTab === "explain" ? "ids-tab--active" : ""}`}
          onClick={() => setActiveTab("explain")}
        >
          Explainability
        </button>
        <button
          className={`ids-tab ${activeTab === "metrics" ? "ids-tab--active" : ""}`}
          onClick={() => setActiveTab("metrics")}
        >
          Metrics
        </button>
      </div>

      {activeTab === "live" && (
        <section className="ids-live-grid">
          <div className="aegis-card ids-left">
            <div className="aegis-card-header">
              <h2>Live Alerts Feed</h2>
            </div>

            <div className="ids-table-controls">
              <input className="ids-search-input" placeholder="Search..." />
              <select className="ids-select">
                <option>Severity</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>

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
                  <tr>
                    <td>2025-10-19 14:23:08</td>
                    <td>192.168.1.5</td>
                    <td>10.0.0.15</td>
                    <td>TCP</td>
                    <td>SQL_INJECTION</td>
                    <td>0.94</td>
                    <td>
                      <span className="sev sev-high">High</span>
                    </td>
                  </tr>
                  <tr>
                    <td>2025-10-19 14:23:11</td>
                    <td>172.16.5.11</td>
                    <td>10.0.0.22</td>
                    <td>UDP</td>
                    <td>DNS_TUNNEL</td>
                    <td>0.81</td>
                    <td>
                      <span className="sev sev-medium">Medium</span>
                    </td>
                  </tr>
                  <tr>
                    <td>2025-10-19 14:23:14</td>
                    <td>10.0.0.7</td>
                    <td>10.0.0.8</td>
                    <td>ICMP</td>
                    <td>PING_SWEEP</td>
                    <td>0.67</td>
                    <td>
                      <span className="sev sev-low">Low</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="ids-right">
            <div className="ids-selected-alert">
              <RecentAlertCard
                id="OB 109"
                title="DDoS Attempt"
                severity="High"
                time="Detected 2 min ago"
                source="Edge Firewall"
              />
            </div>

            <div className="aegis-card ids-details-card">
              <h2 className="ids-details-title">Alert Details</h2>

              <div className="ids-details-section">
                <h3>📘 General Information</h3>
                <ul>
                  <li>
                    <strong>Alert ID:</strong> OB-109
                  </li>
                  <li>
                    <strong>Type:</strong> DDoS Attempt
                  </li>
                  <li>
                    <strong>Severity:</strong> High
                  </li>
                </ul>
              </div>

              <div className="ids-details-section">
                <h3>🌐 Network Information</h3>
                <ul>
                  <li>
                    <strong>Source IP:</strong> 192.168.1.47
                  </li>
                  <li>
                    <strong>Destination IP:</strong> 10.0.0.5
                  </li>
                  <li>
                    <strong>Protocol:</strong> TCP
                  </li>
                  <li>
                    <strong>Timestamp:</strong> 2025-10-19 14:23:08
                  </li>
                </ul>
              </div>
            </div>

            <div className="aegis-card ids-advisory-card">
              <h2 className="ids-advisory-title">AI Advisory Insight</h2>
              <p className="ids-advisory-text">
                Anomalous SYN packet frequency detected.
              </p>
              <p className="ids-advisory-text-bold">
                Recommendation:
                <br />
                Block source IP: <strong>192.168.1.47</strong> and monitor port 80 for 5 min.
              </p>
            </div>
          </div>
        </section>
      )}

      {activeTab === "explain" && (
        <section className="aegis-card ids-placeholder">
          <h2>Explainability Module</h2>
          <p>This will show SHAP values, feature importance, and reasoning from your ML model.</p>
        </section>
      )}

      {activeTab === "metrics" && (
        <section className="aegis-card ids-placeholder">
          <h2>Performance Metrics</h2>
          <p>Latency, detection speed, false positives, throughput, etc.</p>
        </section>
      )}
    </div>
  );
}

export default IDSPage;



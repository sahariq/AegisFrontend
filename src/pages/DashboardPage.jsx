import React from "react";
import "../index.css";
import {
  Bell,
  UserRound,
  Shield,
  Activity,
  Clock3,
  Lightbulb,
  ChevronDown,
} from "lucide-react";
import RecentAlertCard from "../components/alerts/RecentAlertCard.jsx";

function StatCard({ label, value, delta, trend = "neutral", Icon }) {
  return (
    <div className="aegis-stat-card">
      <div className="aegis-stat-meta">
        <div className="aegis-stat-icon">
          <Icon size={18} strokeWidth={1.6} />
        </div>
        <span className="aegis-stat-label">{label}</span>
      </div>
      <div className="aegis-stat-main-row">
        <span className="aegis-stat-value">{value}</span>
        <span className={`aegis-stat-chip aegis-stat-chip--${trend}`}>{delta}</span>
      </div>
    </div>
  );
}

function DashboardPage() {
  return (
    <div className="aegis-page">
      <header className="aegis-dash-header">
        <div>
          <h1 className="aegis-dash-title">Welcome Back, Sahar</h1>
          <p className="aegis-dash-subtitle">
            Your SME security overview and system activity summary.
          </p>
        </div>
        <div className="aegis-dash-header-actions">
          <div className="aegis-env-pill">
            <span className="aegis-env-dot" />
            <span>Environment: Production · IDS Healthy</span>
          </div>
          <button className="aegis-header-icon-btn" aria-label="Notifications">
            <Bell size={18} aria-hidden="true" />
          </button>
          <button className="aegis-header-icon-btn" aria-label="Account">
            <UserRound size={18} aria-hidden="true" />
          </button>
        </div>
      </header>

      <section className="aegis-dash-top-row">
        <StatCard label="Active Alerts" value="37" delta="+12.4%" trend="up" Icon={Shield} />
        <StatCard label="Threats Blocked" value="524" delta="+17.9%" trend="up" Icon={Activity} />
        <StatCard label="Avg. Response Time" value="2.3s" delta="-12.4%" trend="down" Icon={Clock3} />
        <StatCard label="Advisor Suggestions" value="19" delta="+5.7%" trend="up" Icon={Lightbulb} />
      </section>

      <section className="aegis-dash-main-grid">
        <div className="aegis-dash-left-col">
          <div className="aegis-card">
            <div className="aegis-card-header">
              <div>
                <h2>Threats Detected</h2>
                <span className="aegis-card-subtitle">
                  Connect your telemetry feeds for richer insights.
                </span>
              </div>
              <button className="aegis-pill-switch" type="button">
                Last 12 months <ChevronDown size={14} aria-hidden="true" />
              </button>
            </div>
            <div className="aegis-chart-placeholder">
              <div className="aegis-chart-empty">
                <p className="aegis-chart-empty-title">Chart placeholder</p>
                <p className="aegis-chart-empty-copy">
                  Connect the IDS API to visualize detections over time.
                </p>
              </div>
            </div>
          </div>

          <div className="aegis-card">
            <div className="aegis-card-header">
              <div>
                <h2>Pentesting Summary</h2>
                <p className="aegis-card-subtext">
                  Last 7 pentests · click a row to open full report
                </p>
              </div>
            </div>
            <div className="aegis-table-wrapper">
              <table className="aegis-table">
                <thead>
                  <tr>
                    <th>Test</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Severity</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>OB 123</td>
                    <td>Network</td>
                    <td>
                      <span className="aegis-status-pill aegis-status-pill--success">
                        Completed
                      </span>
                    </td>
                    <td className="aegis-table-severity">
                      <span className="sev sev-low">Low</span>
                    </td>
                  </tr>
                  <tr>
                    <td>PT 108</td>
                    <td>Firewall</td>
                    <td>
                      <span className="aegis-status-pill aegis-status-pill--success">
                        Completed
                      </span>
                    </td>
                    <td className="aegis-table-severity">
                      <span className="sev sev-medium">Medium</span>
                    </td>
                  </tr>
                  <tr>
                    <td>PT 107</td>
                    <td>IDS Scan</td>
                    <td>
                      <span className="aegis-status-pill aegis-status-pill--success">
                        Completed
                      </span>
                    </td>
                    <td className="aegis-table-severity">
                      <span className="sev sev-low">Low</span>
                    </td>
                  </tr>
                  <tr>
                    <td>OB 106</td>
                    <td>IDS Scan</td>
                    <td>
                      <span className="aegis-status-pill aegis-status-pill--pending">
                        Pending
                      </span>
                    </td>
                    <td className="aegis-table-severity">
                      <span className="sev sev-high">High</span>
                    </td>
                  </tr>
                  <tr>
                    <td>PT 099</td>
                    <td>Web App</td>
                    <td>
                      <span className="aegis-status-pill aegis-status-pill--error">
                        Failed
                      </span>
                    </td>
                    <td className="aegis-table-severity">
                      <span className="sev sev-high">High</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="aegis-dash-right-col">
          <div className="aegis-card aegis-advisory-card">
            <div className="aegis-advisory-tag">Configuration · TLS</div>
            <div className="aegis-advisory-header">
              <div className="aegis-advisory-icon">
                <span>⚡</span>
              </div>
              <div>
                <h2 className="aegis-advisory-title">Advisory Insights</h2>
                <p className="aegis-advisory-subtitle">
                  TLS version mismatch between edge and core clusters. Update
                  cipher suite to enforce TLS 1.3.
                </p>
              </div>
            </div>
            <button className="aegis-advisory-btn">View in Advisor</button>
          </div>

          <div className="aegis-card">
            <div className="aegis-card-header">
              <h2>Recent Alerts</h2>
              <button className="aegis-inline-link" type="button">
                View all
              </button>
            </div>
            <div className="aegis-alerts-list">
              <RecentAlertCard
                id="OB 109"
                title="DDoS Attempt"
                severity="High"
                time="Detected 2 min ago"
                source="Edge Firewall"
              />
              <RecentAlertCard
                id="OB 130"
                title="DDoS Attempt"
                severity="High"
                time="Detected 3 min ago"
                source="Reverse Proxy"
              />
              <RecentAlertCard
                id="OB 110"
                title="DNS Tunnel"
                severity="Medium"
                time="Detected 4 min ago"
                source="Branch Office"
              />
              <RecentAlertCard
                id="OB 121"
                title="Ping Sweep"
                severity="Low"
                time="Detected 5 min ago"
                source="Internal Subnet"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default DashboardPage;



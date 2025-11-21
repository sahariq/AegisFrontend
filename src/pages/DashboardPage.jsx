import React from "react";
import "../index.css";
import aegisLogo from "../assets/aegis-logo.png";

function DashboardSidebar() {
  return (
    <aside className="aegis-dash-sidebar">
      <div className="aegis-dash-logo-wrap">
        <img src={aegisLogo} alt="AEGIS logo" className="aegis-dash-logo" />
      </div>

      <div className="aegis-dash-search">
        <input className="aegis-dash-search-input" placeholder="Search for..." />
      </div>

      <nav className="aegis-dash-nav">
        <button className="aegis-dash-nav-item aegis-dash-nav-item--active">
          Dashboard
        </button>
        <button className="aegis-dash-nav-item">IDS Alerts</button>
        <button className="aegis-dash-nav-item">Pentesting</button>
        <button className="aegis-dash-nav-item">Advisor Chatbot</button>
        <button className="aegis-dash-nav-item">Settings</button>
      </nav>
    </aside>
  );
}

function StatCard({ label, value, delta, accentClass }) {
  return (
    <div className="aegis-stat-card">
      <div className="aegis-stat-label">{label}</div>
      <div className="aegis-stat-main-row">
        <span className="aegis-stat-value">{value}</span>
        <span className={`aegis-stat-chip ${accentClass}`}>{delta}</span>
      </div>
    </div>
  );
}

function RecentAlertCard({ id, title, severity, time, colorClass }) {
  return (
    <div className={`aegis-alert-card ${colorClass}`}>
      <div className="aegis-alert-id">{id}</div>
      <div className="aegis-alert-body">
        <div className="aegis-alert-title">{title}</div>
        <div className="aegis-alert-meta">{time}</div>
      </div>
      <div className={`aegis-alert-severity aegis-alert-severity--${severity.toLowerCase()}`}>
        {severity}
      </div>
    </div>
  );
}

function DashboardPage() {
  return (
    <div className="aegis-dash-root">
      <DashboardSidebar />

      <main className="aegis-dash-main">
        <header className="aegis-dash-header">
          <div>
            <h1 className="aegis-dash-title">Welcome Back, Sahar</h1>
            <p className="aegis-dash-subtitle">
              Your SME security overview and system activity summary.
            </p>
          </div>
          <div className="aegis-dash-header-actions">
            <button className="aegis-header-icon-btn">🔔</button>
            <button className="aegis-header-icon-btn">👤</button>
          </div>
        </header>

        <section className="aegis-dash-top-row">
          <StatCard label="Active Alerts" value="37" delta="+12.4% ↑" accentClass="aegis-accent-blue" />
          <StatCard label="Threats Blocked" value="524" delta="+17.9% ↑" accentClass="aegis-accent-green" />
          <StatCard label="Avg. Response Time" value="2.3s" delta="-12.4% ↓" accentClass="aegis-accent-red" />
          <StatCard label="Advisor Suggestions" value="19" delta="+5.7% ↑" accentClass="aegis-accent-teal" />
        </section>

        <section className="aegis-dash-main-grid">
          <div className="aegis-dash-left-col">
            <div className="aegis-card">
              <div className="aegis-card-header">
                <h2>Threats Detected</h2>
                <span className="aegis-card-subtitle">Last 12 months</span>
              </div>
              <div className="aegis-chart-placeholder">
                <span>Chart placeholder</span>
              </div>
            </div>

            <div className="aegis-card">
              <div className="aegis-card-header">
                <h2>Pentesting Summary</h2>
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
                      <td>Completed</td>
                      <td>
                        <span className="sev sev-low">Low</span>
                      </td>
                    </tr>
                    <tr>
                      <td>PT 108</td>
                      <td>Firewall</td>
                      <td>Completed</td>
                      <td>
                        <span className="sev sev-medium">Medium</span>
                      </td>
                    </tr>
                    <tr>
                      <td>PT 107</td>
                      <td>IDS Scan</td>
                      <td>Completed</td>
                      <td>
                        <span className="sev sev-low">Low</span>
                      </td>
                    </tr>
                    <tr>
                      <td>OB 106</td>
                      <td>IDS Scan</td>
                      <td>Pending</td>
                      <td>
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
              <div className="aegis-card-header">
                <h2>Advisory Insights</h2>
              </div>
              <p className="aegis-advisory-text">
                TLS version outdated – patching recommended.
              </p>
              <button className="aegis-advisory-btn">View in Advisor</button>
            </div>

            <div className="aegis-card">
              <div className="aegis-card-header">
                <h2>Recent Alerts</h2>
              </div>
              <div className="aegis-alerts-list">
                <RecentAlertCard
                  id="OB 109"
                  title="DDoS Attempt"
                  severity="High"
                  time="Detected 2 min ago"
                  colorClass="aegis-alert-red"
                />
                <RecentAlertCard
                  id="OB 130"
                  title="DDoS Attempt"
                  severity="High"
                  time="Detected 3 min ago"
                  colorClass="aegis-alert-red"
                />
                <RecentAlertCard
                  id="OB 110"
                  title="DNS Tunnel"
                  severity="Medium"
                  time="Detected 4 min ago"
                  colorClass="aegis-alert-yellow"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default DashboardPage;



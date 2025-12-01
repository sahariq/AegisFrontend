// src/pages/IDSPage.jsx

import React, { useMemo, useState, useEffect } from "react";
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
import {
  getMetricsOverview,
  getSystemStatus,
  fetchAlerts,
  getExplanation
} from "../api/aegisClient.ts";

// --- Demo data (fallback for when API is unavailable) ----------------------

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
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");

  // API state
  const [metrics, setMetrics] = useState(null);
  const [systemStatus, setSystemStatus] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [alertsPagination, setAlertsPagination] = useState(null);
  const [selectedAlertId, setSelectedAlertId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Explainability state
  const [detectionIdInput, setDetectionIdInput] = useState("");
  const [explanation, setExplanation] = useState(null);
  const [explanationLoading, setExplanationLoading] = useState(false);
  const [explanationError, setExplanationError] = useState(null);

  // Load Overview data
  useEffect(() => {
    if (activeTab !== "overview" && activeTab !== "analytics") return;

    async function loadOverviewData() {
      try {
        setLoading(true);
        setError(null);

        const [metricsData, statusData] = await Promise.all([
          getMetricsOverview(),
          getSystemStatus()
        ]);

        setMetrics(metricsData);
        setSystemStatus(statusData);
      } catch (err) {
        setError(err.message);
        console.error('Failed to load overview data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadOverviewData();
  }, [activeTab]);

  // Load Live Alerts data
  useEffect(() => {
    if (activeTab !== "live-alerts") return;

    async function loadAlerts() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetchAlerts({
          page: 1,
          page_size: 20,
          ...(severityFilter !== "all" && { severity: severityFilter })
        });

        setAlerts(response.alerts);
        setAlertsPagination(response.meta);
        if (response.alerts.length > 0 && !selectedAlertId) {
          setSelectedAlertId(response.alerts[0].id);
        }
      } catch (err) {
        setError(err.message);
        console.error('Failed to load alerts:', err);
        // Fallback to mock data
        setAlerts(mockAlerts);
      } finally {
        setLoading(false);
      }
    }

    loadAlerts();
  }, [activeTab, severityFilter]);

  // Polling for Live Alerts
  useEffect(() => {
    if (activeTab !== "live-alerts" || !autoRefresh) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetchAlerts({
          page: 1,
          page_size: 20,
          ...(severityFilter !== "all" && { severity: severityFilter })
        });

        setAlerts(response.alerts);
        setAlertsPagination(response.meta);
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [activeTab, autoRefresh, severityFilter]);

  // Handle explanation lookup
  async function handleGetExplanation() {
    if (!detectionIdInput.trim()) {
      setExplanationError("Please enter a detection ID");
      return;
    }

    try {
      setExplanationLoading(true);
      setExplanationError(null);

      const result = await getExplanation(detectionIdInput.trim());
      setExplanation(result);
    } catch (err) {
      if (err.message.includes("EXPLANATION_NOT_AVAILABLE")) {
        setExplanationError("Explanation not yet available for this detection");
      } else if (err.message.includes("DETECTION_NOT_FOUND")) {
        setExplanationError("Detection ID not found");
      } else {
        setExplanationError(err.message);
      }
      setExplanation(null);
    } finally {
      setExplanationLoading(false);
    }
  }

  const totalAlerts = metrics?.total_alerts || alerts.length || mockAlerts.length;
  const highCount = metrics?.severity_counts?.high || alerts.filter((a) => a.severity === "high").length;
  const mediumCount = metrics?.severity_counts?.medium || alerts.filter((a) => a.severity === "medium").length;
  const lowCount = metrics?.severity_counts?.low || alerts.filter((a) => a.severity === "low").length;

  const selectedAlert = useMemo(
    () => alerts.find((a) => a.id === selectedAlertId) || alerts[0] || mockAlerts[0],
    [selectedAlertId, alerts]
  );

  const filteredAlerts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const alertsToFilter = alerts.length > 0 ? alerts : mockAlerts;

    return alertsToFilter.filter((alert) => {
      const matchesSeverity =
        severityFilter === "all" || alert.severity === severityFilter;
      const matchesSearch =
        term.length === 0 ||
        alert.id.toLowerCase().includes(term) ||
        (alert.source_ip || alert.srcIp || "").toLowerCase().includes(term) ||
        (alert.destination_ip || alert.destIp || "").toLowerCase().includes(term) ||
        (alert.attack_type || alert.label || "").toLowerCase().includes(term) ||
        (alert.type || "").toLowerCase().includes(term);
      return matchesSeverity && matchesSearch;
    });
  }, [searchTerm, severityFilter, alerts]);

  return (
    <div className="aegis-page">
      {/* Header */}
      <header className="ids-header-new">
        <div>
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
                  {metrics?.attack_counts ? (
                    Object.entries(metrics.attack_counts).map(([label, value], index) => {
                      const total = Object.values(metrics.attack_counts).reduce((a, b) => a + b, 0);
                      const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                      const colors = ["ids-bar-fill--purple", "ids-bar-fill--cyan", "ids-bar-fill--amber", "ids-bar-fill--slate"];

                      return (
                        <div key={label} className="ids-bar-row">
                          <span style={{ textTransform: 'capitalize' }}>{label.replace(/_/g, ' ')}</span>
                          <div className="ids-bar">
                            <div
                              className={`ids-bar-fill ${colors[index % colors.length]}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="ids-bar-value">{percentage}%</span>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ padding: '1rem', color: '#888', fontStyle: 'italic' }}>
                      No attack data available
                    </div>
                  )}
                </div>

                {/* Severity Distribution */}
                <div className="ids-dist-section">
                  <div className="ids-dist-section-title">
                    <ShieldAlert size={16} />
                    Severity Distribution
                  </div>
                  {metrics?.severity_counts ? (
                    Object.entries(metrics.severity_counts).map(([label, value]) => {
                      const total = Object.values(metrics.severity_counts).reduce((a, b) => a + b, 0);
                      const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                      let color = "ids-bar-fill--slate";
                      if (label === "high") color = "ids-bar-fill--red";
                      if (label === "medium") color = "ids-bar-fill--amber";
                      if (label === "low") color = "ids-bar-fill--green";

                      return (
                        <div key={label} className="ids-bar-row">
                          <span style={{ textTransform: 'capitalize' }}>{label}</span>
                          <div className="ids-bar">
                            <div
                              className={`ids-bar-fill ${color}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="ids-bar-value">{percentage}%</span>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ padding: '1rem', color: '#888', fontStyle: 'italic' }}>
                      No severity data available
                    </div>
                  )}
                </div>

                {/* Protocol Distribution - Placeholder as API doesn't provide this yet */}
                <div className="ids-dist-section">
                  <div className="ids-dist-section-title">
                    <Activity size={16} />
                    Protocol Distribution
                  </div>
                  <div style={{ padding: '0.5rem 0', color: '#666', fontSize: '0.85rem' }}>
                    Protocol statistics will be available in the next API update.
                  </div>
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
                      className={`ids-live-dot ${autoRefresh ? "ids-live-dot--on" : "ids-live-dot--off"
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
                      className={`ids-toggle ${autoRefresh ? "ids-toggle--on" : "ids-toggle--off"
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
                      // Handle both API and mock data fields
                      const srcIp = alert.source_ip || alert.srcIp || "—";
                      const destIp = alert.destination_ip || alert.destIp || "—";
                      const label = alert.attack_type || alert.label || "Unknown";
                      const score = alert.confidence !== undefined ? alert.confidence : (alert.score !== undefined ? alert.score : 0);

                      return (
                        <tr
                          key={alert.id}
                          onClick={() => setSelectedAlertId(alert.id)}
                          className={`ids-row ${isSelected ? "ids-row--selected" : ""
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
                          <td>{new Date(alert.timestamp).toLocaleTimeString()}</td>
                          <td>{srcIp}</td>
                          <td>{destIp}</td>
                          <td>{alert.protocol || "TCP"}</td>
                          <td>{label}</td>
                          <td>{score.toFixed(2)}</td>
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
                      ? `${selectedAlert.id} · ${selectedAlert.attack_type || selectedAlert.type || selectedAlert.label}`
                      : "No alert selected"}
                  </h2>
                  {selectedAlert && (
                    <p className="ids-selected-meta">
                      {new Date(selectedAlert.timestamp).toLocaleString()} · {selectedAlert.sensor || "Network Sensor"}
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
                      {(selectedAlert.confidence !== undefined ? selectedAlert.confidence : (selectedAlert.score || 0)).toFixed(2)}
                    </span>
                  </div>
                  <div className="ids-tags">
                    <span className="ids-tag">{selectedAlert.attack_type || selectedAlert.label}</span>
                    <span className="ids-tag">
                      {selectedAlert.protocol || "TCP"}
                      {(selectedAlert.destPort || selectedAlert.destination_port) ? ` · ${selectedAlert.destPort || selectedAlert.destination_port}` : ""}
                    </span>
                    <span className="ids-tag">{selectedAlert.sensor || "Network Sensor"}</span>
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
                      <dd>{selectedAlert.attack_type || selectedAlert.type || selectedAlert.label}</dd>
                    </div>
                    <div>
                      <dt>Severity</dt>
                      <dd className="ids-capitalize">{selectedAlert.severity}</dd>
                    </div>
                    <div>
                      <dt>Detection score</dt>
                      <dd>{(selectedAlert.confidence !== undefined ? selectedAlert.confidence : (selectedAlert.score || 0)).toFixed(2)}</dd>
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
                      <dd>{selectedAlert.source_ip || selectedAlert.srcIp || "—"}</dd>
                    </div>
                    <div>
                      <dt>Destination IP</dt>
                      <dd>{selectedAlert.destination_ip || selectedAlert.destIp || "—"}</dd>
                    </div>
                    <div>
                      <dt>Source port</dt>
                      <dd>{selectedAlert.srcPort || selectedAlert.source_port || "—"}</dd>
                    </div>
                    <div>
                      <dt>Destination port</dt>
                      <dd>{selectedAlert.destPort || selectedAlert.destination_port || "—"}</dd>
                    </div>
                    <div>
                      <dt>Protocol</dt>
                      <dd>{selectedAlert.protocol || "TCP"}</dd>
                    </div>
                    <div>
                      <dt>Sensor</dt>
                      <dd>{selectedAlert.sensor || "Network Sensor"}</dd>
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
                  {selectedAlert.description || "High rate of suspicious packets observed from this source within a short time window. Pattern matches known attack profiles used against exposed services in SME networks."}
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
          {/* Detection Lookup */}
          <div className="aegis-card">
            <div className="aegis-card-header">
              <h2>Explain Detection</h2>
              <span className="aegis-card-subtitle">
                Enter a detection ID to view SHAP feature importance
              </span>
            </div>
            <div className="ids-explain-content">
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <input
                  type="text"
                  value={detectionIdInput}
                  onChange={(e) => setDetectionIdInput(e.target.value)}
                  placeholder="Enter Detection ID (e.g., det_12345)"
                  className="ids-search-input"
                  style={{ flex: 1 }}
                />
                <button
                  className="ids-pentest-btn"
                  onClick={handleGetExplanation}
                  disabled={explanationLoading}
                >
                  {explanationLoading ? "Analyzing..." : "Get Explanation"}
                </button>
              </div>

              {explanationError && (
                <div style={{ padding: '1rem', background: '#fee', color: '#c00', borderRadius: '8px', marginBottom: '1rem' }}>
                  {explanationError}
                </div>
              )}

              {!explanation && !explanationLoading && !explanationError && (
                <p className="ids-explain-note">
                  Aegis IDS uses SHAP values to quantify how each traffic feature
                  pushes a prediction towards benign or malicious.
                </p>
              )}
            </div>
          </div>

          {/* Explanation Result */}
          {explanation && (
            <>
              <div className="aegis-card">
                <div className="aegis-card-header">
                  <h2>Feature Importance (SHAP Values)</h2>
                  <span className="aegis-card-subtitle">
                    Detection ID: {explanation.detection_id}
                  </span>
                </div>
                <div className="ids-feature-list">
                  {explanation.feature_importance ? (
                    Object.entries(explanation.feature_importance)
                      .sort(([, a], [, b]) => Math.abs(b) - Math.abs(a))
                      .map(([name, value]) => (
                        <div key={name} className="ids-feature-row">
                          <div className="ids-feature-main">
                            <div className="ids-feature-name">{name}</div>
                            <div className="ids-feature-desc">Feature contribution</div>
                          </div>
                          <div className="ids-feature-shap">
                            <div className="ids-bar">
                              <div
                                className={`ids-bar-fill ${value > 0 ? 'ids-bar-fill--purple' : 'ids-bar-fill--green'}`}
                                style={{
                                  width: `${Math.min(100, Math.abs(value) * 100 + 10)}%`,
                                }}
                              />
                            </div>
                            <span className="ids-bar-value">{value.toFixed(4)}</span>
                          </div>
                        </div>
                      ))
                  ) : (
                    <p style={{ padding: '1rem', color: '#888' }}>No feature importance data available.</p>
                  )}
                </div>
              </div>

              <div className="aegis-card ids-explain-example">
                <div className="aegis-card-header">
                  <h2>Explanation Narrative</h2>
                </div>
                <div className="ids-explain-content">
                  <p>{explanation.explanation}</p>
                  {explanation.model_used && (
                    <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#666' }}>
                      <strong>Model Used:</strong> {explanation.model_used}
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </section>
      )}

      {/* Analytics Tab */}
      {activeTab === "analytics" && (
        <section className="ids-analytics-grid">
          {/* Metrics Summary */}
          <div className="aegis-card">
            <div className="aegis-card-header">
              <h2>Metrics Summary</h2>
              <span className="aegis-card-subtitle">
                Overview of system activity
              </span>
            </div>
            <div className="ids-kpi-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', padding: '1rem' }}>
              <div className="ids-kpi-card">
                <div className="ids-kpi-label">Total Detections</div>
                <div className="ids-kpi-value">{metrics?.total_detections || 0}</div>
              </div>
              <div className="ids-kpi-card">
                <div className="ids-kpi-label">Total Alerts</div>
                <div className="ids-kpi-value">{metrics?.total_alerts || 0}</div>
              </div>
            </div>
          </div>

          {/* Attack Counts */}
          <div className="aegis-card">
            <div className="aegis-card-header">
              <h2>Attack Counts</h2>
              <span className="aegis-card-subtitle">
                Total detections by attack type
              </span>
            </div>
            <div className="ids-table-wrapper">
              <table className="ids-table">
                <thead>
                  <tr>
                    <th>Attack Type</th>
                    <th>Count</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics?.attack_counts ? (
                    Object.entries(metrics.attack_counts)
                      .sort(([, a], [, b]) => b - a)
                      .map(([type, count]) => (
                        <tr key={type}>
                          <td style={{ textTransform: 'capitalize' }}>{type.replace(/_/g, ' ')}</td>
                          <td>{count}</td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td colSpan={2} style={{ textAlign: 'center', color: '#888' }}>No data available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Severity Counts */}
          <div className="aegis-card">
            <div className="aegis-card-header">
              <h2>Severity Counts</h2>
              <span className="aegis-card-subtitle">
                Total detections by severity
              </span>
            </div>
            <div className="ids-table-wrapper">
              <table className="ids-table">
                <thead>
                  <tr>
                    <th>Severity</th>
                    <th>Count</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics?.severity_counts ? (
                    Object.entries(metrics.severity_counts)
                      .sort(([, a], [, b]) => b - a)
                      .map(([severity, count]) => (
                        <tr key={severity}>
                          <td><SeverityPill severity={severity} /></td>
                          <td>{count}</td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td colSpan={2} style={{ textAlign: 'center', color: '#888' }}>No data available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Placeholder for Time Series */}
          <div className="aegis-card">
            <div className="aegis-card-header">
              <h2>Time Series Analysis</h2>
            </div>
            <div className="aegis-chart-placeholder">
              <span>
                Time-series charts will be available when /metrics/attacks/time-series endpoint is ready.
              </span>
            </div>
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

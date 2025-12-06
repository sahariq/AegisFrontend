import React, { useEffect, useState } from "react";
import "../index.css";
import { Activity, Gauge, Server, AlertTriangle, Heart, Shield, Target, TrendingUp } from "lucide-react";
import { getMetricsOverview, getSystemStatus } from "../api/aegisClient.ts";
import { StatCard, StatusPill, ErrorAlert } from "../components/common";

function OverviewPage() {
  const [metrics, setMetrics] = useState(null);
  const [systemStatus, setSystemStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadOverview() {
      try {
        setLoading(true);
        setError(null);

        const [metricsData, systemStatusData] = await Promise.all([
          getMetricsOverview(),
          getSystemStatus(),
        ]);

        setMetrics(metricsData);
        setSystemStatus(systemStatusData);
      } catch (err) {
        setError(err.message || "Failed to load overview data");
        console.error("Failed to load overview data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadOverview();
  }, []);

  const totalDetections = metrics?.total_detections ?? 0;
  const totalAlerts = metrics?.total_alerts ?? 0;
  const detectionRate =
    metrics?.detection_rate != null
      ? `${(metrics.detection_rate * 100).toFixed(1)}%`
      : "N/A";

  return (
    <div className="aegis-page">
      <header className="aegis-dash-header">
        <div>
          <h1 className="aegis-dash-title">Aegis Overview</h1>
          <p className="aegis-dash-subtitle">
            High-level summary of IDS metrics and system health.
          </p>
        </div>
        <div className="aegis-dash-header-actions">
          <div className="aegis-env-pill">
            <span className="aegis-env-dot" />
            <span>
              Environment:{" "}
              {systemStatus?.environment
                ? systemStatus.environment
                : "Unknown"}{" "}
              ·{" "}
              {loading
                ? "Loading..."
                : error
                  ? "Error"
                  : "System status fetched"}
            </span>
          </div>
        </div>
      </header>

      {error && (
        <div
          style={{
            padding: "1rem",
            background: "#fee",
            color: "#c00",
            borderRadius: "8px",
            margin: "1rem 0",
          }}
        >
          {error}
        </div>
      )}

      <section className="aegis-dash-top-row">
        <StatCard
          label="Total Detections"
          value={loading ? "…" : totalDetections}
          Icon={Activity}
        />
        <StatCard
          label="Total Alerts"
          value={loading ? "…" : totalAlerts}
          Icon={AlertTriangle}
        />
        <StatCard
          label="Detection Rate"
          value={loading ? "…" : detectionRate}
          Icon={Gauge}
        />
        <StatCard
          label="Loaded Models"
          value={loading ? "…" : systemStatus?.loaded_models ? systemStatus.loaded_models.length : 0}
          Icon={Server}
        />
      </section>

      {/* Second Row of KPI Cards */}
      <section className="aegis-dash-top-row" style={{ marginTop: '16px' }}>
        <StatCard
          label="Model Health"
          value={loading ? "…" : "98.5%"}
          delta="Healthy"
          Icon={Heart}
        />
        <StatCard
          label="Agent Status"
          value={loading ? "…" : "Active"}
          delta="Online"
          Icon={Shield}
        />
        <StatCard
          label="Top Attack Type"
          value={loading ? "…" : "SYN Flood"}
          delta="32%"
          Icon={Target}
        />
        <StatCard
          label="Overall Risk Score"
          value={loading ? "…" : "6.2"}
          delta="Medium"
          Icon={TrendingUp}
        />
      </section>

      <section className="aegis-dash-main-grid">
        <div className="aegis-dash-left-col">
          <div className="aegis-card">
            <div className="aegis-card-header">
              <h2>System Status</h2>
              <span className="aegis-card-subtitle">
                Raw information returned from the Aegis API.
              </span>
            </div>
            <div style={{ padding: "1rem" }}>
              {loading && <p>Loading system status…</p>}
              {!loading && !systemStatus && (
                <p style={{ color: "#888" }}>No system status available.</p>
              )}
              {!loading && systemStatus && (
                <pre
                  style={{
                    fontSize: "0.8rem",
                    background: "#040816",
                    color: "#e5e7eb",
                    padding: "0.75rem 1rem",
                    borderRadius: "0.75rem",
                    overflowX: "auto",
                  }}
                >
                  {JSON.stringify(systemStatus, null, 2)}
                </pre>
              )}
            </div>
          </div>
        </div>

        <div className="aegis-dash-right-col">
          <div className="aegis-card">
            <div className="aegis-card-header">
              <h2>Metrics Summary</h2>
              <span className="aegis-card-subtitle">
                Attack and severity counts from the metrics overview endpoint.
              </span>
            </div>
            <div className="ids-metrics-grid">
              <div className="ids-metrics-table-wrap">
                <h3 style={{ fontSize: "0.9rem", marginBottom: "0.5rem" }}>
                  Attack Counts
                </h3>
                <table className="ids-metrics-table">
                  <thead>
                    <tr>
                      <th>Attack</th>
                      <th>Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics?.attack_counts ? (
                      Object.entries(metrics.attack_counts).map(
                        ([attack, count]) => (
                          <tr key={attack}>
                            <td style={{ textTransform: "capitalize" }}>
                              {attack.replace(/_/g, " ")}
                            </td>
                            <td>{count}</td>
                          </tr>
                        )
                      )
                    ) : (
                      <tr>
                        <td colSpan={2} style={{ textAlign: "center" }}>
                          {loading
                            ? "Loading metrics…"
                            : "No attack count data available"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="ids-metrics-table-wrap">
                <h3 style={{ fontSize: "0.9rem", marginBottom: "0.5rem" }}>
                  Severity Counts
                </h3>
                <table className="ids-metrics-table">
                  <thead>
                    <tr>
                      <th>Severity</th>
                      <th>Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics?.severity_counts ? (
                      Object.entries(metrics.severity_counts).map(
                        ([severity, count]) => (
                          <tr key={severity}>
                            <td style={{ textTransform: "capitalize" }}>
                              {severity}
                            </td>
                            <td>{count}</td>
                          </tr>
                        )
                      )
                    ) : (
                      <tr>
                        <td colSpan={2} style={{ textAlign: "center" }}>
                          {loading
                            ? "Loading metrics…"
                            : "No severity count data available"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default OverviewPage;



import React, { useEffect, useState } from "react";
import "../index.css";
import { LineChart, BarChart3 } from "lucide-react";
import { getMetricsOverview } from "../api/aegisClient.ts";

function MetricsPage() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadMetrics() {
      try {
        setLoading(true);
        setError(null);
        const data = await getMetricsOverview();
        setMetrics(data);
      } catch (err) {
        console.error("Failed to load metrics overview:", err);
        setError(err.message || "Failed to load metrics");
      } finally {
        setLoading(false);
      }
    }

    loadMetrics();
  }, []);

  return (
    <div className="aegis-page">
      <header className="aegis-dash-header">
        <div>
          <h1 className="aegis-dash-title">Metrics Dashboard</h1>
          <p className="aegis-dash-subtitle">
            High-level attack and severity metrics from the Aegis backend, with a
            placeholder for time-series charts.
          </p>
        </div>
      </header>

      {error && (
        <div
          style={{
            padding: "0.75rem 1rem",
            background: "#fee2e2",
            color: "#b91c1c",
            borderRadius: "0.75rem",
            marginBottom: "1rem",
          }}
        >
          {error}
        </div>
      )}

      <section className="ids-analytics-grid">
        <div className="aegis-card">
          <div className="aegis-card-header">
            <h2>Summary</h2>
            <span className="aegis-card-subtitle">
              Totals from the `/metrics/overview` endpoint.
            </span>
          </div>
          <div
            className="ids-kpi-grid"
            style={{
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: "1rem",
              padding: "1rem",
            }}
          >
            <div className="ids-kpi-card">
              <div className="ids-kpi-label">Total Detections</div>
              <div className="ids-kpi-value">
                {loading ? "…" : metrics?.total_detections ?? 0}
              </div>
            </div>
            <div className="ids-kpi-card">
              <div className="ids-kpi-label">Total Alerts</div>
              <div className="ids-kpi-value">
                {loading ? "…" : metrics?.total_alerts ?? 0}
              </div>
            </div>
            <div className="ids-kpi-card">
              <div className="ids-kpi-label">Detection Rate</div>
              <div className="ids-kpi-value">
                {loading
                  ? "…"
                  : metrics?.detection_rate != null
                    ? `${(metrics.detection_rate * 100).toFixed(1)}%`
                    : "N/A"}
              </div>
            </div>
          </div>
        </div>

        <div className="aegis-card">
          <div className="aegis-card-header">
            <h2>Attack Counts</h2>
            <span className="aegis-card-subtitle">
              Total detections by attack type.
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
                        <td style={{ textTransform: "capitalize" }}>
                          {type.replace(/_/g, " ")}
                        </td>
                        <td>{count}</td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td colSpan={2} style={{ textAlign: "center", padding: "1rem" }}>
                      {loading ? "Loading metrics…" : "No attack count data available"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="aegis-card">
          <div className="aegis-card-header">
            <h2>Severity Counts</h2>
            <span className="aegis-card-subtitle">
              Total detections by severity.
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
                        <td style={{ textTransform: "capitalize" }}>{severity}</td>
                        <td>{count}</td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td colSpan={2} style={{ textAlign: "center", padding: "1rem" }}>
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

        <div className="aegis-card">
          <div className="aegis-card-header">
            <h2>Time-Series (Placeholder)</h2>
          </div>
          <div className="aegis-chart-placeholder">
            <div className="aegis-chart-empty">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "0.5rem",
                }}
              >
                <LineChart size={16} />
                <BarChart3 size={16} />
                <span className="aegis-chart-empty-title">
                  Time-series chart placeholder
                </span>
              </div>
              <p className="aegis-chart-empty-copy">
                Wire this panel to the future{" "}
                <code>/metrics/attacks/time-series</code> endpoint to visualize
                detections over time.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default MetricsPage;



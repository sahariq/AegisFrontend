import React, { useEffect, useMemo, useState } from "react";
import "../index.css";
import { AlertTriangle, RefreshCcw, Search } from "lucide-react";
import { fetchAlerts } from "../api/aegisClient.ts";
import { getAlerts as getMockAlerts } from "../api/mock.js";

function LiveAlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [attackTypeFilter, setAttackTypeFilter] = useState("all");
  const [autoRefresh, setAutoRefresh] = useState(true);

  async function loadAlerts({ silent = false } = {}) {
    try {
      if (!silent) {
        setLoading(true);
      }
      setError(null);

      const params = {
        page: 1,
        page_size: 25,
        status: "new",
      };
      if (severityFilter !== "all") {
        params.severity = severityFilter;
      }
      if (attackTypeFilter !== "all") {
        params.attack_type = attackTypeFilter;
      }

      const response = await fetchAlerts(params);
      setAlerts(response.alerts);
    } catch (err) {
      console.error("Failed to load alerts, falling back to mock data:", err);
      setError("Using mock alerts — API unreachable.");
      const mock = await getMockAlerts();
      setAlerts(
        mock.map((item) => ({
          id: item.id,
          attack_type: item.title,
          severity: item.severity,
          timestamp: item.detectedAt,
        }))
      ).sort((a, b) => {
        const aTime = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        const bTime = b.timestamp ? new Date(b.timestamp).getTime() : 0;
        return bTime - aTime;
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAlerts();
  }, [severityFilter, attackTypeFilter]);

  useEffect(() => {
    if (!autoRefresh) return;

    const intervalId = setInterval(() => {
      // silent refresh: keep current loading state to avoid flicker
      loadAlerts({ silent: true }).catch((err) => {
        // Swallow polling errors so UI stays stable
        console.error("Polling error:", err);
      });
    }, 5000);

    return () => {
      clearInterval(intervalId);
    };
  }, [autoRefresh, severityFilter, attackTypeFilter]);

  const filteredAlerts = useMemo(() => {
    const base = [...alerts].sort((a, b) => {
      const aTime = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const bTime = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return bTime - aTime;
    });

    const term = search.trim().toLowerCase();

    return base.filter((alert) => {
      const matchesSearch =
        term.length === 0 ||
        alert.id.toLowerCase().includes(term) ||
        (alert.attack_type || "").toLowerCase().includes(term) ||
        (alert.severity || "").toLowerCase().includes(term);

      const matchesSeverity =
        severityFilter === "all" || alert.severity === severityFilter;

      const matchesAttackType =
        attackTypeFilter === "all" ||
        (alert.attack_type || "").toLowerCase() ===
          attackTypeFilter.toLowerCase();

      return matchesSearch && matchesSeverity && matchesAttackType;
    });
  }, [alerts, search, severityFilter, attackTypeFilter]);

  const uniqueAttackTypes = useMemo(() => {
    const types = new Set(
      alerts
        .map((a) => (a.attack_type || "").trim())
        .filter((v) => v && v.length > 0)
    );
    return Array.from(types).sort((a, b) => a.localeCompare(b));
  }, [alerts]);

  return (
    <div className="aegis-page">
      <header className="aegis-dash-header">
        <div>
          <h1 className="aegis-dash-title">Live Alerts</h1>
          <p className="aegis-dash-subtitle">
            Stream of most recent alerts from the Aegis IDS API.
          </p>
        </div>
        <div className="aegis-dash-header-actions">
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.85rem" }}>
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
              />
              Auto-refresh (5s)
            </label>
          <button
            type="button"
            className="aegis-advisory-btn cursor-hotspot-action"
            onClick={loadAlerts}
          >
              <RefreshCcw size={14} />
              Refresh
            </button>
          </div>
        </div>
      </header>

      {error && (
        <div
          style={{
            padding: "0.75rem 1rem",
            background: "#111827",
            color: "#fbbf24",
            borderRadius: "0.75rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "1rem",
          }}
        >
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      )}

      <div className="aegis-card">
        <div className="aegis-card-header">
          <div>
            <h2>Alerts Feed</h2>
            <span className="aegis-card-subtitle">
              Showing {filteredAlerts.length} of {alerts.length} alert
              {alerts.length === 1 ? "" : "s"}.
            </span>
          </div>
          <div className="ids-table-controls">
            <div className="ids-search-wrapper">
              <Search size={14} className="ids-search-icon" />
              <input
                type="text"
                className="ids-search-input"
                placeholder="Search by ID, type, severity…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="ids-select"
            >
              <option value="all">All severities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
            <select
              value={attackTypeFilter}
              onChange={(e) => setAttackTypeFilter(e.target.value)}
              className="ids-select"
            >
              <option value="all">All attack types</option>
              {uniqueAttackTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="ids-table-wrapper">
          <table className="ids-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Severity</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: "1rem" }}>
                    Loading alerts…
                  </td>
                </tr>
              ) : filteredAlerts.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: "1rem" }}>
                    No alerts to display.
                  </td>
                </tr>
              ) : (
                filteredAlerts.map((alert) => (
                  <tr key={alert.id}>
                    <td>{alert.id}</td>
                    <td>{alert.attack_type || "Unknown"}</td>
                    <td className="ids-capitalize">{alert.severity}</td>
                    <td>
                      {alert.timestamp
                        ? new Date(alert.timestamp).toLocaleString()
                        : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default LiveAlertsPage;



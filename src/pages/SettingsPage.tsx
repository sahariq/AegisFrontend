import React, { useState } from "react";
import "../index.css";
import { Settings, Bell, Zap, Plug2, Save } from "lucide-react";

type TabType = "general" | "alerts" | "notifications" | "integrations";

function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("general");

  // General settings state
  const [organizationName, setOrganizationName] = useState("Acme Security Labs");
  const [environment, setEnvironment] = useState<"demo" | "live">("demo");
  const [timezone, setTimezone] = useState("UTC");
  const [dateFormat, setDateFormat] = useState("YYYY-MM-DD");

  const handleSaveSettings = () => {
    const settings = {
      organizationName,
      environment,
      timezone,
      dateFormat,
    };
    console.log("Saving settings:", settings);
    // TODO: Add API call to save settings
  };

  const tabs = [
    { id: "general" as TabType, label: "General", icon: Settings },
    { id: "alerts" as TabType, label: "Alerts & Detection", icon: Bell },
    { id: "notifications" as TabType, label: "Notifications", icon: Zap },
    { id: "integrations" as TabType, label: "Integrations", icon: Plug2 },
  ];

  return (
    <div className="aegis-page">
      <header className="aegis-dash-header">
        <div>
          <h1 className="aegis-dash-title">Settings</h1>
          <p className="aegis-dash-subtitle">
            Configure your Aegis environment, alerts, and integrations.
          </p>
        </div>
        <div className="aegis-dash-header-actions">
          <div className="aegis-env-pill">
            <span className="aegis-env-dot" />
            <span>Environment: Demo · IDS Healthy</span>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "24px",
          borderBottom: "1px solid rgba(148, 163, 184, 0.15)",
          paddingBottom: "2px",
          overflowX: "auto",
        }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 16px",
                background: isActive
                  ? "rgba(59, 130, 246, 0.12)"
                  : "transparent",
                border: "none",
                borderRadius: "8px 8px 0 0",
                color: isActive ? "#60a5fa" : "#9ca9cb",
                fontSize: "14px",
                fontWeight: isActive ? 600 : 500,
                cursor: "pointer",
                transition: "all 0.2s ease",
                borderBottom: isActive
                  ? "2px solid #60a5fa"
                  : "2px solid transparent",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "rgba(59, 130, 246, 0.06)";
                  e.currentTarget.style.color = "#cbd5e1";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#9ca9cb";
                }
              }}
            >
              <Icon size={16} strokeWidth={2} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "general" && (
          <div className="aegis-card">
            <div className="aegis-card-header">
              <h2>General Settings</h2>
              <span className="aegis-card-subtitle">
                Configure basic system preferences and environment settings.
              </span>
            </div>
            <div style={{ padding: "24px" }}>
              {/* Settings Form Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "24px",
                  marginBottom: "32px",
                }}
              >
                {/* Organization Name */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label
                    htmlFor="org-name"
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#e5e7eb",
                    }}
                  >
                    Organization name
                  </label>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#9ca9cb",
                      margin: 0,
                      marginBottom: "4px",
                    }}
                  >
                    Shown in the dashboard header and reports.
                  </p>
                  <input
                    id="org-name"
                    type="text"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    placeholder="Acme Security Labs"
                    style={{
                      padding: "10px 14px",
                      background: "rgba(15, 23, 42, 0.6)",
                      border: "1px solid rgba(148, 163, 184, 0.2)",
                      borderRadius: "8px",
                      color: "#e5e7eb",
                      fontSize: "14px",
                      outline: "none",
                      transition: "all 0.2s ease",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "#60a5fa";
                      e.currentTarget.style.background = "rgba(15, 23, 42, 0.8)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "rgba(148, 163, 184, 0.2)";
                      e.currentTarget.style.background = "rgba(15, 23, 42, 0.6)";
                    }}
                  />
                </div>

                {/* Environment Mode */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label
                    htmlFor="environment"
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#e5e7eb",
                    }}
                  >
                    Environment
                  </label>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#9ca9cb",
                      margin: 0,
                      marginBottom: "4px",
                    }}
                  >
                    Switch between demo data and live agent telemetry.
                  </p>
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      padding: "4px",
                      background: "rgba(15, 23, 42, 0.6)",
                      borderRadius: "8px",
                      border: "1px solid rgba(148, 163, 184, 0.2)",
                    }}
                  >
                    <button
                      onClick={() => setEnvironment("demo")}
                      style={{
                        flex: 1,
                        padding: "8px 16px",
                        background:
                          environment === "demo"
                            ? "rgba(59, 130, 246, 0.2)"
                            : "transparent",
                        border:
                          environment === "demo"
                            ? "1px solid #60a5fa"
                            : "1px solid transparent",
                        borderRadius: "6px",
                        color: environment === "demo" ? "#60a5fa" : "#9ca9cb",
                        fontSize: "13px",
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                    >
                      Demo
                    </button>
                    <button
                      onClick={() => setEnvironment("live")}
                      style={{
                        flex: 1,
                        padding: "8px 16px",
                        background:
                          environment === "live"
                            ? "rgba(59, 130, 246, 0.2)"
                            : "transparent",
                        border:
                          environment === "live"
                            ? "1px solid #60a5fa"
                            : "1px solid transparent",
                        borderRadius: "6px",
                        color: environment === "live" ? "#60a5fa" : "#9ca9cb",
                        fontSize: "13px",
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                    >
                      Live
                    </button>
                  </div>
                </div>

                {/* Timezone */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label
                    htmlFor="timezone"
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#e5e7eb",
                    }}
                  >
                    Timezone
                  </label>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#9ca9cb",
                      margin: 0,
                      marginBottom: "4px",
                    }}
                  >
                    Used for alert timestamps and reporting.
                  </p>
                  <select
                    id="timezone"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    style={{
                      padding: "10px 14px",
                      background: "rgba(15, 23, 42, 0.6)",
                      border: "1px solid rgba(148, 163, 184, 0.2)",
                      borderRadius: "8px",
                      color: "#e5e7eb",
                      fontSize: "14px",
                      outline: "none",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "#60a5fa";
                      e.currentTarget.style.background = "rgba(15, 23, 42, 0.8)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "rgba(148, 163, 184, 0.2)";
                      e.currentTarget.style.background = "rgba(15, 23, 42, 0.6)";
                    }}
                  >
                    <option value="UTC">UTC (Coordinated Universal Time)</option>
                    <option value="UTC+5">UTC+5 (PKT - Pakistan Standard Time)</option>
                    <option value="UTC+1">UTC+1 (CET - Central European Time)</option>
                    <option value="UTC-5">UTC-5 (EST - Eastern Standard Time)</option>
                    <option value="UTC-8">UTC-8 (PST - Pacific Standard Time)</option>
                    <option value="UTC+8">UTC+8 (CST - China Standard Time)</option>
                  </select>
                </div>

                {/* Date Format */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label
                    htmlFor="date-format"
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#e5e7eb",
                    }}
                  >
                    Date format
                  </label>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#9ca9cb",
                      margin: 0,
                      marginBottom: "4px",
                    }}
                  >
                    Controls how dates appear in alerts and logs.
                  </p>
                  <select
                    id="date-format"
                    value={dateFormat}
                    onChange={(e) => setDateFormat(e.target.value)}
                    style={{
                      padding: "10px 14px",
                      background: "rgba(15, 23, 42, 0.6)",
                      border: "1px solid rgba(148, 163, 184, 0.2)",
                      borderRadius: "8px",
                      color: "#e5e7eb",
                      fontSize: "14px",
                      outline: "none",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "#60a5fa";
                      e.currentTarget.style.background = "rgba(15, 23, 42, 0.8)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "rgba(148, 163, 184, 0.2)";
                      e.currentTarget.style.background = "rgba(15, 23, 42, 0.6)";
                    }}
                  >
                    <option value="YYYY-MM-DD">YYYY-MM-DD (2024-12-05)</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY (05/12/2024)</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY (12/05/2024)</option>
                  </select>
                </div>
              </div>

              {/* Save Button */}
              <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "16px", borderTop: "1px solid rgba(148, 163, 184, 0.1)" }}>
                <button
                  onClick={handleSaveSettings}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 20px",
                    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                    border: "none",
                    borderRadius: "8px",
                    color: "#ffffff",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    boxShadow: "0 2px 8px rgba(59, 130, 246, 0.3)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(59, 130, 246, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(59, 130, 246, 0.3)";
                  }}
                >
                  <Save size={16} />
                  <span>Save changes</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "alerts" && (
          <div className="aegis-card">
            <div className="aegis-card-header">
              <h2>Alerts & Detection</h2>
              <span className="aegis-card-subtitle">
                Configure alert thresholds, detection rules, and notification
                preferences.
              </span>
            </div>
            <div style={{ padding: "16px" }}>
              <p
                style={{
                  color: "#9ca9cb",
                  fontSize: "14px",
                  textAlign: "center",
                  padding: "40px 20px",
                }}
              >
                Coming soon
              </p>
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="aegis-card">
            <div className="aegis-card-header">
              <h2>Notifications</h2>
              <span className="aegis-card-subtitle">
                Manage email, Slack, and webhook notification channels.
              </span>
            </div>
            <div style={{ padding: "16px" }}>
              <p
                style={{
                  color: "#9ca9cb",
                  fontSize: "14px",
                  textAlign: "center",
                  padding: "40px 20px",
                }}
              >
                Coming soon
              </p>
            </div>
          </div>
        )}

        {activeTab === "integrations" && (
          <div className="aegis-card">
            <div className="aegis-card-header">
              <h2>Integrations</h2>
              <span className="aegis-card-subtitle">
                Connect Aegis with external tools and services.
              </span>
            </div>
            <div style={{ padding: "16px" }}>
              <p
                style={{
                  color: "#9ca9cb",
                  fontSize: "14px",
                  textAlign: "center",
                  padding: "40px 20px",
                }}
              >
                Coming soon
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SettingsPage;

import React, { useState, useEffect, useCallback, useMemo } from "react";
import "../index.css";
import {
  Bell,
  UserRound,
  Shield,
  Activity,
  Clock3,
  Lightbulb,
  MessageSquare,
  BrainCircuit,
  Server,
  ShieldHalf,
  Gauge,
  RefreshCcw,
  RotateCw,
  Circle,
  Sparkles,
} from "lucide-react";
import RecentAlertCard from "../components/alerts/RecentAlertCard.jsx";
import ThreatsDetectedCard from "../components/charts/ThreatsDetectedCard.tsx";
import { StatCard, StatusPill } from "../components/common";
import { getMetricsOverview, fetchAlerts, checkHealth } from "../api/aegisClient.ts";
import { 
  generateMonthlyThreats, 
  generateRecentAlerts, 
  generateMetricsOverview,
  ThreatSimulator 
} from "../utils/mockDataGenerator.ts";
import { useMockIdsStream } from "../hooks/useMockIdsStream.ts";

function DashboardPage() {
  const [metrics, setMetrics] = useState(null);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [healthStatus, setHealthStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [useMockData, setUseMockData] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mockStreamEnabled, setMockStreamEnabled] = useState(false);

  // Mock data for second row KPIs (will be updated by mock stream)
  const [modelHealth, setModelHealth] = useState({
    f1Score: 0.79,
    rocAuc: 0.85,
    precision: 0.82,
    recall: 0.76,
    status: "stable",
    lastUpdated: "2 days ago",
  });

  const [agentStatus, setAgentStatus] = useState({
    status: "online",
    lastHeartbeatSeconds: 12,
    cpuUsage: 34,
    memoryUsageGb: 1.2,
    throughputMbps: 4.1,
    agentId: "aegis-edge-01",
  });

  const [riskScore, setRiskScore] = useState({
    score: 62,
    level: "moderate",
    inputsSummary: "50 active alerts · 3 exposed services · 2 high-severity findings",
  });

  // Calculate top attacks from metrics
  const topAttacks = useMemo(() => {
    if (!metrics?.attack_counts) {
      return [
        { name: "SYN Flood", percentage: 43 },
        { name: "MITM ARP", percentage: 27 },
        { name: "DNS Exfiltration", percentage: 18 },
      ];
    }
    
    const total = Object.values(metrics.attack_counts).reduce((a, b) => a + b, 0);
    if (total === 0) return [];
    
    return Object.entries(metrics.attack_counts)
      .map(([name, count]) => ({
        name: name.replace(/_/g, ' '),
        percentage: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 3);
  }, [metrics]);

  const loadDashboardData = useCallback(async () => {
    // Skip API calls if mock stream is enabled
    if (mockStreamEnabled) {
      console.log('[Dashboard] Skipping API call - mock stream is active');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      try {
        // Try to fetch real data from API
        const [metricsData, alertsData, healthData] = await Promise.all([
          getMetricsOverview(),
          fetchAlerts({ page: 1, page_size: 4, status: 'new' }),
          checkHealth().catch(() => null),
        ]);

        setMetrics(metricsData);
        setRecentAlerts(alertsData.alerts);
        setHealthStatus(healthData);

        // Process alerts data for chart - group by date and severity
        const alertsByDate = {};
        alertsData.alerts.forEach(alert => {
          const date = new Date(alert.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          if (!alertsByDate[date]) {
            alertsByDate[date] = { date, high: 0, medium: 0, low: 0 };
          }
          const severity = alert.severity.toLowerCase();
          if (severity === 'high' || severity === 'critical') {
            alertsByDate[date].high++;
          } else if (severity === 'medium') {
            alertsByDate[date].medium++;
          } else {
            alertsByDate[date].low++;
          }
        });

        setChartData(Object.values(alertsByDate));
        setUseMockData(false);
      } catch (apiError) {
        // If API fails, use mock data
        setUseMockData(true);
        
        // Generate mock data
        const mockMetrics = generateMetricsOverview();
        const mockAlerts = generateRecentAlerts(4);
        const mockChartData = generateMonthlyThreats();
        
        setMetrics(mockMetrics);
        setRecentAlerts(mockAlerts);
        setChartData(mockChartData);
      }
    } catch (err) {
      setError(err.message);
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [mockStreamEnabled]);

  const handleDashboardRefresh = async () => {
    setIsRefreshing(true);
    await loadDashboardData();
    setIsRefreshing(false);
  };

  const handleToggleMockStream = useCallback(() => {
    const newState = !mockStreamEnabled;
    setMockStreamEnabled(newState);
    console.log('[Mock Stream] Toggled:', newState);
    
    // When turning off mock stream, trigger a real refresh
    if (!newState) {
      console.log('[Mock Stream] Disabled - triggering real data refresh');
      setTimeout(() => {
        loadDashboardData();
      }, 100);
    }
  }, [mockStreamEnabled, loadDashboardData]);

  // Mock stream hook - updates data when enabled
  const mockStreamCallbacks = useMemo(() => ({
    onMetricsUpdate: (newMetrics) => {
      setMetrics(newMetrics);
      setUseMockData(true);
    },
    onNewAlert: (newAlert) => {
      setRecentAlerts(prev => [newAlert, ...prev.slice(0, 3)]);
    },
    onModelHealthUpdate: (health) => {
      setModelHealth(health);
    },
    onAgentStatusUpdate: (status) => {
      setAgentStatus(status);
    },
    onRiskScoreUpdate: (risk) => {
      setRiskScore(risk);
    },
  }), []);

  useMockIdsStream({
    enabled: mockStreamEnabled,
    intervalMs: 4000,
    callbacks: mockStreamCallbacks,
  });

  useEffect(() => {
    loadDashboardData();

    // Set up real-time threat simulator
    const simulator = new ThreatSimulator();
    simulator.onNewThreat((newAlert) => {
      setRecentAlerts(prev => [newAlert, ...prev.slice(0, 3)]);
    });
    
    // Start simulating threats every 10 seconds
    simulator.start(10000);

    return () => {
      simulator.stop();
    };
  }, []);

  // Determine IDS status
  const getIDSStatus = () => {
    if (loading && !healthStatus) {
      return { status: 'loading', label: 'Checking' };
    }
    if (error || !healthStatus) {
      return { status: 'error', label: 'Error' };
    }
    if (healthStatus.status === 'healthy' || healthStatus.status === 'ok') {
      return { status: 'healthy', label: 'Healthy' };
    }
    if (healthStatus.status === 'degraded' || healthStatus.status === 'warning') {
      return { status: 'warning', label: 'Warning' };
    }
    return { status: 'error', label: 'Error' };
  };

  const idsStatus = mockStreamEnabled 
    ? { status: 'warning', label: 'Mocking' }
    : getIDSStatus();
  // Check if backend is in demo/static mode or production
  const backendMode = healthStatus?.mode || (healthStatus?.components?.database);
  const environmentLabel = mockStreamEnabled
    ? 'Demo • Mock Stream'
    : (backendMode === 'demo' || backendMode === 'static' || useMockData) ? 'Demo' : 'Production';

  return (
    <div className="aegis-page">
      <header className="aegis-dash-header">
        <div>
          <h1 className="aegis-dash-title">Welcome Back, Sahar</h1>
          <p className="aegis-dash-subtitle">
            Your SME security overview and system activity summary.
          </p>
        </div>
        <div className="ids-header-right-new">
          {/* Status pill */}
          <div className={`ids-status-pill-neon ids-status-pill-neon--${
            idsStatus.status === 'error' ? 'error' : 
            idsStatus.status === 'warning' ? 'warning' : 
            'healthy'
          }`}>
            <Circle
              className={`ids-status-dot-icon ${
                idsStatus.status === 'error' ? 'ids-status-dot-icon--error' : 
                idsStatus.status === 'warning' ? 'ids-status-dot-icon--warning' : 
                'ids-status-dot-icon--healthy'
              }`}
              fill="currentColor"
            />
            <span className="ids-status-text">
              Env: <span className="ids-status-value">{environmentLabel}</span>
            </span>
            <span className="ids-status-separator">•</span>
            <span className="ids-status-text">
              IDS: <span className={`ids-status-value ${
                idsStatus.status === 'error' ? 'ids-status-value--error' : 
                idsStatus.status === 'warning' ? 'ids-status-value--warning' : 
                'ids-status-value--healthy'
              }`}>{idsStatus.label}</span>
            </span>
          </div>

          {/* Mock Stream button */}
          <button
            type="button"
            onClick={handleToggleMockStream}
            className={`ids-mock-stream-btn ${
              mockStreamEnabled ? 'ids-mock-stream-btn--on' : 'ids-mock-stream-btn--off'
            }`}
          >
            <Sparkles className={`ids-mock-stream-icon ${
              mockStreamEnabled ? 'ids-mock-stream-icon--pulsing' : ''
            }`} />
            <span>Mock Stream</span>
          </button>

          {/* Refresh button */}
          <button
            type="button"
            onClick={handleDashboardRefresh}
            disabled={isRefreshing}
            className={`ids-refresh-btn-neon ids-refresh-btn-neon--${
              idsStatus.status === 'error' ? 'error' : 
              idsStatus.status === 'warning' ? 'warning' : 
              'healthy'
            }`}
          >
            <RotateCw className={`ids-refresh-icon ${isRefreshing ? 'animate-spin-slow' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </header>

      {error && (
        <div style={{ padding: '1rem', background: '#fee', color: '#c00', borderRadius: '8px', margin: '1rem 0' }}>
          Error loading dashboard: {error}
        </div>
      )}

      <section className="aegis-dash-top-row">
        <StatCard
          label="Active Alerts"
          value={loading ? "..." : metrics?.total_alerts || "0"}
          delta="+12.4%"
          trend="up"
          Icon={Shield}
        />
        <StatCard
          label="Total Detections"
          value={loading ? "..." : metrics?.total_detections || "0"}
          delta="+17.9%"
          trend="up"
          Icon={Activity}
        />
        <StatCard
          label="Avg. Response Time"
          value="2.3s"
          delta="-12.4%"
          trend="down"
          Icon={Clock3}
        />
        <StatCard
          label="Detection Rate"
          value={loading ? "..." : metrics?.detection_rate ? `${(metrics.detection_rate * 100).toFixed(1)}%` : "N/A"}
          delta="+5.7%"
          trend="up"
          Icon={Lightbulb}
        />
      </section>

      {/* Second Row of KPI Cards */}
      <section className="aegis-dash-top-row" style={{ marginTop: '16px' }}>
        {/* Model Health Card */}
        <div className="aegis-stat-card">
          <div className="aegis-stat-meta">
            <div className="aegis-stat-icon">
              <BrainCircuit size={18} strokeWidth={1.6} />
            </div>
            <span className="aegis-stat-label">Model Health</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
            <div className="aegis-stat-main-row">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span className="aegis-stat-value">{modelHealth.f1Score.toFixed(2)}</span>
                <span style={{ fontSize: '11px', color: '#9ca9cb' }}>F1 Score</span>
              </div>
              <StatusPill status={modelHealth.status} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#9ca9cb' }}>
                ROC-AUC: <span style={{ fontWeight: 600, color: '#e5e7eb' }}>{modelHealth.rocAuc.toFixed(2)}</span>
              </span>
              <span style={{ fontSize: '11px', color: '#64748b' }}>
                Updated {modelHealth.lastUpdated}
              </span>
            </div>
          </div>
        </div>

        {/* Agent Status Card */}
        <div className="aegis-stat-card">
          <div className="aegis-stat-meta">
            <div className="aegis-stat-icon">
              <Server size={18} strokeWidth={1.6} />
            </div>
            <span className="aegis-stat-label">Agent Status</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
            {/* Main Status Indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span 
                style={{ 
                  width: '10px', 
                  height: '10px', 
                  borderRadius: '50%', 
                  background: agentStatus.status === 'online' ? '#4ade80' : 
                             agentStatus.status === 'degraded' ? '#fbbf24' : 
                             '#f87171',
                  boxShadow: agentStatus.status === 'online' ? '0 0 8px rgba(74, 222, 128, 0.5)' : 
                             agentStatus.status === 'degraded' ? '0 0 8px rgba(251, 191, 36, 0.5)' : 
                             '0 0 8px rgba(248, 113, 113, 0.5)'
                }}
              />
              <span className="aegis-stat-value" style={{ fontSize: '22px' }}>
                {agentStatus.status.charAt(0).toUpperCase() + agentStatus.status.slice(1)}
              </span>
            </div>
            
            {/* Secondary Metrics - Two Columns */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
              <div>
                <span style={{ color: '#9ca9cb' }}>Last heartbeat:</span>
                <div style={{ color: '#e5e7eb', fontSize: '13px', fontWeight: 500, marginTop: '2px' }}>
                  {agentStatus.lastHeartbeatSeconds} sec ago
                </div>
              </div>
              <div>
                <span style={{ color: '#9ca9cb' }}>CPU:</span>
                <div style={{ color: '#e5e7eb', fontSize: '13px', fontWeight: 500, marginTop: '2px' }}>
                  {agentStatus.cpuUsage}%
                </div>
              </div>
              <div>
                <span style={{ color: '#9ca9cb' }}>Memory:</span>
                <div style={{ color: '#e5e7eb', fontSize: '13px', fontWeight: 500, marginTop: '2px' }}>
                  {agentStatus.memoryUsageGb} GB
                </div>
              </div>
              <div>
                <span style={{ color: '#9ca9cb' }}>Throughput:</span>
                <div style={{ color: '#e5e7eb', fontSize: '13px', fontWeight: 500, marginTop: '2px' }}>
                  {agentStatus.throughputMbps} Mbps
                </div>
              </div>
            </div>
            
            {/* Footer - Agent ID */}
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
              Agent ID: {agentStatus.agentId}
            </div>
          </div>
        </div>

        {/* Top Attack Types Card */}
        <div className="aegis-stat-card">
          <div className="aegis-stat-meta">
            <div className="aegis-stat-icon">
              <ShieldHalf size={18} strokeWidth={1.6} />
            </div>
            <span className="aegis-stat-label">Top Attack Types</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
            {topAttacks.map((attack, index) => {
              const barColors = [
                { bg: 'rgba(139, 92, 246, 0.15)', fill: '#a78bfa' },
                { bg: 'rgba(59, 130, 246, 0.15)', fill: '#60a5fa' },
                { bg: 'rgba(6, 182, 212, 0.15)', fill: '#22d3ee' },
              ];
              const color = barColors[index] || barColors[0];
              
              return (
                <div key={attack.name} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#e5e7eb', fontWeight: 500 }}>
                      {attack.name}
                    </span>
                    <span style={{ fontSize: '13px', color: color.fill, fontWeight: 600 }}>
                      {attack.percentage}%
                    </span>
                  </div>
                  <div style={{ 
                    width: '100%', 
                    height: '6px', 
                    background: color.bg, 
                    borderRadius: '3px',
                    overflow: 'hidden'
                  }}>
                    <div style={{ 
                      width: `${attack.percentage}%`, 
                      height: '100%', 
                      background: color.fill,
                      borderRadius: '3px',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Overall Risk Score Card */}
        <div className="aegis-stat-card">
          <div className="aegis-stat-meta">
            <div className="aegis-stat-icon">
              <Gauge size={18} strokeWidth={1.6} />
            </div>
            <span className="aegis-stat-label">Risk Score</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
            {/* Primary Metric */}
            <div className="aegis-stat-main-row">
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span className="aegis-stat-value">{riskScore.score}</span>
                <span style={{ fontSize: '16px', color: '#9ca9cb', fontWeight: 500 }}>/ 100</span>
              </div>
              <StatusPill status={riskScore.level} />
            </div>
            
            {/* Mini Breakdown */}
            <div style={{ 
              fontSize: '11px', 
              color: '#9ca9cb', 
              lineHeight: '1.5',
              paddingTop: '4px',
              borderTop: '1px solid rgba(148, 163, 184, 0.1)'
            }}>
              Inputs: {riskScore.inputsSummary}
            </div>
          </div>
        </div>
      </section>

      <section className="aegis-dash-main-grid">
        <div className="aegis-dash-left-col">
          <ThreatsDetectedCard 
            data={chartData.map(item => ({ label: item.month || item.date || item.label, value: item.value }))} 
            loading={loading}
            emptyMessage="Connect the IDS API to visualize detections over time."
          />

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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MessageSquare size={32} strokeWidth={2} color="#f97316" />
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
              {loading ? (
                <p style={{ padding: '1rem', textAlign: 'center', color: '#888' }}>Loading alerts...</p>
              ) : recentAlerts.length > 0 ? (
                recentAlerts.map((alert) => (
                  <RecentAlertCard
                    key={alert.id}
                    id={alert.id}
                    title={alert.attack_type || 'Unknown Attack'}
                    severity={alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                    time={`Detected ${new Date(alert.timestamp).toLocaleString()}`}
                    source={alert.source_ip || 'Unknown'}
                  />
                ))
              ) : (
                <p style={{ padding: '1rem', textAlign: 'center', color: '#888' }}>No recent alerts</p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default DashboardPage;



// src/api/aegisClient.ts

const API_BASE_URL =
  import.meta.env.VITE_AEGIS_API_BASE_URL || "http://localhost:8000";

// ---------- Common envelope & error ----------

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface ApiEnvelope<TData = unknown, TMeta = unknown> {
  data: TData | null;
  meta: TMeta | null;
  error: ApiError | null;
}

// ---------- Core domain types ----------

// /api/v1/health
export interface HealthStatus {
  status: string;
  uptime_seconds: number;
  version: string;
  components: {
    api: string;
    model_engine: string;
    database: string;
    [key: string]: string;
  };
}

// /api/v1/system/status
export interface SystemModelInfo {
  name: string;
  attacks: string[];
  status?: string;
  version?: string;
}

export interface SystemStatus {
  models: SystemModelInfo[];
  supported_attack_types: string[];
  environment: {
    gpu_available: boolean;
    device: string;
    python_version: string;
    [key: string]: any;
  };
}

// Detection input/result as per FastAPI contract
export type DetectionSource =
  | "LIVE_CAPTURE"
  | "PCAP_IMPORT"
  | "LOG_IMPORT"
  | "MANUAL_INPUT";

export interface DetectionContext {
  src_ip?: string;
  dst_ip?: string;
  src_port?: number;
  dst_port?: number;
  protocol?: string;
  transport?: string;
  extra_tags?: string[];
  [key: string]: any;
}

export interface DetectionFeatures {
  [featureName: string]: number;
}

export interface DetectionInput {
  source: DetectionSource;
  context: DetectionContext;
  features: DetectionFeatures;
  model_hint?: string;
  [key: string]: any;
}

export type AttackFamily =
  | "AVAILABILITY"
  | "CONFIDENTIALITY"
  | "INTEGRITY"
  | "C2"
  | "EXFILTRATION"
  | "OTHER"
  | null;

export type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface DetectionLabels {
  source: string;
  dataset: string;
  [key: string]: any;
}

export interface DetectionResult {
  id: string;
  timestamp: string;
  is_attack: boolean;
  attack_type: string | null;
  attack_family: AttackFamily;
  score: number; // 0–1 confidence
  severity: Severity;
  labels: DetectionLabels;
  explanation_available: boolean;
  [key: string]: any;
}

// Alerts
export type AlertStatus =
  | "NEW"
  | "ACKNOWLEDGED"
  | "SUPPRESSED"
  | "RESOLVED";

export interface Alert {
  id: string;
  detection_id?: string;
  timestamp: string;
  src_ip?: string;
  dst_ip?: string;
  attack_type: string;
  severity: Severity;
  status: AlertStatus;
  score?: number;
  description?: string;
  tags?: string[];
  meta?: {
    model_name?: string;
    rule_id?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

export interface PaginationMeta {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
  [key: string]: any;
}

export interface AlertsResponse {
  alerts: Alert[];
  meta: PaginationMeta;
}

// Metrics
export interface TimeRange {
  from: string;
  to: string;
}

export interface MetricsOverview {
  time_range: TimeRange;
  total_flows: number;
  total_alerts: number;
  attack_counts: Record<string, number>;
  severity_counts: Record<string, number>;
  last_updated: string;
  [key: string]: any;
}

// Explainability
export interface TopFeatureImportance {
  name: string;
  importance: number;
  direction: "POSITIVE" | "NEGATIVE" | "NEUTRAL" | string;
}

export interface Explanation {
  detection_id: string;
  model_name: string;
  method: string;
  top_features: TopFeatureImportance[];
  raw_values?: {
    feature_importances?: Record<string, number>;
    [key: string]: any;
  };
  narrative: string;
  [key: string]: any;
}

// ---------- Query param types ----------

export interface AlertsParams {
  page?: number;
  page_size?: number;
  severity?: Severity;
  attack_type?: string;
  status?: AlertStatus;
  from?: string;
  to?: string;
  search?: string;
}

export interface MetricsParams {
  from?: string;
  to?: string;
}

// ---------- Helpers ----------

function buildUrl(path: string, params?: Record<string, any>): string {
  const url = new URL(path, API_BASE_URL);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== "" &&
        !Number.isNaN(value as any)
      ) {
        url.searchParams.append(key, String(value));
      }
    });
  }
  return url.toString();
}

async function apiFetch<TData = unknown, TMeta = unknown>(
  path: string,
  options: RequestInit = {},
  params?: Record<string, any>
): Promise<ApiEnvelope<TData, TMeta>> {
  const url = buildUrl(path, params);

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  let envelope: ApiEnvelope<TData, TMeta>;
  try {
    envelope = (await response.json()) as ApiEnvelope<TData, TMeta>;
  } catch (err) {
    throw new Error(
      `Failed to parse response from ${url}: ${response.status} ${response.statusText}`
    );
  }

  if (!response.ok) {
    if (envelope && envelope.error) {
      throw new Error(
        `${envelope.error.code}: ${envelope.error.message}`
      );
    }
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  if (!envelope) {
    throw new Error(`Empty response envelope from ${url}`);
  }

  return envelope;
}

function unwrapEnvelope<TData, TMeta = unknown>(
  envelope: ApiEnvelope<TData, TMeta>
): ApiEnvelope<TData, TMeta> {
  if (envelope.error) {
    throw new Error(`${envelope.error.code}: ${envelope.error.message}`);
  }
  if (envelope.data == null) {
    throw new Error("Response data is null/undefined");
  }
  return envelope;
}

// ---------- Exported API functions ----------

// Health
export async function checkHealth(): Promise<HealthStatus> {
  try {
    // Your backend uses /api/health and returns a different format
    const response = await fetch(buildUrl("/api/health"), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error('[Health Check] HTTP error:', response.status, response.statusText);
      throw new Error(`Health check failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('[Health Check] Response:', data);
    
    // Map your backend's format to expected format
    const healthStatus = {
      status: data.status || 'unknown',
      uptime_seconds: 0,
      version: '1.0.0',
      components: {
        api: data.status || 'unknown',
        model_engine: data.service || 'unknown',
        database: data.mode || 'unknown',
      },
      // Store mode for environment detection
      mode: data.mode,
    } as any;
    
    console.log('[Health Check] Mapped status:', healthStatus);
    return healthStatus;
  } catch (error) {
    console.error('[Health Check] Error:', error);
    throw error;
  }
}

// System status
export async function getSystemStatus(): Promise<SystemStatus> {
  // Your backend doesn't have this endpoint, return mock data
  console.warn('[System Status] Endpoint not available, using mock data');
  return {
    models: [
      {
        name: 'XGBoost Baseline',
        attacks: ['DDoS', 'Port Scan', 'Brute Force', 'SQL Injection'],
        status: 'active',
      }
    ],
    supported_attack_types: ['DDoS_SYN', 'BRUTE_FTP', 'SCAN_PORT', 'MITM_ARP', 'DDoS_UDP'],
    environment: {
      gpu_available: false,
      device: 'cpu',
      python_version: '3.10',
    },
  };
}

// Alerts
export async function fetchAlerts(
  params?: AlertsParams
): Promise<AlertsResponse> {
  // Your backend uses /api/alerts instead of /api/v1/alerts
  const response = await fetch(buildUrl("/api/alerts", params));
  
  if (!response.ok) {
    throw new Error(`Failed to fetch alerts: ${response.statusText}`);
  }
  
  const rawAlerts = await response.json();
  
  // Map your backend's field names to dashboard's expected format
  const alerts = (Array.isArray(rawAlerts) ? rawAlerts : []).map((alert: any) => ({
    id: alert.id,
    detection_id: alert.id,
    timestamp: alert.timestamp,
    src_ip: alert.src_ip,
    dst_ip: alert.dst_ip || alert.destination_ip,
    attack_type: alert.label || alert.attack_type,
    severity: (alert.severity || 'MEDIUM').toUpperCase() as Severity,
    status: (alert.status || 'NEW').toUpperCase() as AlertStatus,
    score: alert.score,
    description: alert.description,
    tags: alert.tags || [],
    meta: {
      protocol: alert.proto || alert.protocol,
      src_port: alert.src_port,
      dst_port: alert.dst_port,
      pkt_rate: alert.pkt_rate,
      byte_rate: alert.byte_rate,
    },
  }));
  
  return {
    alerts,
    meta: {
      page: 1,
      page_size: alerts.length,
      total_items: alerts.length,
      total_pages: 1,
    },
  };
}

// Metrics overview
export async function getMetricsOverview(
  params?: MetricsParams
): Promise<MetricsOverview> {
  try {
    // Try to fetch alerts and calculate metrics from them
    const response = await fetch(buildUrl("/api/alerts"));
    
    if (!response.ok) {
      throw new Error('Failed to fetch alerts for metrics');
    }
    
    const alerts = await response.json();
    
    // Calculate metrics from alerts
    const now = new Date();
    const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000);
    
    const recentAlerts = Array.isArray(alerts) ? alerts.filter((a: any) => {
      const alertTime = new Date(a.timestamp);
      return alertTime >= fiveMinAgo;
    }) : [];
    
    // Count by attack type
    const attackCounts: Record<string, number> = {};
    recentAlerts.forEach((alert: any) => {
      const type = alert.label || alert.attack_type || 'Unknown';
      attackCounts[type] = (attackCounts[type] || 0) + 1;
    });
    
    // Count by severity
    const severityCounts: Record<string, number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    };
    recentAlerts.forEach((alert: any) => {
      const sev = (alert.severity || 'medium').toLowerCase();
      if (severityCounts[sev] !== undefined) {
        severityCounts[sev]++;
      }
    });
    
    return {
      time_range: {
        from: fiveMinAgo.toISOString(),
        to: now.toISOString(),
      },
      total_flows: recentAlerts.length * 100, // Estimate
      total_alerts: recentAlerts.length,
      attack_counts: attackCounts,
      severity_counts: severityCounts,
      last_updated: now.toISOString(),
    };
  } catch (error) {
    console.error('[Metrics] Error calculating metrics:', error);
    // Return empty metrics
    return {
      time_range: {
        from: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        to: new Date().toISOString(),
      },
      total_flows: 0,
      total_alerts: 0,
      attack_counts: {},
      severity_counts: { low: 0, medium: 0, high: 0, critical: 0 },
      last_updated: new Date().toISOString(),
    };
  }
}

// Run detection
export async function runDetection(
  input: DetectionInput
): Promise<DetectionResult> {
  // Your backend doesn't have this endpoint
  console.warn('[Detection] Endpoint not available');
  throw new Error('Detection endpoint not implemented on backend');
}

// Explain detection
export async function getExplanation(
  detectionId: string
): Promise<Explanation> {
  // Your backend doesn't have this endpoint
  console.warn('[Explanation] Endpoint not available');
  throw new Error('EXPLANATION_NOT_AVAILABLE');
}

/**
 * Example usage (for reference only, do NOT paste into production components):
 *
 * async function demo() {
 *   const health = await checkHealth();
 *   console.log("Health:", health);
 *
 *   const { alerts, meta } = await fetchAlerts({ page: 1, page_size: 20 });
 *   console.log("Alerts:", alerts.length, "meta:", meta);
 *
 *   const detection = await runDetection({
 *     source: "MANUAL_INPUT",
 *     context: {
 *       src_ip: "192.168.0.10",
 *       dst_ip: "10.0.0.5",
 *       src_port: 443,
 *       dst_port: 8080,
 *       protocol: "TCP",
 *       transport: "IPv4",
 *       extra_tags: ["demo"],
 *     },
 *     features: {
 *       flow_duration_ms: 1200,
 *       packet_count: 50,
 *       byte_count: 4096,
 *     },
 *   });
 *
 *   console.log("Detection:", detection.id, detection.is_attack);
 * }
 */

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
  const envelope = await apiFetch<HealthStatus>("/api/v1/health");
  const { data } = unwrapEnvelope(envelope);
  return data;
}

// System status
export async function getSystemStatus(): Promise<SystemStatus> {
  const envelope = await apiFetch<SystemStatus>("/api/v1/system/status");
  const { data } = unwrapEnvelope(envelope);
  return data;
}

// Alerts
export async function fetchAlerts(
  params?: AlertsParams
): Promise<AlertsResponse> {
  type AlertsData = { alerts: Alert[] };

  const envelope = await apiFetch<AlertsData, PaginationMeta>(
    "/api/v1/alerts",
    {},
    params
  );
  const { data, meta } = unwrapEnvelope(envelope);

  return {
    alerts: data.alerts,
    meta: meta as PaginationMeta,
  };
}

// Metrics overview
export async function getMetricsOverview(
  params?: MetricsParams
): Promise<MetricsOverview> {
  const envelope = await apiFetch<MetricsOverview>(
    "/api/v1/metrics/overview",
    {},
    params
  );
  const { data } = unwrapEnvelope(envelope);
  return data;
}

// Run detection
export async function runDetection(
  input: DetectionInput
): Promise<DetectionResult> {
  type DetectionEnvelopeData = { detection: DetectionResult };

  const envelope = await apiFetch<DetectionEnvelopeData>(
    "/api/v1/detections",
    {
      method: "POST",
      body: JSON.stringify(input),
    }
  );

  const { data } = unwrapEnvelope(envelope);
  return data.detection;
}

// Explain detection
export async function getExplanation(
  detectionId: string
): Promise<Explanation> {
  type ExplanationData = { explanation: Explanation };

  const envelope = await apiFetch<ExplanationData>(
    `/api/v1/explain/${encodeURIComponent(detectionId)}`
  );
  const { data } = unwrapEnvelope(envelope);
  return data.explanation;
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

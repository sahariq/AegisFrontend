// Aegis API Client
// Connects to the FastAPI backend and provides typed functions for all endpoints

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Generic API envelope wrapper for all responses
 */
export interface ApiEnvelope<T> {
    data: T | null;
    meta?: Record<string, any>;
    error?: {
        code: string;
        message: string;
        details?: any;
    } | null;
}

/**
 * Pagination metadata for list endpoints
 */
export interface PaginationMeta {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
}

/**
 * Health check response
 */
export interface HealthStatus {
    status: string;
    uptime: number;
    version: string;
    components: Record<string, any>;
}

/**
 * System status response
 */
export interface SystemStatus {
    loaded_models: string[];
    supported_attack_types: string[];
    environment: string;
    [key: string]: any;
}

/**
 * Detection input for POST /api/v1/detections
 */
export interface DetectionInput {
    packet_data?: string;
    flow_features?: Record<string, any>;
    metadata?: Record<string, any>;
    [key: string]: any;
}

/**
 * Detection result from POST /api/v1/detections
 */
export interface DetectionResult {
    detection_id: string;
    is_attack: boolean;
    attack_type?: string;
    confidence: number;
    timestamp: string;
    details?: Record<string, any>;
    [key: string]: any;
}

/**
 * Alert object from GET /api/v1/alerts
 */
export interface Alert {
    id: string;
    detection_id?: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    attack_type: string;
    status: 'new' | 'acknowledged' | 'resolved' | 'false_positive';
    timestamp: string;
    description?: string;
    source_ip?: string;
    destination_ip?: string;
    [key: string]: any;
}

/**
 * Query parameters for GET /api/v1/alerts
 */
export interface AlertsParams {
    page?: number;
    page_size?: number;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    attack_type?: string;
    status?: 'new' | 'acknowledged' | 'resolved' | 'false_positive';
    from?: string; // ISO timestamp
    to?: string; // ISO timestamp
    search?: string;
}

/**
 * Metrics overview from GET /api/v1/metrics/overview
 */
export interface MetricsOverview {
    attack_counts: Record<string, number>;
    severity_counts: Record<string, number>;
    total_detections: number;
    total_alerts: number;
    detection_rate?: number;
    [key: string]: any;
}

/**
 * Query parameters for GET /api/v1/metrics/overview
 */
export interface MetricsParams {
    from?: string; // ISO timestamp
    to?: string; // ISO timestamp
    [key: string]: any;
}

/**
 * Explanation response from GET /api/v1/explain/{detection_id}
 */
export interface Explanation {
    detection_id: string;
    explanation: string;
    feature_importance?: Record<string, number>;
    model_used?: string;
    [key: string]: any;
}

/**
 * Alerts response with pagination
 */
export interface AlertsResponse {
    alerts: Alert[];
    meta: PaginationMeta;
}

// ============================================================================
// Configuration
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_AEGIS_API_BASE_URL || 'http://localhost:8000';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Unwraps the API envelope and returns the data or throws an error
 */
function unwrapEnvelope<T>(envelope: ApiEnvelope<T>): T {
    if (envelope.error) {
        throw new Error(`API Error [${envelope.error.code}]: ${envelope.error.message}`);
    }

    if (envelope.data === null || envelope.data === undefined) {
        throw new Error('API returned null data without error');
    }

    return envelope.data;
}

/**
 * Builds a URL with query parameters
 */
function buildUrl(path: string, params?: Record<string, any>): string {
    const url = new URL(path, API_BASE_URL);

    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                url.searchParams.append(key, String(value));
            }
        });
    }

    return url.toString();
}

/**
 * Generic fetch wrapper with error handling
 */
async function apiFetch<T>(
    path: string,
    options?: RequestInit,
    params?: Record<string, any>
): Promise<T> {
    const url = buildUrl(path, params);

    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
        });

        if (!response.ok) {
            // Try to parse error response
            try {
                const errorEnvelope: ApiEnvelope<any> = await response.json();
                if (errorEnvelope.error) {
                    throw new Error(`API Error [${errorEnvelope.error.code}]: ${errorEnvelope.error.message}`);
                }
            } catch (parseError) {
                // If parsing fails, throw generic HTTP error
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        }

        const envelope: ApiEnvelope<T> = await response.json();
        return unwrapEnvelope(envelope);
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error(`Network error: ${String(error)}`);
    }
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Check API health status
 * GET /api/v1/health
 */
export async function checkHealth(): Promise<HealthStatus> {
    return apiFetch<HealthStatus>('/api/v1/health');
}

/**
 * Get system status including loaded models and supported attack types
 * GET /api/v1/system/status
 */
export async function getSystemStatus(): Promise<SystemStatus> {
    return apiFetch<SystemStatus>('/api/v1/system/status');
}

/**
 * Fetch alerts with optional filtering and pagination
 * GET /api/v1/alerts
 */
export async function fetchAlerts(params?: AlertsParams): Promise<AlertsResponse> {
    const response = await apiFetch<{ alerts: Alert[] }>(
        '/api/v1/alerts',
        undefined,
        params as Record<string, any>
    );

    // The envelope's meta contains pagination info
    // We need to fetch it separately since unwrapEnvelope only returns data
    const url = buildUrl('/api/v1/alerts', params as Record<string, any>);
    const rawResponse = await fetch(url);
    const envelope: ApiEnvelope<{ alerts: Alert[] }> = await rawResponse.json();

    return {
        alerts: response.alerts,
        meta: envelope.meta as PaginationMeta,
    };
}

/**
 * Get metrics overview with optional time range filtering
 * GET /api/v1/metrics/overview
 */
export async function getMetricsOverview(params?: MetricsParams): Promise<MetricsOverview> {
    return apiFetch<MetricsOverview>(
        '/api/v1/metrics/overview',
        undefined,
        params as Record<string, any>
    );
}

/**
 * Run a detection on provided input
 * POST /api/v1/detections
 */
export async function runDetection(input: DetectionInput): Promise<DetectionResult> {
    const response = await apiFetch<{ detection: DetectionResult }>(
        '/api/v1/detections',
        {
            method: 'POST',
            body: JSON.stringify(input),
        }
    );

    return response.detection;
}

/**
 * Get explanation for a specific detection
 * GET /api/v1/explain/{detection_id}
 * 
 * @throws Error with code "EXPLANATION_NOT_AVAILABLE" or "DETECTION_NOT_FOUND" if not found
 */
export async function getExplanation(detectionId: string): Promise<Explanation> {
    return apiFetch<Explanation>(`/api/v1/explain/${detectionId}`);
}

// ============================================================================
// Export all types and functions
// ============================================================================

export default {
    checkHealth,
    getSystemStatus,
    fetchAlerts,
    getMetricsOverview,
    runDetection,
    getExplanation,
};

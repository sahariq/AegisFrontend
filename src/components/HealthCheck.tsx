import React, { useEffect, useState } from "react";
import { checkHealth } from "../api/aegisClient.ts";

type HealthStatus = {
  status: string;
  uptime: number;
  version: string;
  components: Record<string, any>;
};

function formatSeconds(seconds: number): string {
  if (!Number.isFinite(seconds)) return "—";
  return `${Math.floor(seconds)}s`;
}

const HealthCheck: React.FC = () => {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadHealth() {
      try {
        setLoading(true);
        setError(null);
        const result = await checkHealth();
        if (!cancelled) {
          setHealth(result);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || "Failed to load health status");
          setHealth(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadHealth();

    return () => {
      cancelled = true;
    };
  }, []);

  let content: React.ReactNode;

  if (loading) {
    content = <span>Checking API health…</span>;
  } else if (error) {
    content = (
      <>
        <span style={{ fontWeight: 600 }}>Status:</span> error{" "}
        <span style={{ marginLeft: "0.5rem", opacity: 0.85 }}>{error}</span>
      </>
    );
  } else if (health) {
    content = (
      <>
        <span style={{ fontWeight: 600 }}>Status:</span>{" "}
        <span>{health.status}</span>
        <span style={{ marginLeft: "0.75rem" }}>
          <span style={{ fontWeight: 600 }}>Version:</span> {health.version}
        </span>
        <span style={{ marginLeft: "0.75rem" }}>
          <span style={{ fontWeight: 600 }}>Uptime:</span>{" "}
          {formatSeconds(health.uptime)}
        </span>
      </>
    );
  } else {
    content = <span>Health status unavailable.</span>;
  }

  return (
    <div
      style={{
        padding: "0.5rem 0.75rem",
        margin: "0.5rem 1rem 0.75rem",
        borderRadius: "999px",
        fontSize: "0.8rem",
        border: "1px solid rgba(148, 163, 184, 0.4)",
        display: "inline-flex",
        alignItems: "center",
        gap: "0.25rem",
      }}
    >
      {content}
    </div>
  );
};

export default HealthCheck;



import React from "react";
import "../../index.css";

function RecentAlertCard({ id, title, severity = "Medium", time, source }) {
  const sev = severity.toLowerCase();

  return (
    <div className={`aegis-alert-card aegis-alert-card--${sev}`}>
      <div className="aegis-alert-strip" />

      <div className="aegis-alert-main">
        <div className="aegis-alert-top-row">
          <span className="aegis-alert-id">{id}</span>
          <span className="aegis-alert-title">{title}</span>
        </div>

        <div className="aegis-alert-bottom-row">
          <span className="aegis-alert-meta">
            {time}
            {source ? ` • ${source}` : ""}
          </span>

          <span className={`aegis-alert-pill aegis-alert-pill--${sev}`}>
            {severity}
          </span>
        </div>
      </div>
    </div>
  );
}

export default RecentAlertCard;



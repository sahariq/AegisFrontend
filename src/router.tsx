import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import OverviewPage from "./pages/OverviewPage.jsx";
import LiveAlertsPage from "./pages/LiveAlertsPage.jsx";
import DetectionPage from "./pages/DetectionPage.jsx";
import MetricsPage from "./pages/MetricsPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import IDSPage from "./pages/IDSPage.jsx";

function AppRoutes() {
  return (
    <Routes>
      {/* New primary dashboard routes */}
      <Route path="/" element={<OverviewPage />} />
      <Route path="/alerts" element={<LiveAlertsPage />} />
      <Route path="/detect" element={<DetectionPage />} />
      <Route path="/metrics" element={<MetricsPage />} />

      {/* Legacy/demo routes kept for compatibility */}
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/ids" element={<IDSPage />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;



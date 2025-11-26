import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Shield,
  ShieldAlert,
  Bot,
  Settings,
} from "lucide-react";
import aegisLogo from "../../assets/aegis-logo.png";
import "../../index.css";

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", path: "/dashboard", Icon: LayoutDashboard },
  { key: "ids", label: "IDS Alerts", path: "/ids", Icon: ShieldAlert },
  { key: "pentesting", label: "Pentesting", path: "/pentesting", Icon: Shield },
  { key: "advisor", label: "Advisor Chatbot", path: "/advisor", Icon: Bot },
  { key: "settings", label: "Settings", path: "/settings", Icon: Settings },
];

function AppShell({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="aegis-shell aegis-shell--collapsed">
      <aside className="aegis-sidebar">
        <div className="aegis-sidebar-top">
          <div className="aegis-sidebar-logo-wrap">
            <img
              src={aegisLogo}
              alt="AEGIS logo"
              className="aegis-sidebar-logo"
            />
          </div>
        </div>

        <div className="aegis-sidebar-search">
          <input className="aegis-sidebar-search-input" placeholder="Search for..." />
        </div>

        <nav className="aegis-sidebar-nav">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const { Icon } = item;
            return (
              <button
                key={item.key}
                type="button"
                className={`aegis-nav-item${isActive ? " aegis-nav-item--active" : ""}`}
                onClick={() => navigate(item.path)}
                aria-current={isActive ? "page" : undefined}
              >
                <span className="aegis-nav-active-bar" aria-hidden="true" />
                <span className="aegis-nav-icon">
                  <Icon size={16} strokeWidth={1.75} />
                </span>
                <span className="aegis-nav-label">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="aegis-sidebar-footer">
          <div className="aegis-user-pill">
            <div className="aegis-user-avatar">S</div>
            <div className="aegis-user-meta">
              <div className="aegis-user-name">Sahar Iqbal</div>
              <div className="aegis-user-role">Security Lead</div>
            </div>
          </div>
        </div>
      </aside>

      <main className="aegis-main">{children}</main>
    </div>
  );
}

export default AppShell;




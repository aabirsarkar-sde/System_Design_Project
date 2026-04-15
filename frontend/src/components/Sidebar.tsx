"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Building2,
  House,
  LayoutDashboard,
  Ticket,
} from "lucide-react";
import "./Sidebar.css";

const navigationItems = [
  {
    href: "/",
    label: "Resident Hub",
    description: "Personal overview and seat access",
    icon: House,
    matches: ["/"],
  },
  {
    href: "/admin",
    label: "Admin Desk",
    description: "Dispatch queue and field teams",
    icon: LayoutDashboard,
    matches: ["/admin"],
  },
  {
    href: "/requests",
    label: "Request Board",
    description: "Track submitted, active, and closed work",
    icon: Ticket,
    matches: ["/requests", "/ticket"],
  },
  {
    href: "/facilities",
    label: "Facilities",
    description: "Operational status across campus sites",
    icon: Building2,
    matches: ["/facilities"],
  },
  {
    href: "/analytics",
    label: "Analytics",
    description: "Performance trends and workload mix",
    icon: BarChart3,
    matches: ["/analytics"],
  },
];

function isItemActive(pathname: string, matches: string[]): boolean {
  return matches.some((match) =>
    match === "/" ? pathname === "/" : pathname.startsWith(match),
  );
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="brand-mark">VC</div>
        <div>
          <p className="brand-kicker">Campus Service Desk</p>
          <h1 className="brand-title">Vanguard Operations</h1>
        </div>
      </div>

      <div className="sidebar-section-label">Workspaces</div>

      <nav className="sidebar-nav" aria-label="Primary">
        <ul>
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(pathname, item.matches);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`nav-item ${active ? "active" : ""}`}
                >
                  <span className="nav-icon">
                    <Icon size={18} />
                  </span>
                  <span className="nav-copy">
                    <strong>{item.label}</strong>
                    <small>{item.description}</small>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="sidebar-brief">
        <span className="sidebar-brief-label">Today&apos;s focus</span>
        <h2>Keep student support visible, calm, and moving.</h2>
        <p>
          Resident, requests, facilities, and analytics now work as one
          coordinated operational flow.
        </p>
      </div>

      <div className="sidebar-footer">
        <span className="sidebar-status-dot" aria-hidden="true" />
        Contest service environment ready
      </div>
    </aside>
  );
}

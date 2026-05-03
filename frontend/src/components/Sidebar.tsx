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

type SidebarProps = {
  showAdminNav?: boolean;
};

export default function Sidebar({ showAdminNav = false }: SidebarProps) {
  const pathname = usePathname();
  const items = showAdminNav
    ? navigationItems
    : navigationItems.filter((item) => item.href !== "/admin");

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="brand-mark">NST</div>
        <div>
          <p className="brand-kicker">Campus</p>
          <h1 className="brand-title">Service desk</h1>
        </div>
      </div>

      <div className="sidebar-section-label">Navigate</div>

      <nav className="sidebar-nav" aria-label="Primary">
        <ul>
          {items.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(pathname, item.matches);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  title={item.description}
                  className={`nav-item ${active ? "active" : ""}`}
                >
                  <span className="nav-icon">
                    <Icon size={17} strokeWidth={1.75} />
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

    </aside>
  );
}

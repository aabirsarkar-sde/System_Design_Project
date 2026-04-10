"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Ticket,
  Building2,
  BarChart3
} from 'lucide-react';
import './Sidebar.css';

export default function Sidebar() {
  const pathname = usePathname();
  
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1 className="brand-title">Vanguard Campus</h1>
        <p className="brand-subtitle">Technical Operations</p>
      </div>

      <nav className="sidebar-nav">
        <ul>
          <li>
            <Link href="/admin" className={`nav-item ${pathname === '/admin' || pathname === '/' ? 'active' : ''}`}>
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </Link>
          </li>
          <li>
            <Link href="/requests" className={`nav-item ${pathname === '/requests' ? 'active' : ''}`}>
              <Ticket size={20} />
              <span>Requests</span>
            </Link>
          </li>
          <li>
            <Link href="/facilities" className={`nav-item ${pathname === '/facilities' ? 'active' : ''}`}>
              <Building2 size={20} />
              <span>Facilities</span>
            </Link>
          </li>
          <li>
            <Link href="/analytics" className={`nav-item ${pathname === '/analytics' ? 'active' : ''}`}>
              <BarChart3 size={20} />
              <span>Analytics</span>
            </Link>
          </li>
        </ul>
      </nav>

      <div className="sidebar-footer"></div>
    </aside>
  );
}

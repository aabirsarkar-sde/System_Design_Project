import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { 
  Wrench, 
  Router, 
  Trash2, 
  Plus, 
  Snowflake, 
  WifiOff, 
  Lightbulb,
  UtensilsCrossed,
  Zap
} from 'lucide-react';
import { fetchFromBackend } from '@/lib/api/server';
import { requireSession } from '@/lib/auth/session';
import type {
  ResidentCampusPulse,
  ResidentDashboardResponse,
  ResidentQuickLaunchItem,
} from '@/lib/api/types';
import './page.css';

export const metadata: Metadata = {
  title: 'Resident Dashboard',
  description: 'Resident view for campus requests, quick actions, and facility updates.',
};

function renderIcon(icon: string, size = 24) {
  switch (icon) {
    case 'wrench':
      return <Wrench size={size} />;
    case 'router':
      return <Router size={size} />;
    case 'trash':
      return <Trash2 size={size} />;
    case 'plus':
      return <Plus size={size} />;
    case 'snowflake':
      return <Snowflake size={size} />;
    case 'wifi':
    case 'wifi-off':
    case 'router-off':
      return <WifiOff size={size} />;
    case 'bulb':
    case 'lightbulb':
      return <Lightbulb size={size} />;
    default:
      return <Wrench size={size} />;
  }
}

function statusBadge(status: string) {
  switch (status) {
    case 'PENDING':
      return { badgeClass: 'badge badge-status-pending', dotClass: 'status-dot pending' };
    case 'DISPATCHED':
      return { badgeClass: 'badge badge-status-dispatched', dotClass: 'status-dot dispatched' };
    case 'IN_PROGRESS':
      return { badgeClass: 'badge badge-status-in-progress', dotClass: 'status-dot in-progress' };
    case 'SCHEDULED':
      return { badgeClass: 'badge badge-status-dispatched', dotClass: 'status-dot dispatched' };
    case 'RESOLVED':
      return { badgeClass: 'badge badge-status-resolved', dotClass: 'status-dot resolved' };
    default:
      return { badgeClass: 'badge badge-status-in-progress', dotClass: 'status-dot in-progress' };
  }
}

function statusLabel(status: string): string {
  return status.replace(/_/g, ' ');
}

function requestIconClass(status: string): string {
  if (status === 'PENDING') {
    return 'req-icon pending';
  }
  if (status === 'DISPATCHED') {
    return 'req-icon dispatched';
  }
  if (status === 'SCHEDULED') {
    return 'req-icon dispatched';
  }
  if (status === 'IN_PROGRESS') {
    return 'req-icon in-progress';
  }
  if (status === 'RESOLVED') {
    return 'req-icon resolved';
  }

  return 'req-icon in-progress';
}

function relativeTimeLabel(isoDate: string): string {
  const createdAt = new Date(isoDate).getTime();
  const diffMs = Date.now() - createdAt;
  const diffHours = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60)));

  if (diffHours < 24) {
    return `Created ${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `Created ${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
}

async function getResidentDashboard(userId: string): Promise<ResidentDashboardResponse | null> {
  try {
    return await fetchFromBackend<ResidentDashboardResponse>(
      `/api/dashboard/resident?userId=${encodeURIComponent(userId)}`,
    );
  } catch {
    return null;
  }
}

function renderQuickLaunchCard(item: ResidentQuickLaunchItem) {
  const iconClass = item.id === 'maintenance' ? 'ql-icon bg-blue-muted' : item.id === 'new-ticket' ? 'ql-icon bg-blue' : 'ql-icon';
  const icon = renderIcon(item.icon, 24);

  return (
    <Link key={item.id} href={item.href} className={`card quick-launch-card ${item.id === 'new-ticket' ? 'ticket-card' : ''}`}>
      <div className={iconClass}>{item.id === 'new-ticket' ? <Plus size={24} color="#fff" /> : icon}</div>
      <h4 className="ql-title">{item.title}</h4>
      <p className="ql-desc">{item.description}</p>
    </Link>
  );
}

function renderPulseCard(item: ResidentCampusPulse) {
  if (item.imageUrl) {
    return (
      <div key={item.id} className="card p-0 overflow-hidden mb-4 pulse-image-card">
        <div className="pulse-image" style={{ backgroundImage: `url('${item.imageUrl}')` }}>
          {item.tag ? <span className="pulse-badge">{item.tag}</span> : null}
        </div>
        <div className="p-4">
          <h4 className="pulse-title">{item.title}</h4>
          <p className="pulse-desc">{item.description}</p>
        </div>
      </div>
    );
  }

  const isWarning = item.type === 'warning';
  return (
    <div key={item.id} className={`card pulse-card flex gap-4 items-start mb-4 ${isWarning ? 'warning' : ''}`}>
      <div className={`pulse-icon ${isWarning ? 'orange' : ''}`}>
        {isWarning ? <Zap size={20} /> : <UtensilsCrossed size={20} />}
      </div>
      <div>
        <h4 className="pulse-title">{item.title}</h4>
        <p className="pulse-desc">{item.description}</p>
      </div>
    </div>
  );
}

export default async function ResidentDashboard() {
  const session = await requireSession();
  const dashboard = await getResidentDashboard(session.userId);

  if (!dashboard) {
    return (
      <main className="dashboard-container">
        <div className="dashboard-main">
          <section className="card">
            <h2 className="welcome-title">Dashboard Unavailable</h2>
            <p className="welcome-subtitle">We could not load resident data from the backend API.</p>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="dashboard-container">
      <div className="dashboard-main">
        <section className="welcome-section flex justify-between items-center mb-8">
          <div>
            <h2 className="welcome-title">Welcome, <span className="text-blue">{dashboard.userName.split(' ')[0]}</span></h2>
            <p className="welcome-subtitle">
              Your campus command center is online. You have {dashboard.activeRequests} active <br/> 
              maintenance tickets and {dashboard.upcomingBookings} upcoming facility booking{dashboard.upcomingBookings === 1 ? '' : 's'}.
              <br />
              {session.seatNumber && session.classroomNumber
                ? `Exam seat ${session.seatNumber} in ${session.classroomNumber}.`
                : 'Your student allocation is synced from the registrar import.'}
            </p>
          </div>
          <div className="flex gap-4">
            <div className="stat-card">
              <div className="stat-label">ACTIVE REQUESTS</div>
              <div className="stat-value">{String(dashboard.activeRequests).padStart(2, '0')}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">UPCOMING</div>
              <div className="stat-value">{String(dashboard.upcomingBookings).padStart(2, '0')}</div>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h3 className="section-title">Quick Launch</h3>
          <div className="quick-launch-grid">
            {dashboard.quickLaunch.map((item) => renderQuickLaunchCard(item))}
          </div>
        </section>

        <section>
          <div className="flex justify-between items-center mb-4">
            <h3 className="section-title mb-0">Recent Requests</h3>
            <Link href="/requests" className="text-xs text-secondary font-semibold hover:text-white uppercase tracking-wider">VIEW ALL</Link>
          </div>
          <div className="card requests-list flex-col gap-0 p-0">
            {dashboard.recentRequests.length === 0 ? (
              <div className="request-row flex items-center justify-between border-none">
                <div>
                  <h5 className="req-title">No requests yet</h5>
                  <p className="req-meta">Create your first maintenance or support ticket to start tracking it here.</p>
                </div>
                <Link href="/ticket/new" className="btn btn-primary">Raise Ticket</Link>
              </div>
            ) : (
              dashboard.recentRequests.map((request, index) => {
                const badge = statusBadge(request.status);
                const iconClass = requestIconClass(request.status);
                const rowClass = `request-row flex items-center justify-between ${index === dashboard.recentRequests.length - 1 ? 'border-none' : ''}`;

                return (
                  <div key={request.requestId} className={rowClass}>
                    <div className="flex items-center gap-4">
                      <div className={iconClass}>{renderIcon(request.icon, 20)}</div>
                      <div>
                        <h5 className="req-title">{request.title}</h5>
                        <p className="req-meta">Ticket #{request.ticketCode} • {relativeTimeLabel(request.createdAt)}</p>
                      </div>
                    </div>
                    <span className={badge.badgeClass}><span className={badge.dotClass}></span> {statusLabel(request.status)}</span>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>

      <aside className="dashboard-sidebar">
        <h3 className="section-title">Campus Pulse</h3>

        {dashboard.campusPulse.map((item) => renderPulseCard(item))}
      </aside>
    </main>
  );
}

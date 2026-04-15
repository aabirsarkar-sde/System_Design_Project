import React from 'react';
import Image from 'next/image';
import type { Metadata } from 'next';
import { 
  ClipboardList,
  AlertOctagon,
  Timer,
  CheckCircle2,
  Wifi,
  Snowflake,
  Lock,
  Package,
  CheckSquare,
  AlertTriangle,
  Users
} from 'lucide-react';
import { fetchFromBackend } from '@/lib/api/server';
import { requireSession } from '@/lib/auth/session';
import type { AdminDashboardResponse, AdminEvent, AdminQueueItem } from '@/lib/api/types';
import './page.css';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Administrative operations dashboard for dispatch queue, field units, and live service telemetry.',
};

function categoryIcon(category: string) {
  const normalized = category.toLowerCase();

  if (normalized.includes('network') || normalized.includes('it')) {
    return <Wifi size={14} className="text-secondary" />;
  }
  if (normalized.includes('hvac') || normalized.includes('maintenance')) {
    return <Snowflake size={14} className="text-secondary" />;
  }
  if (normalized.includes('security')) {
    return <Lock size={14} className="text-secondary" />;
  }

  return <Package size={14} className="text-secondary" />;
}

function statusBadge(status: string): { className: string; dotClass: string } {
  if (status === 'PENDING') {
    return { className: 'badge badge-status-pending', dotClass: 'status-dot pending' };
  }
  if (status === 'DISPATCHED') {
    return { className: 'badge badge-status-dispatched', dotClass: 'status-dot dispatched' };
  }
  if (status === 'SCHEDULED') {
    return { className: 'badge badge-status-dispatched', dotClass: 'status-dot dispatched' };
  }
  if (status === 'IN_PROGRESS') {
    return { className: 'badge badge-status-in-progress', dotClass: 'status-dot in-progress' };
  }
  if (status === 'RESOLVED') {
    return { className: 'badge badge-status-resolved', dotClass: 'status-dot resolved' };
  }

  return { className: 'badge badge-status-in-progress', dotClass: 'status-dot in-progress' };
}

function priorityBadge(priority: string): string {
  if (priority === 'EMERGENCY') {
    return 'badge badge-priority-emergency';
  }
  if (priority === 'HIGH') {
    return 'badge badge-priority-high';
  }
  if (priority === 'MEDIUM') {
    return 'badge badge-priority-medium';
  }

  return 'badge badge-priority-low';
}

function eventIcon(event: AdminEvent) {
  if (event.type === 'resolved') {
    return (
      <div className="event-icon bg-blue-muted text-blue">
        <CheckSquare size={16} />
      </div>
    );
  }

  if (event.type === 'alert') {
    return (
      <div className="event-icon bg-danger-muted text-danger">
        <AlertTriangle size={16} />
      </div>
    );
  }

  return (
    <div className="event-icon bg-orange-muted text-orange">
      <Users size={16} />
    </div>
  );
}

async function getAdminDashboard(): Promise<AdminDashboardResponse | null> {
  try {
    return await fetchFromBackend<AdminDashboardResponse>('/api/dashboard/admin');
  } catch {
    return null;
  }
}

function queueRow(item: AdminQueueItem, isLast: boolean) {
  const status = statusBadge(item.status);
  const assignmentAvatars = item.assignedAvatars.slice(0, 2);
  const overflowCount = Math.max(0, item.assignedAvatars.length - assignmentAvatars.length);

  return (
    <tr key={item.requestId} className={isLast ? 'border-none' : ''}>
      <td className="font-semibold text-sm">#{item.ticketCode}</td>
      <td>
        <div className="flex items-center gap-3">
          <div className="avatar">
            <Image src={item.requesterAvatar} alt={item.requesterName} width={36} height={36} />
          </div>
          <div>
            <div className="font-semibold text-sm">{item.requesterName}</div>
            <div className="text-xs text-secondary">{item.requesterUnit}</div>
          </div>
        </div>
      </td>
      <td className="text-sm">
        <div className="flex items-center gap-2">
          {categoryIcon(item.category)}
          {item.category}
        </div>
      </td>
      <td>
        <span className={status.className}><span className={status.dotClass}></span> {item.status.replace(/_/g, ' ')}</span>
      </td>
      <td>
        <span className={priorityBadge(item.priority)}>{item.priority}</span>
      </td>
      <td>
        <div className="flex justify-start">
          {assignmentAvatars.map((avatar, index) => (
            <div key={`${item.requestId}-${avatar}`} className={`avatar assigned-avatar ${index === 0 ? 'z-2' : 'z-1 -ml-2'}`}>
              <Image src={avatar} alt="Assigned staff" width={28} height={28} />
            </div>
          ))}
          {overflowCount > 0 ? (
            <div className="avatar assigned-avatar overflow-avatar z-1 -ml-2 text-xs bg-card flex items-center justify-center">+{overflowCount}</div>
          ) : null}
        </div>
      </td>
      <td className="text-secondary text-sm">Read only</td>
    </tr>
  );
}

export default async function AdminDashboard() {
  await requireSession();
  const dashboard = await getAdminDashboard();

  if (!dashboard) {
    return (
      <main className="admin-container">
        <section className="card">
          <h2 className="text-2xl font-bold mb-2">Admin Dashboard Unavailable</h2>
          <p className="text-sm text-secondary">We could not load admin analytics and dispatch queue data.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-container">
      <section className="stats-grid mb-8">
        <div className="stat-card-lg">
          <div className="flex justify-between items-start mb-4">
            <div className="stat-icon-sm bg-blue-muted"><ClipboardList size={20} className="text-blue" /></div>
            <span className="badge badge-gray text-xs tracking-widest">LIVE</span>
          </div>
          <div className="stat-label">TOTAL OPEN</div>
          <div className="stat-value text-3xl">{dashboard.stats.totalOpen}</div>
          <div className="stat-trend flex items-center gap-2 mt-4 text-secondary text-xs">
             <span className="text-primary font-medium">↗ +12%</span> from last shift
          </div>
        </div>

        <div className="stat-card-lg">
          <div className="flex justify-between items-start mb-4">
            <div className="stat-icon-sm bg-danger-muted"><AlertOctagon size={20} className="text-danger" /></div>
            <span className="badge badge-danger text-xs tracking-widest text-danger border-danger">CRITICAL</span>
          </div>
          <div className="stat-label">HIGH PRIORITY</div>
          <div className="stat-value text-3xl">{dashboard.stats.highPriority}</div>
          <div className="stat-trend flex items-center gap-2 mt-4 text-warning text-xs">
             <Timer size={14} /> Avg response 4.2m
          </div>
        </div>

        <div className="stat-card-lg">
          <div className="flex justify-between items-start mb-4">
            <div className="stat-icon-sm bg-orange-muted"><Timer size={20} className="text-orange" /></div>
          </div>
          <div className="stat-label">AVG. RESOLUTION</div>
          <div className="stat-value text-3xl">{dashboard.stats.avgResolution}</div>
          <div className="stat-trend flex items-center gap-2 mt-4 text-primary text-xs">
             <CheckCircle2 size={14} className="text-orange" /> -15m target variance
          </div>
        </div>

        <div className="stat-card-lg">
          <div className="flex justify-between items-start mb-4">
            <div className="stat-icon-sm bg-blue-muted"><CheckCircle2 size={20} className="text-blue" /></div>
          </div>
          <div className="stat-label">RESOLVED TODAY</div>
          <div className="stat-value text-3xl">{dashboard.stats.resolvedToday}</div>
          <div className="stat-trend flex items-center gap-2 mt-4 text-blue text-xs">
             <CheckCircle2 size={14} /> 98% satisfaction rate
          </div>
        </div>
      </section>

      <section className="mb-8">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h3 className="text-xl font-bold mb-1">Active Dispatch Queue</h3>
            <p className="text-sm text-secondary">Real-time infrastructure and service request monitoring.</p>
          </div>
        </div>

        <div className="table-container card p-0">
          <table className="dispatch-table">
            <thead>
              <tr>
                <th>REQUEST ID</th>
                <th>REQUESTER</th>
                <th>CATEGORY</th>
                <th>STATUS</th>
                <th>PRIORITY</th>
                <th>ASSIGNMENT</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {dashboard.queue.map((item, index) => queueRow(item, index === dashboard.queue.length - 1))}
            </tbody>
          </table>

          <div className="pagination-footer flex justify-between items-center p-4 border-t border-border">
            <span className="text-xs text-secondary font-semibold tracking-wider uppercase">SHOWING {dashboard.queue.length} OF {dashboard.stats.totalOpen} ACTIVE REQUESTS</span>
            <span className="text-xs text-secondary">Live snapshot</span>
          </div>
        </div>
      </section>

      <div className="admin-bottom-grid flex gap-6">
        <section className="card flex-1">
           <h3 className="font-semibold text-primary mb-6">Field Units Status</h3>

           {dashboard.fieldUnits.map((unit, index) => (
             <div key={unit.label} className={index === dashboard.fieldUnits.length - 1 ? 'mb-0' : 'mb-4'}>
               <div className="flex justify-between text-sm mb-2 font-medium">
                 <div className="flex items-center gap-2"><div className={`status-dot ${index === 1 ? 'orange' : 'gray'}`}></div> {unit.label}</div>
                 <div>{unit.count}</div>
               </div>
               <div className="progress-bar-bg"><div className={`progress-bar-fill ${index === 1 ? 'bg-orange' : 'bg-primary'}`} style={{ width: `${unit.percentage}%` }}></div></div>
             </div>
           ))}
        </section>

        <section className="card flex-2">
           <h3 className="font-semibold text-primary mb-6">Real-Time Event Stream</h3>
           <div className="events-list">
             {dashboard.eventStream.map((event, index) => (
               <div key={event.id} className={`event-item ${index === dashboard.eventStream.length - 1 ? 'border-none pb-0 mb-0' : ''}`}>
                 {eventIcon(event)}
                 <div>
                   <p className="text-sm">{event.text}</p>
                   <span className="text-xs text-secondary">{event.timestampLabel}</span>
                 </div>
               </div>
             ))}
           </div>
        </section>
      </div>
    </main>
  );
}

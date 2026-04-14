import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { MessageSquare, Paperclip, Clock } from 'lucide-react';
import { fetchFromBackend } from '@/lib/api/server';
import { DEFAULT_USER_ID } from '@/lib/constants';
import type { RequestBoardColumn, RequestBoardResponse } from '@/lib/api/types';
import './page.css';

export const metadata: Metadata = {
  title: 'Requests Board',
  description: 'Track service requests by stage, priority, and assignment on the operational board.',
};

async function getRequestBoard(): Promise<RequestBoardResponse | null> {
  try {
    return await fetchFromBackend<RequestBoardResponse>(`/api/requests/board?userId=${encodeURIComponent(DEFAULT_USER_ID)}`);
  } catch {
    return null;
  }
}

function columnTone(column: RequestBoardColumn): { dotClass: string; badgeClass: string } {
  if (column.tone === 'accent') {
    return { dotClass: 'status-dot blue', badgeClass: 'badge badge-primary' };
  }
  if (column.tone === 'success') {
    return { dotClass: 'status-dot', badgeClass: 'badge badge-gray text-success' };
  }

  return { dotClass: 'status-dot gray', badgeClass: 'badge badge-gray' };
}

function priorityClass(priority: string): string {
  if (priority === 'EMERGENCY') {
    return 'badge badge-priority-emergency text-xs';
  }
  if (priority === 'HIGH') {
    return 'badge badge-priority-high text-xs';
  }
  if (priority === 'MEDIUM') {
    return 'badge badge-priority-medium text-xs';
  }

  return 'badge badge-priority-low text-xs';
}

function statusClass(status: string): string {
  if (status === 'PENDING') {
    return 'status-text-pending';
  }
  if (status === 'DISPATCHED') {
    return 'status-text-dispatched';
  }
  if (status === 'IN_PROGRESS') {
    return 'status-text-in-progress';
  }
  if (status === 'RESOLVED') {
    return 'status-text-resolved';
  }

  return 'text-secondary';
}

export default async function RequestsPage() {
  const requestBoard = await getRequestBoard();

  if (!requestBoard) {
    return (
      <main className="requests-container animate-fade-in">
        <section className="card">
          <h2 className="text-2xl font-bold mb-2">Requests Unavailable</h2>
          <p className="text-sm text-secondary">Unable to load service request board from backend API.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="requests-container animate-fade-in">
      <div className="requests-header flex justify-between items-end mb-8 animate-slide-up delay-100">
        <div>
          <h2 className="text-2xl font-bold mb-1">Service Requests</h2>
          <p className="text-sm text-secondary">Manage and track your active support tickets.</p>
        </div>
        <Link href="/ticket/new" className="btn btn-primary">Create New Request</Link>
      </div>

      <div className="kanban-board">
        {requestBoard.columns.map((column, columnIndex) => {
          const tone = columnTone(column);
          const delayClass = columnIndex === 0 ? 'delay-200' : columnIndex === 1 ? 'delay-300' : 'delay-400';

          return (
            <div key={column.id} className={`kanban-col animate-slide-up ${delayClass}`}>
              <div className="kanban-header">
                <h3 className="font-semibold flex items-center gap-2">
                  <span
                    className={tone.dotClass}
                    style={column.tone === 'accent' ? { animation: 'pulseSoft 2s infinite' } : column.tone === 'success' ? { backgroundColor: 'var(--success)', boxShadow: '0 0 8px var(--success)' } : undefined}
                  ></span>
                  {column.title}
                </h3>
                <span className={tone.badgeClass} style={column.tone === 'success' ? { borderColor: 'rgba(56, 189, 248, 0.28)' } : undefined}>{column.count}</span>
              </div>

              {column.cards.length === 0 ? (
                <div className="kanban-cards flex items-center justify-center h-48 border2 border-dashed border-border rounded-md">
                  <p className="text-sm text-secondary">No requests in this stage.</p>
                </div>
              ) : (
                <div className="kanban-cards">
                  {column.cards.map((card) => (
                    <div key={card.requestId} className={`card kanban-card ${column.tone === 'accent' ? 'border-blue' : ''}`}>
                      <div className="flex justify-between items-start mb-2">
                        <span className={priorityClass(card.priority)}>{card.priority}</span>
                        <span className="text-xs text-secondary">#{card.ticketCode}</span>
                      </div>
                      <h4 className="font-semibold mb-2">{card.title}</h4>
                      <p className="text-xs text-secondary mb-1">{card.description}</p>
                      <p className="text-xs text-secondary mb-4">
                        Status: <span className={statusClass(card.status)}>{card.status.replace(/_/g, ' ')}</span>
                      </p>
                      <div className="flex justify-between items-center text-xs text-secondary">
                        {card.priority === 'EMERGENCY' ? (
                          <span className="flex items-center gap-1 text-orange"><Clock size={12} /> Exceeding SLA</span>
                        ) : (
                          <div className="flex gap-3">
                            <span className="flex items-center gap-1"><MessageSquare size={12} /> {card.comments}</span>
                            <span className="flex items-center gap-1"><Paperclip size={12} /> {card.attachments}</span>
                          </div>
                        )}
                        <div className="avatar assigned-avatar w-6 h-6 border-none">
                          <Image src={card.assigneeAvatar} alt="Assignee avatar" width={24} height={24} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}

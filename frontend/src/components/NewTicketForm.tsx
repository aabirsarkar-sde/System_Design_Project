"use client";

import React, { FormEvent, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Wrench,
  MapPin,
  UploadCloud,
  Info,
  Monitor,
  Trash2,
} from 'lucide-react';
import { DEFAULT_USER_ID } from '@/lib/constants';
import type {
  CreateRequestResponse,
  TicketFormConfigResponse,
} from '@/lib/api/types';

interface NewTicketFormProps {
  config: TicketFormConfigResponse;
}

type FeedbackState =
  | { type: 'success'; message: string }
  | { type: 'error'; message: string }
  | null;

function categoryIcon(code: string) {
  if (code === 'MAINTENANCE') {
    return <Wrench size={24} className="text-blue" />;
  }
  if (code === 'IT_SUPPORT') {
    return <Monitor size={24} />;
  }

  return <Trash2 size={24} />;
}

function priorityLabel(priority: string): string {
  switch (priority) {
    case 'LOW':
      return 'Routine';
    case 'MEDIUM':
      return 'Urgent';
    case 'HIGH':
      return 'High';
    case 'EMERGENCY':
      return 'Emergency';
    default:
      return priority;
  }
}

export default function NewTicketForm({ config }: NewTicketFormProps) {
  const [category, setCategory] = useState(config.categories[0]?.code ?? 'MAINTENANCE');
  const [priority, setPriority] = useState(config.priorities[0] ?? 'LOW');
  const [title, setTitle] = useState('');
  const [building, setBuilding] = useState('');
  const [room, setRoom] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  const selectedCategory = useMemo(
    () => config.categories.find((item) => item.code === category),
    [category, config.categories],
  );

  const resetForm = () => {
    setCategory(config.categories[0]?.code ?? 'MAINTENANCE');
    setPriority(config.priorities[0] ?? 'LOW');
    setTitle('');
    setBuilding('');
    setRoom('');
    setDescription('');
    setFeedback(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);
    setIsSubmitting(true);

    try {
      const payload = {
        userId: DEFAULT_USER_ID,
        title,
        description,
        category,
        building,
        room,
        priority,
      };

      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const body = (await response.json().catch(() => ({ message: 'Request failed' }))) as
        | (CreateRequestResponse & { message?: string })
        | { message?: string };

      if (!response.ok || !('ticketCode' in body)) {
        setFeedback({ type: 'error', message: body.message ?? 'Could not create request. Please verify your details.' });
        return;
      }

      setFeedback({
        type: 'success',
        message: `Request submitted successfully. Ticket #${body.ticketCode} is now ${body.status.replace(/_/g, ' ')}.`,
      });
      setTitle('');
      setBuilding('');
      setRoom('');
      setDescription('');
      setPriority(config.priorities[0] ?? 'LOW');
    } catch {
      setFeedback({ type: 'error', message: 'Network error while submitting your request.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="ticket-container">
      <div className="progress-container mb-8">
        <div className="progress-line"></div>
        <div className="progress-steps">
          <div className="step active">
            <div className="step-circle active">1</div>
            <div className="step-label">CATEGORY</div>
          </div>
          <div className="step active">
            <div className="step-circle active">2</div>
            <div className="step-label">LOCATION</div>
          </div>
          <div className="step active">
            <div className="step-circle active">3</div>
            <div className="step-label">URGENCY</div>
          </div>
        </div>
      </div>

      {feedback ? (
        <div className={`ticket-feedback ${feedback.type}`} role="status" aria-live="polite">
          {feedback.message}
          {feedback.type === 'success' ? (
            <Link href="/requests" className="ticket-feedback-link">View request board</Link>
          ) : null}
        </div>
      ) : null}

      <form onSubmit={handleSubmit}>
        <div className="ticket-content">
          <div className="ticket-main-col">
            <section className="card mb-6">
              <h3 className="flex items-center gap-2 font-semibold text-lg mb-6">
                <Wrench size={20} className="text-secondary" />
                Service Category
              </h3>

              <div className="category-grid">
                {config.categories.map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    className={`category-card ${item.code === category ? 'selected' : ''}`}
                    onClick={() => setCategory(item.code)}
                  >
                    <div className={`cat-icon ${item.code === 'MAINTENANCE' ? 'bg-blue-muted' : ''}`}>
                      {categoryIcon(item.code)}
                    </div>
                    <span className={`cat-label ${item.code === category ? 'text-primary' : ''}`}>{item.label}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="card mb-6 location-details">
              <h3 className="flex items-center gap-2 font-semibold text-lg mb-6">
                <MapPin size={20} className="text-secondary" />
                Location & Details
              </h3>

              <div className="form-group mb-6">
                <label>ISSUE TITLE</label>
                <input
                  type="text"
                  required
                  minLength={6}
                  maxLength={120}
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Short summary of the issue"
                />
              </div>

              <div className="flex gap-4 mb-6">
                <div className="form-group flex-1">
                  <label>BUILDING NAME</label>
                  <input
                    type="text"
                    required
                    minLength={2}
                    maxLength={100}
                    value={building}
                    onChange={(event) => setBuilding(event.target.value)}
                    placeholder="North Wing - Engineering Complex"
                  />
                </div>
                <div className="form-group flex-1">
                  <label>ROOM NUMBER</label>
                  <input
                    type="text"
                    required
                    minLength={1}
                    maxLength={50}
                    value={room}
                    onChange={(event) => setRoom(event.target.value)}
                    placeholder="e.g. 402-B"
                  />
                </div>
              </div>

              <div className="form-group mb-6">
                <label>ISSUE DESCRIPTION</label>
                <textarea
                  rows={4}
                  required
                  minLength={10}
                  maxLength={2000}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Describe the issue in detail"
                ></textarea>
              </div>

              <div className="form-group mb-0">
                <label>ATTACHMENT (OPTIONAL)</label>
                <div className="upload-zone" aria-hidden="true">
                  <UploadCloud size={24} className="text-secondary mb-2" />
                  <p>Attachment upload is available in the next release.</p>
                </div>
              </div>
            </section>

            <section className="card">
              <h3 className="flex items-center gap-2 font-semibold text-lg mb-6">
                <span className="text-secondary font-bold text-xl ml-1 mr-1">!</span>
                Priority Level
              </h3>

              <div className="flex gap-6">
                {config.priorities.map((item) => (
                  <label key={item} className="radio-group">
                    <input
                      type="radio"
                      name="priority"
                      value={item}
                      checked={priority === item}
                      onChange={(event) => setPriority(event.target.value)}
                    />
                    <span className="radio-label">{priorityLabel(item)}</span>
                  </label>
                ))}
              </div>
            </section>
          </div>

          <div className="ticket-side-col">
            <div className="card mb-6">
              <h3 className="font-semibold text-lg mb-6 border-b border-border pb-4">Request Summary</h3>
              <div className="summary-row">
                <span className="summary-label">TYPE</span>
                <span className="summary-val text-primary text-right">{selectedCategory?.label ?? 'Maintenance'}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">LOCATION</span>
                <div className="text-right">
                  <span className="summary-val text-primary block">{building || 'Building not set'}</span>
                  <span className="summary-val">{room || 'Room not set'}</span>
                </div>
              </div>
              <div className="summary-row border-none pb-0">
                <span className="summary-label">SLA GOAL</span>
                <span className="summary-val text-orange text-right">{config.slaGoal}</span>
              </div>
            </div>

            <div className="card text-secondary text-sm mb-6 pb-0 bg-transparent border-none p-0">
              <div className="flex items-center gap-2 text-primary font-semibold mb-4 text-base">
                <Info size={18} className="text-orange" />
                Technical Guidelines
              </div>
              <ul className="guidelines-list">
                {config.guidelines.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="card p-0 overflow-hidden pulse-image-card">
              <div className="pulse-image" style={{ backgroundImage: `url('${config.campusStatus.imageUrl}')` }}>
                <div className="status-overlay">
                  <div className="pulse-badge">{config.campusStatus.label}</div>
                  <div className="font-bold text-shadow mt-1">{config.campusStatus.message}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="ticket-actions flex justify-between items-center mt-8 pt-6 border-t border-border">
          <button type="button" onClick={resetForm} className="text-sm font-semibold tracking-wider hover:text-white uppercase">DISCARD</button>
          <div className="flex gap-4">
            <button type="submit" disabled={isSubmitting} className="btn btn-primary uppercase tracking-wider font-semibold text-sm px-8 py-3">
              {isSubmitting ? 'SUBMITTING...' : 'SUBMIT REQUEST'}
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}

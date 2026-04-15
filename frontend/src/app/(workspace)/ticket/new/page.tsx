import type { Metadata } from 'next';
import { fetchFromBackend } from '@/lib/api/server';
import { requireSession } from '@/lib/auth/session';
import type { TicketFormConfigResponse } from '@/lib/api/types';
import NewTicketForm from '@/components/NewTicketForm';
import './page.css';

export const metadata: Metadata = {
  title: 'Create Ticket',
  description: 'Submit a new campus service request with category, location, and priority details.',
};

async function getFormConfig(): Promise<TicketFormConfigResponse | null> {
  try {
    return await fetchFromBackend<TicketFormConfigResponse>('/api/ticket/form-config');
  } catch {
    return null;
  }
}

export default async function NewTicketPage() {
  await requireSession();
  const config = await getFormConfig();

  if (!config) {
    return (
      <main className="page-shell">
        <section className="panel">
          <h2 className="text-2xl font-bold mb-2">Ticket Form Unavailable</h2>
          <p className="text-sm text-secondary">Unable to load request categories and SLA details from backend API.</p>
        </section>
      </main>
    );
  }

  return (
    <NewTicketForm config={config} />
  );
}

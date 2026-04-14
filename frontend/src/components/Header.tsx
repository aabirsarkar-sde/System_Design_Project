import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Bell, Settings } from 'lucide-react';
import { DEFAULT_USER_ID } from '@/lib/constants';
import { fetchFromBackend } from '@/lib/api/server';
import type { ApiHealthResponse, HeaderProfileResponse } from '@/lib/api/types';
import './Header.css';

async function getHeaderData(): Promise<{ profile: HeaderProfileResponse | null; health: ApiHealthResponse | null }> {
  try {
    const [profile, health] = await Promise.all([
      fetchFromBackend<HeaderProfileResponse>(`/api/header/me?userId=${encodeURIComponent(DEFAULT_USER_ID)}`),
      fetchFromBackend<ApiHealthResponse>('/api/health'),
    ]);

    return { profile, health };
  } catch {
    return { profile: null, health: null };
  }
}

export default async function Header() {
  const { profile, health } = await getHeaderData();
  const isApiOnline = Boolean(health?.ok);

  return (
    <header className="header">
      <div className="header-left">
        {/* Placeholder if we want breadcrumbs or specific title */}
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Search dispatch logs..." />
        </div>
      </div>

      <div className="header-right flex items-center gap-6">
        <div className={`api-status ${isApiOnline ? 'online' : 'offline'}`}>
          <span className="api-status-dot"></span>
          <span>{isApiOnline ? 'API ONLINE' : 'API OFFLINE'}</span>
        </div>

        <div className="flex items-center gap-4 text-secondary">
          <button className="icon-btn">
            <Bell size={20} />
            <span className="notification-dot"></span>
            {profile && profile.unreadNotifications > 0 ? (
              <span className="notification-count">{profile.unreadNotifications}</span>
            ) : null}
          </button>
          <button className="icon-btn">
            <Settings size={20} />
          </button>
        </div>

        <Link href="/ticket/new" className="btn btn-primary">
          New Ticket
        </Link>
        
        <div className="user-profile flex items-center gap-3 border-l border-border pl-6">
          <div className="user-info text-right">
            <div className="font-semibold text-sm">{profile?.name ?? 'Unknown User'}</div>
            <div className="text-xs text-secondary">{profile?.role.replace(/_/g, ' ') ?? 'Offline'}</div>
          </div>
          <div className="avatar">
            <Image
              src={profile?.avatarUrl ?? 'https://i.pravatar.cc/150?u=offline-user'}
              alt={profile?.name ?? 'User Avatar'}
              width={38}
              height={38}
            />
          </div>
        </div>
      </div>
    </header>
  );
}

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Bell, LogOut } from 'lucide-react';
import { fetchFromBackend } from '@/lib/api/server';
import type { ApiHealthResponse, HeaderProfileResponse } from '@/lib/api/types';
import { getSession } from '@/lib/auth/session';
import './Header.css';

async function getHeaderData(
  userId?: string,
): Promise<{ profile: HeaderProfileResponse | null; health: ApiHealthResponse | null }> {
  try {
    const [profile, health] = await Promise.all([
      userId
        ? fetchFromBackend<HeaderProfileResponse>(
            `/api/header/me?userId=${encodeURIComponent(userId)}`,
          )
        : Promise.resolve(null),
      fetchFromBackend<ApiHealthResponse>('/api/health'),
    ]);

    return { profile, health };
  } catch {
    return { profile: null, health: null };
  }
}

export default async function Header() {
  const session = await getSession();
  const { profile, health } = await getHeaderData(session?.userId);
  const activeUser = profile ?? session;
  const isApiOnline = Boolean(health?.ok);
  const isLoggedIn = Boolean(session);

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
        </div>

        {isLoggedIn ? (
          <>
            <Link href="/ticket/new" className="btn btn-primary">
              New Ticket
            </Link>

            <form action="/api/auth/logout" method="post">
              <button className="icon-btn" type="submit" aria-label="Sign out">
                <LogOut size={20} />
              </button>
            </form>
          </>
        ) : (
          <Link href="/login" className="btn btn-primary">
            Sign In
          </Link>
        )}
        
        <div className="user-profile flex items-center gap-3 border-l border-border pl-6">
          <div className="user-info text-right">
            <div className="font-semibold text-sm">{activeUser?.name ?? 'Guest User'}</div>
            <div className="text-xs text-secondary">{activeUser?.role.replace(/_/g, ' ') ?? 'Sign in required'}</div>
          </div>
          <div className="avatar">
            <Image
              src={activeUser?.avatarUrl ?? 'https://i.pravatar.cc/150?u=offline-user'}
              alt={activeUser?.name ?? 'User Avatar'}
              width={38}
              height={38}
            />
          </div>
        </div>
      </div>
    </header>
  );
}

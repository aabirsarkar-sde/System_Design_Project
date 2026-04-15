import React from 'react';
import type { Metadata } from 'next';
import { TrendingUp, Activity } from 'lucide-react';
import { fetchFromBackend } from '@/lib/api/server';
import { requireSession } from '@/lib/auth/session';
import type { AnalyticsResponse } from '@/lib/api/types';
import './page.css';

export const metadata: Metadata = {
   title: 'Analytics',
   description: 'Operational analytics for service resolution trends, request volume, and category performance.',
};

async function getAnalytics(): Promise<AnalyticsResponse | null> {
   try {
      return await fetchFromBackend<AnalyticsResponse>('/api/analytics');
   } catch {
      return null;
   }
}

function progressClass(index: number): string {
   if (index === 1) {
      return 'progress-bar-fill bg-orange';
   }
   if (index === 2) {
      return 'progress-bar-fill bg-danger';
   }

   return 'progress-bar-fill bg-blue';
}

export default async function AnalyticsPage() {
   await requireSession();
   const analytics = await getAnalytics();

   if (!analytics) {
      return (
         <main className="analytics-container animate-fade-in">
            <section className="card">
               <h2 className="text-2xl font-bold mb-2">Analytics Unavailable</h2>
               <p className="text-sm text-secondary">Unable to fetch analytics metrics from the backend API.</p>
            </section>
         </main>
      );
   }

   const requestVolumePoints = analytics.requestVolume.map((rawValue, index, allValues) => {
      const clamped = Math.max(6, Math.min(94, rawValue));
      const x = allValues.length === 1 ? 50 : (index / (allValues.length - 1)) * 100;
      const y = 100 - clamped;

      return {
         x,
         y,
      };
   });

   const volumePolyline = requestVolumePoints.map((point) => `${point.x},${point.y}`).join(' ');

  return (
    <main className="analytics-container animate-fade-in">
      <div className="flex justify-between items-end mb-8 animate-slide-up delay-100">
        <div>
          <h2 className="text-2xl font-bold mb-1">System Analytics</h2>
          <p className="text-sm text-secondary">Historical performance and resource allocation metrics.</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="card animate-slide-up delay-200 h-auto shrink-0 flex flex-col justify-between">
           <div>
              <h3 className="font-semibold mb-4 flex justify-between items-center">
                 Resolution Time
              </h3>
              <div className="text-4xl font-bold mb-2">{analytics.resolutionTime.value}</div>
              <div className="text-success text-sm flex gap-1 items-center"><TrendingUp size={14} /> {analytics.resolutionTime.trendLabel}</div>
           </div>

           <div className="chart-bars flex items-end justify-between h-32 gap-2 mt-4">
              {analytics.resolutionTime.bars.map((value, index) => (
                <div key={`${value}-${index}`} className={`bar ${index === 4 ? 'active' : ''}`} style={{ height: `${value}%` }}></div>
              ))}
           </div>
        </div>

        <div className="card animate-slide-up delay-300 h-auto col-span-2">
           <h3 className="font-semibold mb-6 flex justify-between items-center">
              Request Volume Trends
           </h3>

                <div className="mock-graph-container relative">
                     {requestVolumePoints.length > 0 ? (
                        <>
                           <svg className="volume-graph" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                              <defs>
                                 <linearGradient id="requestVolumeArea" x1="0" x2="0" y1="0" y2="1">
                                    <stop offset="0%" stopColor="rgba(56, 189, 248, 0.45)" />
                                    <stop offset="100%" stopColor="rgba(56, 189, 248, 0.05)" />
                                 </linearGradient>
                              </defs>
                              <polygon className="volume-area" points={`0,100 ${volumePolyline} 100,100`} />
                              <polyline className="volume-line" points={volumePolyline} />
                           </svg>

                           {requestVolumePoints.map((point, index) => (
                              <span
                                 key={`request-volume-point-${index}`}
                                 className="data-point"
                                 style={{ left: `${point.x}%`, top: `${point.y}%` }}
                              />
                           ))}
                        </>
                     ) : (
                        <div className="graph-empty text-sm text-secondary">No trend data available.</div>
                     )}
                </div>
           <div className="flex justify-between text-xs text-secondary mt-2 w-full px-2">
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="card animate-slide-up delay-400">
           <h3 className="font-semibold mb-6">Top Service Categories</h3>
                <div className="flex flex-col gap-4">
                     {analytics.topCategories.map((category, index) => (
                        <div key={category.category}>
                           <div className="flex justify-between text-sm mb-1">
                              <span>{category.category}</span>
                              <span className="font-semibold">{category.percentage}%</span>
                           </div>
                           <div className="progress-bar-bg"><div className={progressClass(index)} style={{ width: `${category.percentage}%` }}></div></div>
                        </div>
                     ))}
           </div>
        </div>

        <div className="card animate-slide-up delay-500 bg-primary-blue-faded border-blue transition-all hover:bg-card">
                <h3 className="font-semibold mb-2 flex gap-2 items-center text-blue"><Activity size={20} /> {analytics.insight.title}</h3>
           <p className="text-sm text-secondary mb-6 line-height-relaxed">
                   {analytics.insight.description}
           </p>
                <div className="badge badge-primary">{analytics.insight.action}</div>
        </div>
      </div>
    </main>
  );
}

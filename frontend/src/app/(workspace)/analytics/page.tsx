import type { Metadata } from "next";
import { Activity, TrendingUp } from "lucide-react";
import { fetchFromBackend } from "@/lib/api/server";
import { requireSession } from "@/lib/auth/session";
import type { AnalyticsResponse } from "@/lib/api/types";
import "./page.css";

export const metadata: Metadata = {
  title: "Analytics",
  description:
    "Operational analytics for service resolution trends, request volume, and category performance.",
};

async function getAnalytics(): Promise<AnalyticsResponse | null> {
  try {
    return await fetchFromBackend<AnalyticsResponse>("/api/analytics");
  } catch {
    return null;
  }
}

function progressClass(index: number): string {
  if (index === 1) {
    return "progress-bar-fill analytics-progress-accent";
  }
  if (index === 2) {
    return "progress-bar-fill analytics-progress-danger";
  }

  return "progress-bar-fill";
}

export default async function AnalyticsPage() {
  await requireSession();
  const analytics = await getAnalytics();

  if (!analytics) {
    return (
      <main className="page-shell">
        <section className="panel">
          <h2 className="text-2xl mb-2">Analytics Unavailable</h2>
          <p className="text-secondary">
            Unable to fetch analytics metrics from the backend API.
          </p>
        </section>
      </main>
    );
  }

  const requestVolumePoints = analytics.requestVolume.map((rawValue, index, allValues) => {
    const clamped = Math.max(6, Math.min(94, rawValue));
    const x = allValues.length === 1 ? 50 : (index / (allValues.length - 1)) * 100;
    const y = 100 - clamped;

    return { x, y };
  });

  const volumePolyline = requestVolumePoints
    .map((point) => `${point.x},${point.y}`)
    .join(" ");

  return (
    <main className="analytics-page page-shell">
      <section className="page-hero analytics-hero panel animate-slide-up">
        <div>
          <div className="eyebrow">Analytics Workspace</div>
          <h1 className="page-title">Turn service activity into action.</h1>
          <p className="page-description">
            Compare response speed, category mix, and request volume so campus
            teams can decide where attention and staffing should move next.
          </p>
        </div>

        <div className="analytics-hero-stat">
          <span>Current insight</span>
          <strong>{analytics.insight.title}</strong>
          <p>{analytics.insight.action}</p>
        </div>
      </section>

      <div className="analytics-grid-top">
        <section className="panel analytics-metric-panel animate-slide-up delay-100">
          <div className="section-header">
            <div>
              <h3>Resolution time</h3>
              <p>Average turnaround with directional improvement.</p>
            </div>
          </div>

          <div className="analytics-metric-value">{analytics.resolutionTime.value}</div>
          <div className="analytics-trend">
            <TrendingUp size={15} />
            {analytics.resolutionTime.trendLabel}
          </div>

          <div className="analytics-bar-chart">
            {analytics.resolutionTime.bars.map((value, index) => (
              <div
                key={`${value}-${index}`}
                className={`analytics-bar ${index === analytics.resolutionTime.bars.length - 1 ? "active" : ""}`}
                style={{ height: `${value}%` }}
              />
            ))}
          </div>
        </section>

        <section className="panel analytics-volume-panel animate-slide-up delay-200">
          <div className="section-header">
            <div>
              <h3>Request volume</h3>
              <p>Five-point trend line from the live analytics feed.</p>
            </div>
          </div>

          <div className="analytics-graph-shell">
            {requestVolumePoints.length > 0 ? (
              <>
                <svg
                  className="analytics-volume-graph"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient id="analyticsAreaFill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="rgba(15, 118, 110, 0.28)" />
                      <stop offset="100%" stopColor="rgba(15, 118, 110, 0.03)" />
                    </linearGradient>
                  </defs>
                  <polygon
                    className="analytics-area"
                    points={`0,100 ${volumePolyline} 100,100`}
                  />
                  <polyline className="analytics-line" points={volumePolyline} />
                </svg>

                {requestVolumePoints.map((point, index) => (
                  <span
                    key={`request-volume-point-${index}`}
                    className="analytics-point"
                    style={{ left: `${point.x}%`, top: `${point.y}%` }}
                  />
                ))}
              </>
            ) : (
              <div className="analytics-empty">No trend data available.</div>
            )}
          </div>

          <div className="analytics-axis">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
          </div>
        </section>
      </div>

      <div className="analytics-grid-bottom">
        <section className="panel animate-slide-up delay-300">
          <div className="section-header">
            <div>
              <h3>Top service categories</h3>
              <p>The categories driving the largest current workload share.</p>
            </div>
          </div>

          <div className="analytics-category-list">
            {analytics.topCategories.map((category, index) => (
              <article key={category.category} className="analytics-category-item">
                <div className="analytics-category-head">
                  <span>{category.category}</span>
                  <strong>{category.percentage}%</strong>
                </div>
                <div className="progress-bar-bg">
                  <div
                    className={progressClass(index)}
                    style={{ width: `${category.percentage}%` }}
                  />
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="panel analytics-insight-panel animate-slide-up delay-400">
          <div className="analytics-insight-icon">
            <Activity size={18} />
          </div>
          <h3>{analytics.insight.title}</h3>
          <p>{analytics.insight.description}</p>
          <span className="badge badge-primary">{analytics.insight.action}</span>
        </section>
      </div>
    </main>
  );
}

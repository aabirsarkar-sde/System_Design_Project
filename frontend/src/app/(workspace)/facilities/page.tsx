import type { Metadata } from "next";
import {
  Building,
  LayoutDashboard,
  MapPin,
  ShieldCheck,
  Video,
} from "lucide-react";
import { fetchFromBackend } from "@/lib/api/server";
import { requireSession } from "@/lib/auth/session";
import type { FacilitiesResponse, FacilityItem } from "@/lib/api/types";
import "./page.css";

export const metadata: Metadata = {
  title: "Facilities",
  description:
    "Facilities monitoring view with operational status, capacity, and infrastructure health.",
};

function facilityIcon(facility: FacilityItem) {
  const name = facility.name.toLowerCase();

  if (name.includes("engineering")) {
    return <Building size={24} />;
  }
  if (name.includes("library")) {
    return <LayoutDashboard size={24} />;
  }
  if (name.includes("athletic")) {
    return <ShieldCheck size={24} />;
  }

  return <Video size={24} />;
}

function statusClasses(status: string): {
  badgeClass: string;
  dotClass: string;
  cardClass: string;
} {
  if (status === "MAINTENANCE") {
    return {
      badgeClass: "badge badge-warning",
      dotClass: "status-dot orange",
      cardClass: "maintenance",
    };
  }

  if (status === "OFFLINE") {
    return {
      badgeClass: "badge badge-danger",
      dotClass: "status-dot pending",
      cardClass: "offline",
    };
  }

  return {
    badgeClass: "badge badge-primary",
    dotClass: "status-dot blue",
    cardClass: "operational",
  };
}

async function getFacilities(): Promise<FacilitiesResponse | null> {
  try {
    return await fetchFromBackend<FacilitiesResponse>("/api/facilities");
  } catch {
    return null;
  }
}

export default async function FacilitiesPage() {
  await requireSession();
  const facilitiesResponse = await getFacilities();

  if (!facilitiesResponse) {
    return (
      <main className="page-shell">
        <section className="panel">
          <h2 className="text-2xl mb-2">Facilities Unavailable</h2>
          <p className="text-secondary">
            Unable to load facilities health data from the backend API.
          </p>
        </section>
      </main>
    );
  }

  const operationalCount = facilitiesResponse.facilities.filter(
    (facility) => facility.status === "OPERATIONAL",
  ).length;
  const maintenanceCount = facilitiesResponse.facilities.filter(
    (facility) => facility.status === "MAINTENANCE",
  ).length;
  const offlineCount = facilitiesResponse.facilities.filter(
    (facility) => facility.status === "OFFLINE",
  ).length;

  return (
    <main className="facilities-page page-shell">
      <section className="page-hero facilities-hero panel animate-slide-up">
        <div>
          <div className="eyebrow">Facilities Monitoring</div>
          <h1 className="page-title">Keep every shared space operationally visible.</h1>
          <p className="page-description">
            Facilities status, capacity, and systems health are shown together
            so campus teams can detect pressure points before they affect users.
          </p>
        </div>

        <div className="facilities-summary-grid">
          <article className="facilities-summary-card">
            <span>Operational</span>
            <strong>{operationalCount}</strong>
          </article>
          <article className="facilities-summary-card">
            <span>Maintenance</span>
            <strong>{maintenanceCount}</strong>
          </article>
          <article className="facilities-summary-card">
            <span>Offline</span>
            <strong>{offlineCount}</strong>
          </article>
        </div>
      </section>

      <div className="facilities-grid">
        {facilitiesResponse.facilities.map((facility, index) => {
          const styles = statusClasses(facility.status);

          return (
            <article
              key={facility.facilityId}
              className={`panel facility-card ${styles.cardClass} animate-slide-up delay-${
                (index + 1) * 100
              }`}
            >
              <div className="facility-card-head">
                <div className="facility-icon">{facilityIcon(facility)}</div>
                <span className={styles.badgeClass}>
                  <span className={styles.dotClass} />
                  {facility.status}
                </span>
              </div>

              <h3>{facility.name}</h3>
              <p className="facility-location">
                <MapPin size={14} />
                {facility.location}
              </p>

              <div className="facility-metrics">
                <div>
                  <span>Capacity</span>
                  <strong>{facility.capacity}</strong>
                </div>
                <div>
                  <span>HVAC</span>
                  <strong>{facility.hvacStatus}</strong>
                </div>
                <div>
                  <span>{facility.powerStatus ? "Power" : "Availability"}</span>
                  <strong>{facility.powerStatus ?? (facility.available ? "Open" : "Closed")}</strong>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}

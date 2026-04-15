import React from 'react';
import type { Metadata } from 'next';
import { Building, MapPin, LayoutDashboard, ShieldCheck, Video } from 'lucide-react';
import { fetchFromBackend } from '@/lib/api/server';
import { requireSession } from '@/lib/auth/session';
import type { FacilitiesResponse, FacilityItem } from '@/lib/api/types';
import './page.css';

export const metadata: Metadata = {
   title: 'Facilities',
   description: 'Facilities monitoring view with operational status, capacity, and infrastructure health.',
};

function facilityIcon(facility: FacilityItem) {
   const name = facility.name.toLowerCase();

   if (name.includes('engineering')) {
      return <Building size={24} />;
   }
   if (name.includes('library')) {
      return <LayoutDashboard size={24} />;
   }
   if (name.includes('athletic')) {
      return <ShieldCheck size={24} />;
   }

   return <Video size={24} />;
}

function statusClasses(status: string): { badgeClass: string; dotClass: string; iconClass: string } {
   if (status === 'MAINTENANCE') {
      return {
         badgeClass: 'badge badge-warning',
         dotClass: 'status-dot orange',
         iconClass: 'fac-icon bg-orange-muted text-orange',
      };
   }

   if (status === 'OFFLINE') {
      return {
         badgeClass: 'badge badge-danger text-danger border-danger',
         dotClass: '',
         iconClass: 'fac-icon bg-danger-muted text-danger',
      };
   }

   return {
      badgeClass: 'badge badge-primary',
      dotClass: 'status-dot blue',
      iconClass: 'fac-icon bg-blue-muted text-blue',
   };
}

async function getFacilities(): Promise<FacilitiesResponse | null> {
   try {
      return await fetchFromBackend<FacilitiesResponse>('/api/facilities');
   } catch {
      return null;
   }
}

export default async function FacilitiesPage() {
   await requireSession();
   const facilitiesResponse = await getFacilities();

   if (!facilitiesResponse) {
      return (
         <main className="fac-container animate-fade-in">
            <section className="card">
               <h2 className="text-2xl font-bold mb-2">Facilities Unavailable</h2>
               <p className="text-sm text-secondary">Unable to load facilities health data from the backend API.</p>
            </section>
         </main>
      );
   }

   const operationalCount = facilitiesResponse.facilities.filter((facility) => facility.status === 'OPERATIONAL').length;

  return (
    <main className="fac-container animate-fade-in">
      <div className="flex justify-between items-end mb-8 animate-slide-up delay-100">
        <div>
          <h2 className="text-2xl font-bold mb-1">Facilities Management</h2>
               <p className="text-sm text-secondary">{operationalCount} of {facilitiesResponse.facilities.length} facilities are currently operational.</p>
        </div>
      </div>

      <div className="fac-grid">
            {facilitiesResponse.facilities.map((facility, index) => {
               const styles = statusClasses(facility.status);
               const toneClass = index === 0 ? 'delay-200' : index === 1 ? 'delay-300' : index === 2 ? 'delay-400' : 'delay-500';

               return (
                  <div key={facility.facilityId} className={`card fac-card animate-slide-up ${toneClass}`}>
                     <div className="fac-header">
                        <div className={styles.iconClass}>{facilityIcon(facility)}</div>
                        <span className={styles.badgeClass}>
                           {styles.dotClass ? <span className={styles.dotClass}></span> : null}
                           {facility.status}
                        </span>
                     </div>
                     <h3 className="text-lg font-semibold mb-1">{facility.name}</h3>
                     <p className="text-sm text-secondary flex items-center gap-1 mb-6"><MapPin size={14} /> {facility.location}</p>

                     <div className="grid grid-cols-2 gap-4 text-sm border-t border-border pt-4">
                        <div>
                           <span className="text-xs text-secondary block mb-1">CAPACITY</span>
                           <span className="font-semibold">{facility.capacity}</span>
                        </div>
                        <div>
                           <span className="text-xs text-secondary block mb-1">{facility.powerStatus ? 'POWER SYSTEM' : 'HVAC STATUS'}</span>
                           <span className="font-semibold">{facility.powerStatus ?? facility.hvacStatus}</span>
                        </div>
                     </div>
                  </div>
               );
            })}
      </div>
    </main>
  );
}

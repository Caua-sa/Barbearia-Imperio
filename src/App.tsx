/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ExpressBooking } from './components/ExpressBooking';
import { ClientHome } from './components/ClientHome';
import { AdminDashboard } from './components/AdminDashboard';
import { MyBookings } from './components/MyBookings';

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'express' | 'admin' | 'my-bookings'>('home');
  const [preselectedServiceId, setPreselectedServiceId] = useState<string | undefined>(undefined);
  const [preselectedBarberId, setPreselectedBarberId] = useState<string | undefined>(undefined);

  // Detect URL parameter for express direct link (e.g. ?express=true or ?rapido=true)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('express') === 'true' || params.get('rapido') === 'true') {
        setCurrentView('express');
      } else if (params.get('adm') === 'true' || params.get('admin') === 'true') {
        setCurrentView('admin');
      }
    } catch {
      // ignore
    }
  }, []);

  const handleStartBooking = (serviceId?: string, barberId?: string) => {
    setPreselectedServiceId(serviceId);
    setPreselectedBarberId(barberId);
    setCurrentView('express');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (view: 'home' | 'express' | 'admin' | 'my-bookings') => {
    if (view !== 'express') {
      setPreselectedServiceId(undefined);
      setPreselectedBarberId(undefined);
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-amber-400 selection:text-neutral-950">
      {/* Top Navbar */}
      <Navbar currentView={currentView} onNavigate={handleNavigate} />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'home' && (
          <ClientHome
            onStartBooking={handleStartBooking}
            onGoToAdmin={() => handleNavigate('admin')}
          />
        )}

        {currentView === 'express' && (
          <ExpressBooking
            onGoHome={() => handleNavigate('home')}
            preselectedServiceId={preselectedServiceId}
            preselectedBarberId={preselectedBarberId}
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboard onBackToApp={() => handleNavigate('home')} />
        )}

        {currentView === 'my-bookings' && (
          <MyBookings onStartBooking={() => handleNavigate('express')} />
        )}
      </main>
    </div>
  );
}

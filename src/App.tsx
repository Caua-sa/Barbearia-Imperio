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
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import { getCurrentUser } from './services/auth';
import { syncWithServer } from './services/storage';
import { ClientUser } from './types';

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'express' | 'admin' | 'my-bookings'>('home');
  const [preselectedServiceId, setPreselectedServiceId] = useState<string | undefined>(undefined);
  const [preselectedBarberId, setPreselectedBarberId] = useState<string | undefined>(undefined);

  // Client User Auth State
  const [currentUser, setCurrentUser] = useState<ClientUser | null>(() => getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  // Sync with server on initial render & periodically
  useEffect(() => {
    syncWithServer();
    const timer = setInterval(() => {
      syncWithServer();
    }, 12000);
    return () => clearInterval(timer);
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    const handleAuthChange = () => {
      setCurrentUser(getCurrentUser());
    };
    window.addEventListener('imperio_auth_changed', handleAuthChange);
    return () => window.removeEventListener('imperio_auth_changed', handleAuthChange);
  }, []);

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
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'home' && (
          <ClientHome
            onStartBooking={handleStartBooking}
            onGoToAdmin={() => handleNavigate('admin')}
            currentUser={currentUser}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        )}

        {currentView === 'express' && (
          <ExpressBooking
            onGoHome={() => handleNavigate('home')}
            preselectedServiceId={preselectedServiceId}
            preselectedBarberId={preselectedBarberId}
            currentUser={currentUser}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboard onBackToApp={() => handleNavigate('home')} />
        )}

        {currentView === 'my-bookings' && (
          <MyBookings onStartBooking={() => handleNavigate('express')} />
        )}
      </main>

      {/* Google Login & Account Creation Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
        }}
      />

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        user={currentUser}
        onClose={() => setIsProfileModalOpen(false)}
        onGoToBookings={() => handleNavigate('my-bookings')}
        onLoggedOut={() => setCurrentUser(null)}
      />
    </div>
  );
}

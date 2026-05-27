'use client';

import { useState } from 'react';
import ClinicChat from './clinic-chat';
import Nav from './components/nav';
import Hero from './components/hero';
import Services from './components/services';
import Doctors from './components/doctors';
import Contact from './components/contact';
import Footer from './components/footer';
import type { Clinic, Doctor, Service } from './components/types';

export default function ClinicLanding({
  clinic,
  doctors,
}: {
  clinic: Clinic;
  doctors: Doctor[];
}) {
  const [showChat, setShowChat] = useState(false);
  const services = (clinic.services ?? []) as Service[];
  const openChat = () => setShowChat(true);

  return (
    <div className="min-h-screen bg-white">
      <Nav clinic={clinic} onChatClick={openChat} />
      <Hero clinic={clinic} doctors={doctors} services={services} onChatClick={openChat} />
      <Services services={services} onChatClick={openChat} />
      <Doctors doctors={doctors} onChatClick={openChat} />
      <Contact clinic={clinic} onChatClick={openChat} />
      <Footer clinic={clinic} />

      {/* Floating Chat Button */}
      {!showChat && (
        <button
          onClick={openChat}
          className="fixed bottom-6 right-6 z-40 group"
          aria-label="Чат нээх"
        >
          <div className="absolute inset-0 rounded-full bg-teal-500 animate-ping opacity-30"></div>
          <div className="relative w-14 h-14 rounded-full bg-teal-700 hover:bg-teal-800 text-white shadow-2xl shadow-teal-900/40 hover:scale-110 active:scale-95 transition flex items-center justify-center text-2xl">
            💬
          </div>
        </button>
      )}

      {/* Chat Modal */}
      {showChat && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm sm:p-4 animate-in fade-in duration-200">
          <div className="relative w-full sm:max-w-2xl h-full sm:h-auto sm:max-h-[90vh] bg-white sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300">
            <button
              onClick={() => setShowChat(false)}
              className="absolute top-3 right-3 z-10 w-10 h-10 bg-white/95 hover:bg-white text-stone-700 rounded-full shadow-lg flex items-center justify-center transition hover:rotate-90"
              aria-label="Хаах"
            >
              ✕
            </button>
            <ClinicChat clinic={clinic} />
          </div>
        </div>
      )}
    </div>
  );
}
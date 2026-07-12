'use client';

import { useState } from 'react';
import ClinicChat from './clinic-chat';
import Nav from './components/nav';
import Hero from './components/hero';
import Services from './components/services';
import Doctors from './components/doctors';
import Contact from './components/contact';
import BookingModal from './components/booking-modal';
import DentalTips from './components/dental-tips';

import type { Clinic, Doctor, Service } from './components/types';

export default function ClinicLanding({
  clinic,
  doctors,
}: {
  clinic: Clinic;
  doctors: Doctor[];
}) {
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState<string | undefined>();
  const [bookingDoctor, setBookingDoctor] = useState<Doctor | null>(null);
  const services = (clinic.services ?? []) as Service[];
  const openChat = () => { setChatMessage(undefined); setShowChat(true); };
  const openChatWithMessage = (msg: string) => { setChatMessage(msg); setShowChat(true); };
  const scrollToDoctors = () => {
    document.getElementById('doctors')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-white">
      <Nav clinic={clinic} onBookClick={scrollToDoctors} />
      <Hero clinic={clinic} doctors={doctors} services={services} onChatClick={openChat} />
      <Services services={services} onChatClick={openChat} />
      <DentalTips onAskQuestion={openChatWithMessage} />
      <Doctors doctors={doctors} onChatClick={openChat} onBookClick={setBookingDoctor} />
      <Contact clinic={clinic} onBookClick={scrollToDoctors} onAskQuestion={openChatWithMessage} />
     

      {/* Floating Chat Button */}
      {!showChat && (
        <button
          onClick={openChat}
          className="fixed bottom-6 right-6 z-40 group"
          aria-label="Чат нээх"
        >
          <div className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-30"></div>
          <div className="relative w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-2xl shadow-blue-900/40 hover:scale-110 active:scale-95 transition flex items-center justify-center text-2xl">
            💬
          </div>
        </button>
      )}

      {/* Booking Modal */}
      {bookingDoctor && (
        <BookingModal
          doctor={bookingDoctor}
          clinicId={clinic.id}
          services={services}
          onClose={() => setBookingDoctor(null)}
        />
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
            <ClinicChat key={chatMessage ?? '__open__'} clinic={clinic} initialMessage={chatMessage} />
          </div>
        </div>
      )}
    </div>
  );
}
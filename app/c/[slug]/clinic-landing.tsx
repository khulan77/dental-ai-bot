'use client';

import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import ClinicChat from './clinic-chat';
import Nav from './components/nav';
import Hero from './components/hero';
import Services from './components/services';
import Doctors from './components/doctors';
import Contact from './components/contact';
import BookingModal from './components/booking-modal';
import ServiceDoctorsModal from './components/service-doctors-modal';
import DentalTips from './components/dental-tips';

import type { Clinic, Doctor, Service, Branch } from './components/types';

export default function ClinicLanding({
  clinic,
  doctors,
  branches = [],
}: {
  clinic: Clinic;
  doctors: Doctor[];
  branches?: Branch[];
}) {
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState<string | undefined>();
  const [bookingDoctor, setBookingDoctor] = useState<Doctor | null>(null);
  const [bookingBranchId, setBookingBranchId] = useState<string | null>(null);
  const [pickerService, setPickerService] = useState<Service | null>(null);
  const [bookingService, setBookingService] = useState<Service | null>(null);
  const services = (clinic.services ?? []) as Service[];
  const openChat = () => { setChatMessage(undefined); setShowChat(true); };
  const openChatWithMessage = (msg: string) => { setChatMessage(msg); setShowChat(true); };
  const scrollToDoctors = () => {
    document.getElementById('doctors')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-white">
      <Nav clinic={clinic} onBookClick={scrollToDoctors} />
      <Hero clinic={clinic} doctors={doctors} services={services} onBookClick={scrollToDoctors} />
      <Services services={services} onServiceClick={setPickerService} />
      <DentalTips onAskQuestion={openChatWithMessage} />
      <Doctors
        doctors={doctors}
        branches={branches}
        onChatClick={openChat}
        onBookClick={(doctor, branchId) => {
          setBookingDoctor(doctor);
          setBookingBranchId(branchId ?? null);
        }}
      />
      <Contact clinic={clinic} branches={branches} onBookClick={scrollToDoctors} onAskQuestion={openChatWithMessage} />
     

      {/* Floating Chat Button */}
      {!showChat && (
        <button
          onClick={openChat}
          className="fixed bottom-6 right-6 z-40 w-13 h-13 p-3.5 rounded-full bg-[var(--site-accent)] hover:bg-[var(--site-accent-hover)] text-white shadow-lg transition-colors"
          aria-label="Чат нээх"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Service → Doctor picker */}
      {pickerService && (
        <ServiceDoctorsModal
          service={pickerService}
          doctors={doctors}
          onSelectDoctor={(doctor) => {
            setBookingService(pickerService);
            setBookingDoctor(doctor);
            setPickerService(null);
          }}
          onClose={() => setPickerService(null)}
        />
      )}

      {/* Booking Modal */}
      {bookingDoctor && (
        <BookingModal
          doctor={bookingDoctor}
          clinicId={clinic.id}
          clinicSlug={clinic.slug}
          services={services}
          branches={branches}
          preselectedBranchId={bookingBranchId}
          initialService={bookingService}
          onClose={() => { setBookingDoctor(null); setBookingService(null); setBookingBranchId(null); }}
        />
      )}

      {/* Chat Modal */}
      {showChat && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 sm:p-4 animate-in fade-in duration-200">
          <div className="relative w-full sm:max-w-2xl h-full sm:h-auto sm:max-h-[90vh] bg-white sm:rounded-[var(--site-r-card)] shadow-[0_24px_48px_rgba(15,23,42,0.18)] overflow-hidden flex flex-col">
            <button
              onClick={() => setShowChat(false)}
              className="absolute top-3 right-3 z-10 w-10 h-10 bg-white hover:bg-[var(--site-bg-soft)] text-[var(--site-ink-soft)] rounded-full border border-[var(--site-line)] flex items-center justify-center transition-colors"
              aria-label="Хаах"
            >
              <X className="w-5 h-5" />
            </button>
            <ClinicChat key={chatMessage ?? '__open__'} clinic={clinic} initialMessage={chatMessage} />
          </div>
        </div>
      )}
    </div>
  );
}
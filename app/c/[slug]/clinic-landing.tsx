'use client';

import { useState } from 'react';
import { CalendarDays, MessageCircle, Phone } from 'lucide-react';
import Nav from './components/nav';
import Hero from './components/hero';
import Services from './components/services';
import Doctors from './components/doctors';
import DentalTips from './components/dental-tips';
import Contact from './components/contact';
import CtaBand from './components/cta-band';
import Footer from './components/footer';
import BookingModal from './components/booking-modal';
import ServiceDoctorsModal from './components/service-doctors-modal';
import ChatModal from './components/chat-modal';

import type { Clinic, Doctor, Service, Branch, SectionLink } from './components/types';

export default function ClinicLanding({
  clinic,
  doctors,
  branches = [],
}: {
  clinic: Clinic;
  doctors: Doctor[];
  branches?: Branch[];
}) {
  // Чат. null бол хаалттай; message нь FAQ-аас ирсэн асуулт.
  const [chat, setChat] = useState<{ message?: string } | null>(null);
  const [pickerService, setPickerService] = useState<Service | null>(null);

  // Захиалгын modal. null бол хаалттай. Талбарууд нь урьдчилсан сонголт —
  // хоосон бол хэрэглэгч 1-р алхмаас (салбар) эхэлнэ.
  const [booking, setBooking] = useState<{
    doctor?: Doctor | null;
    branchId?: string | null;
    service?: Service | null;
  } | null>(null);

  const services = (clinic.services ?? []) as Service[];
  const phone = clinic.owner_phone;
  const openChat = (message?: string) => setChat({ message });
  const openBooking = (preset: {
    doctor?: Doctor | null;
    branchId?: string | null;
    service?: Service | null;
  } = {}) => setBooking(preset);

  const hasContact =
    branches.length > 0 || !!(clinic.address || phone || clinic.owner_email || clinic.business_hours);

  // Хуудасны хэсгүүд — хоосон хэсэг nav-д гарахгүй
  const links = [
    services.length > 0 && { id: 'services', label: 'Үйлчилгээ' },
    doctors.length > 0 && { id: 'doctors', label: 'Эмч нар' },
    { id: 'faq', label: 'Асуулт хариулт' },
    hasContact && { id: 'contact', label: 'Холбоо барих' },
  ].filter(Boolean) as SectionLink[];

  return (
    // Утсан дээр доод товчны мөр footer-ийг халхлахгүй байх зай
    <div className="min-h-screen bg-white pb-[76px] sm:pb-0">
      <Nav clinic={clinic} links={links} onBookClick={() => openBooking()} />

      <main>
        <Hero
          clinic={clinic}
          doctors={doctors}
          services={services}
          branches={branches}
          onBookClick={() => openBooking()}
        />
        <Services services={services} onServiceClick={setPickerService} />
        <Doctors
          doctors={doctors}
          branches={branches}
          onBookClick={(doctor, branchId) => openBooking({ doctor, branchId: branchId ?? null })}
        />
        <DentalTips onAskQuestion={q => openChat(q)} onOpenChat={() => openChat()} />
        <Contact clinic={clinic} branches={branches} />
        <CtaBand slug={clinic.slug} onBookClick={() => openBooking()} />
      </main>

      <Footer clinic={clinic} links={links} />

      {/* Утсан дээр: байнга харагдах үндсэн үйлдлүүд */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-[var(--site-line)] px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] flex gap-2">
        {phone && (
          <a
            href={`tel:${phone}`}
            aria-label="Залгах"
            className="site-btn-outline w-12 px-0 shrink-0"
          >
            <Phone className="w-5 h-5" />
          </a>
        )}
        <button
          onClick={() => openChat()}
          aria-label="AI ассистенттэй чатлах"
          className="site-btn-outline w-12 px-0 shrink-0"
        >
          <MessageCircle className="w-5 h-5" />
        </button>
        <button onClick={() => openBooking()} className="site-btn flex-1 text-[15px]">
          <CalendarDays className="w-4 h-4" />
          Цаг захиалах
        </button>
      </div>

      {/* Том дэлгэцэнд: хөвөгч чатын товч */}
      {!chat && (
        <button
          onClick={() => openChat()}
          className="hidden sm:inline-flex fixed bottom-6 right-6 z-40 items-center gap-2 pl-4 pr-5 py-3.5 rounded-[var(--site-r-pill)] bg-[var(--site-accent)] hover:bg-[var(--site-accent-hover)] text-white text-[14px] font-semibold shadow-lg transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          Асуулт асуух
        </button>
      )}

      {/* Service → Doctor picker */}
      {pickerService && (
        <ServiceDoctorsModal
          service={pickerService}
          doctors={doctors}
          onSelectDoctor={(doctor) => {
            openBooking({ doctor, service: pickerService });
            setPickerService(null);
          }}
          onClose={() => setPickerService(null)}
        />
      )}

      {booking && (
        <BookingModal
          clinicId={clinic.id}
          clinicSlug={clinic.slug}
          doctors={doctors}
          services={services}
          branches={branches}
          businessHours={clinic.business_hours}
          initialDoctor={booking.doctor ?? null}
          initialBranchId={booking.branchId ?? null}
          initialService={booking.service ?? null}
          onClose={() => setBooking(null)}
        />
      )}

      {chat && (
        <ChatModal clinic={clinic} initialMessage={chat.message} onClose={() => setChat(null)} />
      )}
    </div>
  );
}

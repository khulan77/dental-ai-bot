'use client';

import ClinicChat from '../clinic-chat';
import Modal from './modal';
import type { Clinic } from './types';

/** AI ассистенттэй чат — утсан дээр бүтэн дэлгэц, том дэлгэцэнд цонх */
export default function ChatModal({
  clinic,
  initialMessage,
  onClose,
}: {
  clinic: Clinic;
  initialMessage?: string;
  onClose: () => void;
}) {
  return (
    <Modal
      label="AI ассистент"
      onClose={onClose}
      panelClassName="w-full h-[100dvh] sm:h-[680px] sm:max-h-[90dvh] sm:max-w-lg bg-white sm:rounded-[var(--site-r-card)] shadow-[0_24px_48px_rgba(15,23,42,0.18)] overflow-hidden flex flex-col"
    >
      <ClinicChat
        key={initialMessage ?? '__open__'}
        clinic={clinic}
        initialMessage={initialMessage}
        onClose={onClose}
      />
    </Modal>
  );
}

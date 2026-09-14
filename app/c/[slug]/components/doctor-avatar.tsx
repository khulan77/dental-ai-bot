import Image from 'next/image';
import type { Doctor } from './types';

/** Эмчийн зураг — оруулаагүй бол нэрийн эхний үсэг */
export default function DoctorAvatar({
  doctor,
  size = 44,
}: {
  doctor: Pick<Doctor, 'name' | 'avatar_url'>;
  size?: number;
}) {
  const style = { width: size, height: size };

  if (doctor.avatar_url) {
    return (
      <Image
        src={doctor.avatar_url}
        alt={doctor.name}
        width={size}
        height={size}
        style={style}
        className="rounded-full object-cover shrink-0 bg-[var(--site-bg-soft)]"
      />
    );
  }

  return (
    <span
      style={{ ...style, fontSize: Math.round(size * 0.36) }}
      className="rounded-full bg-[var(--site-accent-soft)] text-[var(--site-accent)] flex items-center justify-center font-semibold shrink-0"
      aria-hidden="true"
    >
      {doctor.name.charAt(0)}
    </span>
  );
}

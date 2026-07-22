
export const CLINIC_TIMEZONE = 'Asia/Ulaanbaatar';

type ZonedParts = {
  year: number;
  month: number; // 1-12
  day: number;
  hour: number; // 0-23
  minute: number;
  second: number;
  weekday: number;
};

const partsFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: CLINIC_TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
});

export function zonedParts(instant: Date): ZonedParts {
  const raw = Object.fromEntries(
    partsFormatter
      .formatToParts(instant)
      .filter((p) => p.type !== 'literal')
      .map((p) => [p.type, p.value])
  ) as Record<string, string>;

  const year = Number(raw.year);
  const month = Number(raw.month);
  const day = Number(raw.day);
  const hour = Number(raw.hour) % 24;
  const minute = Number(raw.minute);
  const second = Number(raw.second);

  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();

  return { year, month, day, hour, minute, second, weekday };
}

function offsetMs(instant: Date): number {
  const p = zonedParts(instant);
  const asIfUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);

  return asIfUtc - Math.floor(instant.getTime() / 1000) * 1000;
}


export function zonedInstant(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number
): Date {
  const guess = Date.UTC(year, month - 1, day, hour, minute);

  const firstPass = guess - offsetMs(new Date(guess));
  const secondOffset = offsetMs(new Date(firstPass));
  return new Date(guess - secondOffset);
}

export function clinicDateISO(instant: Date): string {
  const p = zonedParts(instant);
  return `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`;
}

export function clinicDayIndex(instant: Date): number {
  return zonedParts(instant).weekday;
}

export function clinicHHMM(instant: Date): string {
  const p = zonedParts(instant);
  return `${String(p.hour).padStart(2, '0')}:${String(p.minute).padStart(2, '0')}`;
}


export function clinicDayBounds(instant: Date): { start: Date; end: Date } {
  const p = zonedParts(instant);
  return {
    start: zonedInstant(p.year, p.month, p.day, 0, 0),
    end: new Date(zonedInstant(p.year, p.month, p.day, 0, 0).getTime() + 24 * 3600_000),
  };
}

export function clinicInstantFrom(dateISO: string, hhmm: string): Date {
  const [y, m, d] = dateISO.split('-').map(Number);
  const [hh, mm] = hhmm.split(':').map(Number);
  return zonedInstant(y, m, d, hh, mm);
}


export function addClinicDays(instant: Date, days: number): Date {
  const p = zonedParts(instant);
  return zonedInstant(p.year, p.month, p.day + days, p.hour, p.minute);
}

export function clinicMinutesOfDay(instant: Date): number {
  const p = zonedParts(instant);
  return p.hour * 60 + p.minute;
}

export function clinicHour(instant: Date): number {
  return zonedParts(instant).hour;
}

// --- Дэлгэцэнд харуулах формат ---
// Server component-ууд серверийн бүсээр (Vercel дээр UTC) render хийдэг тул
// toLocaleDateString-ийг шууд бус, эдгээрээр дамжуулж хэрэглэнэ.

const shortDateFormatter = new Intl.DateTimeFormat('mn-MN', {
  timeZone: CLINIC_TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const longDateFormatter = new Intl.DateTimeFormat('mn-MN', {
  timeZone: CLINIC_TIMEZONE,
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

const timeFormatter = new Intl.DateTimeFormat('mn-MN', {
  timeZone: CLINIC_TIMEZONE,
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

export function clinicShortDate(instant: Date): string {
  return shortDateFormatter.format(instant);
}

export function clinicLongDate(instant: Date): string {
  return longDateFormatter.format(instant);
}

export function clinicTimeLabel(instant: Date): string {
  return timeFormatter.format(instant);
}

export function clinicDateTimeLabel(instant: Date): string {
  return `${shortDateFormatter.format(instant)} ${timeFormatter.format(instant)}`;
}

const isoLabelFormatter = new Intl.DateTimeFormat('mn-MN', {
  timeZone: 'UTC',
  weekday: 'long',
  month: 'long',
  day: 'numeric',
});

/**
 * 'YYYY-MM-DD' нь аль хэдийн эмнэлгийн бүсийн өдөр тул UTC-ээр форматлана —
 * үгүй бол дэлгэц дээр өдөр нэгээр гулсах эрсдэлтэй.
 */
export function clinicDateISOLabel(dateISO: string): string {
  return isoLabelFormatter.format(new Date(`${dateISO}T00:00:00Z`));
}

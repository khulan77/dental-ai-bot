import { describe, expect, test } from 'bun:test';
import {
  clinicDateISO,
  clinicDayIndex,
  clinicHHMM,
  clinicDayBounds,
  clinicInstantFrom,
  clinicMinutesOfDay,
  addClinicDays,
  zonedInstant,
  clinicHour,
  clinicShortDate,
  clinicTimeLabel,
  clinicDateISOLabel,
} from './timezone';


const UB_0900 = new Date('2026-07-21T01:00:00Z');

describe('clinicHHMM', () => {
  test('UTC-д хадгалагдсан агшинг УБ-ын хана дээрх цаг болгоно', () => {
    expect(clinicHHMM(UB_0900)).toBe('09:00');
  });

  test('шөнө дундын өмнөх агшин дараагийн өдөр рүү шилжинэ', () => {

    expect(clinicHHMM(new Date('2026-07-20T17:00:00Z'))).toBe('01:00');
  });
});

describe('clinicDateISO', () => {
  test('УБ-ын өдрөөр огноо өгнө', () => {
    expect(clinicDateISO(UB_0900)).toBe('2026-07-21');
  });

  test('UTC-ээр өмнөх өдөр байсан ч УБ-аар дараагийн өдөр бол шилжинэ', () => {
  
    expect(clinicDateISO(new Date('2026-07-20T16:30:00Z'))).toBe('2026-07-21');
  });
});

describe('clinicDayIndex', () => {
  test('2026-07-21 бол мягмар гараг (2)', () => {
    expect(clinicDayIndex(UB_0900)).toBe(2);
  });

  test('UTC-ээр даваа боловч УБ-аар мягмар бол мягмарыг өгнө', () => {

    expect(clinicDayIndex(new Date('2026-07-20T17:00:00Z'))).toBe(2);
  });
});

describe('zonedInstant / clinicInstantFrom', () => {
  test('УБ-ын хана дээрх цагийг зөв UTC агшин болгоно', () => {
    expect(zonedInstant(2026, 7, 21, 9, 0).toISOString()).toBe('2026-07-21T01:00:00.000Z');
  });

  test('clinicInstantFrom нь ISO огноо + цагийг хүлээж авна', () => {
    expect(clinicInstantFrom('2026-07-21', '14:30').toISOString()).toBe(
      '2026-07-21T06:30:00.000Z'
    );
  });

  test('clinicHHMM-ийн урвуу үйлдэл болно (round-trip)', () => {
    const inst = clinicInstantFrom('2026-07-21', '09:00');
    expect(clinicHHMM(inst)).toBe('09:00');
    expect(clinicDateISO(inst)).toBe('2026-07-21');
  });
});

describe('clinicDayBounds', () => {
  test('УБ-ын өдрийн эхлэл нь өмнөх өдрийн 16:00Z байна', () => {
    const { start, end } = clinicDayBounds(UB_0900);
    expect(start.toISOString()).toBe('2026-07-20T16:00:00.000Z');
    expect(end.toISOString()).toBe('2026-07-21T16:00:00.000Z');
  });

  test('өдрийн бүх цагийг хамарна', () => {
    const { start, end } = clinicDayBounds(UB_0900);
    const earliest = clinicInstantFrom('2026-07-21', '00:00');
    const latest = clinicInstantFrom('2026-07-21', '23:30');

    expect(earliest.getTime()).toBeGreaterThanOrEqual(start.getTime());
    expect(latest.getTime()).toBeLessThan(end.getTime());
  });

  test('өмнөх өдрийн сүүлийн цагийг хамруулахгүй', () => {
    const { start } = clinicDayBounds(UB_0900);
    const prevDayLate = clinicInstantFrom('2026-07-20', '23:30');
    expect(prevDayLate.getTime()).toBeLessThan(start.getTime());
  });
});

describe('addClinicDays', () => {
  test('дараагийн өдөр рүү шилжинэ, цаг хэвээр', () => {
    const next = addClinicDays(UB_0900, 1);
    expect(clinicDateISO(next)).toBe('2026-07-22');
    expect(clinicHHMM(next)).toBe('09:00');
  });

  test('сарын хилийг давна', () => {
    const d = clinicInstantFrom('2026-07-31', '09:00');
    expect(clinicDateISO(addClinicDays(d, 1))).toBe('2026-08-01');
  });

  test('7 хоногийн хуваарь зөв дараалалтай гарна', () => {
    const start = clinicInstantFrom('2026-07-30', '00:00');
    const dates = Array.from({ length: 4 }, (_, i) => clinicDateISO(addClinicDays(start, i)));
    expect(dates).toEqual(['2026-07-30', '2026-07-31', '2026-08-01', '2026-08-02']);
  });
});

describe('clinicMinutesOfDay', () => {
  test('шөнө дундаас хойшх минутыг УБ-аар тооцно', () => {
    expect(clinicMinutesOfDay(UB_0900)).toBe(9 * 60);
    expect(clinicMinutesOfDay(clinicInstantFrom('2026-07-21', '14:30'))).toBe(14 * 60 + 30);
  });
});

describe('clinicHour', () => {
  test('УБ-ын цагийг өгнө (мэндчилгээнд ашиглагдана)', () => {
    expect(clinicHour(UB_0900)).toBe(9);
    // UTC-ээр 23:00 боловч УБ-аар аль хэдийн өглөөний 7 цаг
    expect(clinicHour(new Date('2026-07-20T23:00:00Z'))).toBe(7);
  });
});

describe('дэлгэцийн формат', () => {
  test('огноо, цагийг УБ-аар харуулна', () => {
    expect(clinicTimeLabel(UB_0900)).toBe('09:00');
    // UTC-ээр 7-р сарын 20 боловч УБ-аар 21
    expect(clinicShortDate(new Date('2026-07-20T16:30:00Z'))).toContain('21');
  });

  test('clinicDateISOLabel нь өдрийг гулсуулахгүй', () => {
    // 2026-07-21 бол мягмар — ямар ч бүсэд ижил гарах ёстой
    expect(clinicDateISOLabel('2026-07-21')).toContain('21');
    expect(clinicDateISOLabel('2026-07-21').toLowerCase()).toContain('мягмар');
  });
});

describe('бүсээс хамаарахгүй байдал', () => {
  test('өвөл ч зун ч УБ +8 хэвээр (Монголд зуны цаг байхгүй)', () => {
    // 1-р сар
    expect(clinicHHMM(new Date('2026-01-15T01:00:00Z'))).toBe('09:00');
    // 7-р сар
    expect(clinicHHMM(new Date('2026-07-15T01:00:00Z'))).toBe('09:00');
  });
});

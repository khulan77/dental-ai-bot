/** Хуанлийн серверийн хуудас ↔ client хэсгүүдийн дундах өгөгдөл */

export type DayHours = { open: string; close: string } | null;

export type CalDoctor = {
  id: string;
  name: string;
  specialty: string | null;
  avatar_url: string | null;
  /** Хоосон бол бүх үйлчилгээ хийдэг */
  service_ids: string[];
};

/** Нэг багана = нэг эмч. hours нь тухайн өдрийн ажлын цаг (null = амарна). */
export type CalColumn = {
  doctor: CalDoctor;
  hours: DayHours;
};

export type CalBranch = { id: string; name: string };

export type CalService = {
  id: string;
  name: string;
  /** Хямдрал идэвхтэй бол хямдарсан үнэ (effectivePrice) */
  price: number;
  duration_minutes: number;
};

export type CalAppointment = {
  id: string;
  doctor_id: string | null;
  branch_id: string | null;
  customer_name: string;
  customer_phone: string | null;
  service: string | null;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  booking_code: string | null;
  notes: string | null;
  /** Үйлчилгээний одоогийн үнэ (нэрээр нь олсон). Олдоогүй бол null. */
  price: number | null;
};

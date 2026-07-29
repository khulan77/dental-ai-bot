export type Service = {
  id: string;
  name: string;
  price_mnt: number;
  duration_minutes: number;
  description?: string;
  /** Хямдралын хувь (1-99). 0 эсвэл хоосон бол хямдралгүй. */
  discount_percent?: number | null;
  /** "YYYY-MM-DD" — энэ өдрийг оруулаад дуустал. Хоосон бол хугацаагүй. */
  discount_until?: string | null;
};

export type DayHours = {
  open: string;  // "09:00" формат
  close: string; // "18:00"
} | null;

export type BusinessHours = {
  mon: DayHours;
  tue: DayHours;
  wed: DayHours;
  thu: DayHours;
  fri: DayHours;
  sat: DayHours;
  sun: DayHours;
};

export type Message = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
};

export type AppointmentStatus =
  | 'confirmed'
  | 'reminded'
  | 'completed'
  | 'no_show'
  | 'cancelled';

export type Clinic = {
  id: string;
  name: string;
  slug: string;
  google_calendar_id: string | null;
  google_refresh_token: string | null;
  business_hours: BusinessHours;
  services: Service[];
  bot_personality: string;
  owner_phone: string | null;
  owner_email: string | null;
  is_active: boolean;
  created_at: string;
    about: string | null;
  address: string | null;
  website: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  latitude: number | null;
  longitude: number | null;
  cover_image_url: string | null;
};

export type Branch = {
  id: string;
  clinic_id: string;
  name: string;
  address: string | null;
  phone: string | null;
  business_hours: BusinessHours | null;  // null бол clinic default
  display_order: number;
  is_active: boolean;
  created_at: string;
};

export type Appointment = {
  id: string;
  clinic_id: string;
  branch_id: string | null;
  customer_name: string;
  customer_phone: string | null;
  service: string | null;
  scheduled_at: string;
  duration_minutes: number;
  status: AppointmentStatus;
  google_event_id: string | null;
  notes: string | null;
  created_at: string;
   doctor_id: string | null; 
};

export type Doctor = {
  id: string;
  clinic_id: string;
  name: string;
  specialty: string | null;
  email: string | null;          // цаг захиалгын мэдэгдэл хүлээн авах хаяг
  bio: string | null;
  avatar_url: string | null;
  custom_hours: BusinessHours | null;  // null бол clinic default
  service_ids: string[];                // empty array бол бүх үйлчилгээ
  is_active: boolean;
  display_order: number;
  created_at: string;
};
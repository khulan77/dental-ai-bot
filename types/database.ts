export type Service = {
  id: string;
  name: string;
  price_mnt: number;
  duration_minutes: number;
  description?: string;
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

export type ConversationStatus = 'active' | 'booked' | 'lost';
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
  instagram_page_id: string | null;
  meta_page_access_token: string | null;
  google_calendar_id: string | null;
  google_refresh_token: string | null;
  business_hours: BusinessHours;
  services: Service[];
  bot_personality: string;
  owner_phone: string | null;
  owner_email: string | null;
  is_active: boolean;
  created_at: string;
};

export type Conversation = {
  id: string;
  clinic_id: string;
  customer_messenger_id: string;
  customer_name: string | null;
  customer_phone: string | null;
  channel: 'instagram' | 'messenger';
  messages: Message[];
  status: ConversationStatus;
  last_message_at: string;
  created_at: string;
};

export type Appointment = {
  id: string;
  clinic_id: string;
  conversation_id: string | null;
  customer_name: string;
  customer_phone: string | null;
  service: string | null;
  scheduled_at: string;
  duration_minutes: number;
  status: AppointmentStatus;
  google_event_id: string | null;
  notes: string | null;
  created_at: string;
};
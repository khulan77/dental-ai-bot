export type Service = {
  id: string;
  name: string;
  price_mnt: number;
  duration_minutes: number;
  /** Үйлчилгээний зураг (Supabase Storage). Хоосон бол дүрс харагдана. */
  image_url?: string | null;
  /** Хямдралын хувь (1-99). 0 эсвэл хоосон бол хямдралгүй. */
  discount_percent?: number | null;
  /** "YYYY-MM-DD" — энэ өдрийг оруулаад дуустал. Хоосон бол хугацаагүй. */
  discount_until?: string | null;
};

export type Doctor = {
  id: string;
  name: string;
  specialty: string | null;
  bio: string | null;
  avatar_url: string | null;
  service_ids: string[] | null;
  branch_ids?: string[];   // энэ эмч аль салбарт ажилладаг (салбартай эмнэлэгт)
};

export type Branch = {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
};

/** Тохиргоо → Ажлын цаг хэсгээс ирдэг өдрийн цаг */
export type DayHours = { open: string; close: string } | null;

export type BusinessHours = {
  mon: DayHours;
  tue: DayHours;
  wed: DayHours;
  thu: DayHours;
  fri: DayHours;
  sat: DayHours;
  sun: DayHours;
};

/** Бүх талбар нь Тохиргоо (/dashboard/settings) хэсгээс удирдагдана */
export type Clinic = {
  id: string;
  name: string;
  slug: string;
  about: string | null;
  address: string | null;
  owner_phone: string | null;
  owner_email: string | null;
  website: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  business_hours: BusinessHours | null;
  services: Service[] | null;
};
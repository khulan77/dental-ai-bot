export type Service = {
  id: string;
  name: string;
  price_mnt: number;
  duration_minutes: number;
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

export type Clinic = {
  id: string;
  name: string;
  slug: string;
  about: string | null;
  address: string | null;
  owner_phone: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  services: Service[] | null;
};
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Supabase Storage-ийн нээлттэй зургууд (үйлчилгээний зураг, эмчийн зураг).
    // Project бүр өөр subdomain-тай тул wildcard — /storage/.../public/ замаар
    // хязгаарлаж, зөвхөн нээлттэй файлыг зөвшөөрнө.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;

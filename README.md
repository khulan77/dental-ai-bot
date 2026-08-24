This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Демо

Нүүр хуудасны "Демо" хэсэг эмнэлгийн нүдээр эхэлнэ:

1. **Демо эмнэлгээр нэвтрэх** (`POST /api/demo-login`) → `/dashboard` —
   статистик, хуанли, захиалга баталгаажуулах, бүх тохиргоо.
2. Самбарын хажуугийн цэсэн дэх **🌐 Үйлчлүүлэгчийн хуудас** → `/c/demo` —
   AI чат, эмч/салбар сонголт, цаг захиалга, кодоор шалгах.

Тэр цэсний холбоос демо төдийгүй **бүх эмнэлэгт** харагдана — эзэн өөрийн
хуудсыг үйлчлүүлэгчийн нүдээр хармаар байдаг.

Демо бүртгэл: `demo@demo.mn` / `demo1234` — санаатайгаар нээлттэй, нууц биш.
Хамгаалалт нь нууц үг биш, `requireOwnedClinicId()` доторх шалгалт
([lib/db/supabase-server.ts](lib/db/supabase-server.ts)): демо эмнэлгийн
**тохиргоо өөрчлөгдөхгүй** (эмч, үйлчилгээ, цаг, slug), харин **захиалгын
төлөв солих** нь ажиллана — өдөр тутмын гол үйлдлийг зочин туршиж үзэх ёстой.

Демо өгөгдлийг үүсгэх / шинэчлэх:

```bash
bun run demo:seed
```

Захиалгууд өнөөдрөөс тоологдож үүсдэг тул хяналтын самбарын статистик хоосон
харагдаж эхэлбэл дахин ажиллуулна. Скрипт нь демо захиалгыг бүр удаа устгаад
шинээр үүсгэдэг тул зочдын үлдээсэн захиалга ч цэвэрлэгдэнэ.

## Хамгаалалт

**Нэвтрэлт сервер талаар.** Форм нь браузераас шууд Supabase рүү биш,
[app/api/login/route.ts](app/api/login/route.ts) руу очно — тэгж байж
хязгаарлалт тавих боломжтой:

- IP тус бүр 15 минутанд 10 оролдлого
- Бүртгэл (имэйл) тус бүр 15 минутанд 5 оролдлого — олон IP-аас нэг данс
  тонохоос хамгаална
- Алдааны мессеж ерөнхий (`Имэйл эсвэл нууц үг буруу байна`) — ямар имэйл
  бүртгэлтэйг таах боломжгүй
- `/api/demo-login` мөн хязгаартай (IP тус бүр цагт 20)
- Бүртгүүлэхэд нууц үг 8+ тэмдэгт, үсэг ба тоо агуулна

> **⚠️ Заавал хийх:** `supabase/rate-limit.sql`-ыг Supabase → SQL Editor дээр
> ажиллуулна уу. Одоогоор энэ project дээр `check_rate_limit` функц болон
> `rate_limits` хүснэгт **байхгүй** тул хязгаарлалтууд Postgres дээр биш,
> зөвхөн санах ойн нөөц тоолуураар ажиллаж байна (Vercel дээр instance тус
> бүрт тусдаа, хүйтэн эхлэлд цэвэрлэгддэг тул сул). `GET /api/health` төлөвийг
> харуулна: `"rate_limiter": "database"` бол бүрэн, `"memory"` бол дутуу.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

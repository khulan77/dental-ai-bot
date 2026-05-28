import { main } from "bun";
import Image from "next/image";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight">
          🦷 Dental AI Bot
        </h1>
        <p className="text-lg text-muted-foreground">
          AI-powered DM automation for dental clinics
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <a
            href="/dashboard"
            className="text-sm text-blue-600 hover:underline"
          >
            Health check →
          </a>
        </div>
        </div>
    </main>
  );
}
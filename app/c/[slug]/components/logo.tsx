/** Эмнэлгийн лого + нэр — nav болон footer-т */
export default function Logo({ name }: { name: string }) {
  return (
    <span className="flex items-center gap-2.5 min-w-0">
      <span className="w-8 h-8 rounded-[var(--site-r-btn)] bg-[var(--site-accent)] flex items-center justify-center shrink-0">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 2C9.2 2 7 4.2 7 7c0 1.8.8 3.4 2 4.5l1 7.5c.1.6.6 1 1.2 1 .5 0 1-.4 1.1-1L13 13v6c.1.6.6 1 1.1 1 .6 0 1.1-.4 1.2-1l1-7.5C17.2 10.4 18 8.8 18 7c0-2.8-2.2-5-5-5z" fill="white"/>
        </svg>
      </span>
      <span className="text-[15px] font-semibold tracking-tight text-[var(--site-ink)] truncate">
        {name}
      </span>
    </span>
  );
}

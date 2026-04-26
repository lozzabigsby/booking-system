import Link from 'next/link';

export default function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-rose-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-semibold tracking-tight text-ink">
          Pink Velvet Nails & Beauty
          <span className="block text-xs font-normal text-rose-500">Dorset's Premier Salon</span>
        </Link>
        <Link href="/login" className="btn-primary text-sm">Login</Link>
      </div>
    </header>
  );
}

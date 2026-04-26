import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="space-y-6">
      <section className="card p-6">
        <p className="text-sm text-rose-500">Dorset's Premier Salon</p>
        <h1 className="mt-1 text-3xl font-semibold">Premium booking for Pink Velvet Nails & Beauty</h1>
        <p className="mt-2 text-gray-600">Mobile-first appointment journeys with staff-first treatment menus and smart availability.</p>
        <Link href="/booking" className="btn-primary mt-4 inline-flex">Book Now</Link>
      </section>
      <section className="grid gap-3 md:grid-cols-2">
        <Link href="/staff/dashboard" className="card p-4">Staff dashboard</Link>
        <Link href="/admin/dashboard" className="card p-4">Admin dashboard</Link>
      </section>
    </div>
  );
}

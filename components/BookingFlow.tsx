'use client';

import { format } from 'date-fns';
import { useMemo, useState } from 'react';
import { generateSlots, isSlotAvailable, staffServiceMenu } from '@/lib/availability';
import { useStore } from '@/lib/store';

const steps = ['Staff', 'Treatments', 'Date & Time', 'Details', 'Card capture', 'Confirmation'];

export default function BookingFlow() {
  const { staff, services, bookings, blocks, addBooking } = useStore();
  const [step, setStep] = useState(0);
  const [staffId, setStaffId] = useState('');
  const [serviceIds, setServiceIds] = useState<string[]>([]);
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [slot, setSlot] = useState('');
  const [customerName, setName] = useState('');
  const [customerPhone, setPhone] = useState('');
  const [customerEmail, setEmail] = useState('');

  const chosenStaff = staff.find((s) => s.id === staffId);
  const menu = useMemo(() => (chosenStaff ? staffServiceMenu(chosenStaff, services, new Date(date)) : []), [chosenStaff, services, date]);
  const duration = useMemo(() => serviceIds.reduce((a, id) => a + (services.find((s) => s.id === id)?.durationMin ?? 0), 0), [serviceIds, services]);
  const slots = useMemo(() => {
    if (!chosenStaff || !duration) return [];
    return generateSlots(new Date(date), duration).map((d) => {
      const available = isSlotAvailable({
        staff: chosenStaff,
        slotStart: d,
        durationMin: duration,
        bookings,
        blocks,
        services,
        selectedServiceIds: serviceIds,
      });
      return { t: d, available };
    });
  }, [chosenStaff, duration, date, bookings, blocks, services, serviceIds]);

  const canNext = [Boolean(staffId), serviceIds.length > 0, Boolean(slot), Boolean(customerName && customerPhone), true, true][step];

  return (
    <div className="card p-4 md:p-6">
      <div className="mb-4 flex gap-2 overflow-x-auto text-xs">
        {steps.map((label, i) => <span key={label} className={`rounded-full px-3 py-1 ${i <= step ? 'bg-brand text-white' : 'bg-rose-100 text-rose-500'}`}>{i + 1}. {label}</span>)}
      </div>

      {step === 0 && <div className="grid gap-2">{staff.map((s) => <button key={s.id} onClick={() => setStaffId(s.id)} className={`btn-secondary text-left ${staffId === s.id ? 'border-brand ring-2 ring-brand/30' : ''}`}><p className="font-medium">{s.name}</p><p className="text-xs text-gray-500">{s.title}</p></button>)}</div>}
      {step === 1 && <div className="grid gap-2">{menu.map((svc) => <label key={svc.id} className="btn-secondary flex items-center justify-between"><span>{svc.name}</span><input type="checkbox" checked={serviceIds.includes(svc.id)} onChange={() => setServiceIds((p) => p.includes(svc.id) ? p.filter((x) => x !== svc.id) : [...p, svc.id])} /></label>)}</div>}
      {step === 2 && <div className="space-y-3"><input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} /><div className="grid max-h-72 grid-cols-2 gap-2 overflow-y-auto">{slots.map(({ t, available }) => <button key={t.toISOString()} disabled={!available.ok} onClick={() => setSlot(t.toISOString())} className={`btn-secondary text-xs ${slot === t.toISOString() ? 'border-brand ring-2 ring-brand/30' : ''} ${!available.ok ? 'cursor-not-allowed opacity-50' : ''}`}>{format(t, 'HH:mm')} {!available.ok && <span className="block text-[10px]">{available.reason}</span>}</button>)}</div></div>}
      {step === 3 && <div className="space-y-2"><input placeholder="Full name" className="input" value={customerName} onChange={(e) => setName(e.target.value)} /><input placeholder="Phone" className="input" value={customerPhone} onChange={(e) => setPhone(e.target.value)} /><input placeholder="Email" className="input" value={customerEmail} onChange={(e) => setEmail(e.target.value)} /></div>}
      {step === 4 && <div className="rounded-xl bg-rose-50 p-4 text-sm"><p className="font-medium">Card capture</p><p className="text-gray-600">Secure card capture to protect your booking. Your card is safely stored and charged only according to the salon cancellation policy.</p></div>}
      {step === 5 && <div className="space-y-2 text-sm"><p className="font-medium">Confirmed 🎉</p><p>{customerName}, your appointment with {chosenStaff?.name} on {slot ? format(new Date(slot), 'EEE d MMM, HH:mm') : ''} is confirmed.</p></div>}

      <div className="mt-5 flex justify-between">
        <button className="btn-secondary" onClick={() => setStep((s) => Math.max(0, s - 1))}>Back</button>
        {step < steps.length - 1 ? (
          <button className="btn-primary" disabled={!canNext} onClick={() => {
            if (step === 4) {
              addBooking({ staffId, serviceIds, start: slot, customerName, customerPhone, customerEmail, notes: '', source: 'customer' });
            }
            setStep((s) => s + 1);
          }}>Continue</button>
        ) : (
          <button className="btn-primary" onClick={() => {
            setStep(0);
            setStaffId('');
            setServiceIds([]);
            setSlot('');
            setName('');
            setPhone('');
            setEmail('');
          }}>Book another</button>
        )}
      </div>
    </div>
  );
}

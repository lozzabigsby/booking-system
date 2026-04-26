'use client';

import { addDays, addHours, addMinutes, format, isSameDay, parseISO, startOfWeek } from 'date-fns';
import { useMemo, useState } from 'react';
import { generateSlots, isSlotAvailable } from '@/lib/availability';
import { useStore } from '@/lib/store';

export default function WeeklyScheduler() {
  const { staff, services, bookings, blocks, addBlock, addBooking } = useStore();
  const [staffId, setStaffId] = useState(staff[0]?.id ?? '');
  const [weekOf, setWeekOf] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [zoom, setZoom] = useState(1);
  const [activeBookingId, setActiveBookingId] = useState<string | null>(null);
  const [openBlock, setOpenBlock] = useState<{ day: Date; time?: string } | null>(null);
  const [openManual, setOpenManual] = useState(false);

  const [blockType, setBlockType] = useState<'full-day' | 'half-day' | 'range'>('full-day');
  const [half, setHalf] = useState<'morning' | 'afternoon'>('morning');
  const [reason, setReason] = useState('Unavailable');
  const [rangeStart, setRangeStart] = useState('09:00');
  const [rangeEnd, setRangeEnd] = useState('10:00');

  const [manualServices, setManualServices] = useState<string[]>([]);
  const [manualDate, setManualDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [manualSlot, setManualSlot] = useState('');

  const selectedStaff = staff.find((s) => s.id === staffId) ?? staff[0];
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekOf, i));
  const hours = Array.from({ length: 10 }, (_, i) => 9 + i);

  const serviceMenu = services.filter((s) => selectedStaff.categories.includes(s.category));

  const manualSlots = useMemo(() => {
    const dur = manualServices.reduce((a, id) => a + (services.find((s) => s.id === id)?.durationMin ?? 0), 0);
    if (!dur) return [];
    return generateSlots(new Date(manualDate), dur).filter((slot) =>
      isSlotAvailable({ staff: selectedStaff, slotStart: slot, durationMin: dur, bookings, blocks, services, selectedServiceIds: manualServices }).ok,
    );
  }, [manualDate, manualServices, selectedStaff, bookings, blocks, services]);

  const bookingForCell = (day: Date, hour: number) => bookings.find((b) => b.staffId === staffId && isSameDay(parseISO(b.start), day) && parseISO(b.start).getHours() === hour);
  const blockForCell = (day: Date, hour: number) =>
    blocks.find((bl) => bl.staffId === staffId && parseISO(bl.start) <= addHours(day, hour) && parseISO(bl.end) > addHours(day, hour));

  return (
    <div className="card p-3 md:p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <select className="input max-w-48" value={staffId} onChange={(e) => setStaffId(e.target.value)}>{staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
        <input className="input max-w-48" type="month" value={format(weekOf, 'yyyy-MM')} onChange={(e) => setWeekOf(startOfWeek(new Date(`${e.target.value}-01`), { weekStartsOn: 1 }))} />
        <input className="input max-w-52" type="date" min={format(new Date(), 'yyyy-MM-dd')} max={format(addDays(new Date(), 365), 'yyyy-MM-dd')} value={format(weekOf, 'yyyy-MM-dd')} onChange={(e) => setWeekOf(startOfWeek(new Date(e.target.value), { weekStartsOn: 1 }))} />
        <button className="btn-secondary" onClick={() => setWeekOf(addDays(weekOf, -7))}>Prev week</button>
        <button className="btn-secondary" onClick={() => setWeekOf(addDays(weekOf, 7))}>Next week</button>
        <button className="btn-secondary" onClick={() => setZoom((z) => Math.max(0.8, z - 0.1))}>-</button>
        <button className="btn-secondary" onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))}>+</button>
        <button className="btn-primary ml-auto" onClick={() => setOpenManual(true)}>+ Manual booking</button>
      </div>

      <div className="grid grid-cols-8 gap-1 overflow-x-auto text-xs" style={{ zoom }}>
        <div />
        {days.map((d) => <button key={d.toISOString()} onClick={() => setOpenBlock({ day: d })} className="rounded bg-rose-100 px-1 py-2 text-center"><p>{format(d, 'EEE')}</p><p>{format(d, 'd MMM')}</p></button>)}
        {hours.map((h) => (
          <div className="contents" key={`row-${h}`}>
            <div key={`h-${h}`} className="p-1 text-[10px] text-gray-500">{String(h).padStart(2, '0')}:00</div>
            {days.map((d) => {
              const b = bookingForCell(d, h);
              const blocked = blockForCell(d, h);
              return (
                <button key={`${d.toISOString()}-${h}`} onClick={() => (b ? setActiveBookingId(b.id) : setOpenBlock({ day: d, time: `${String(h).padStart(2, '0')}:00` }))} className={`min-h-10 rounded border border-rose-100 p-1 text-left ${b ? 'bg-brand/20' : blocked ? 'bg-gray-100' : 'bg-white'}`}>
                  {b ? <span className="block text-[10px] font-medium">{b.customerName}</span> : blocked ? <span className="block text-[10px] text-gray-500">{blocked.reason}</span> : null}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {activeBookingId && (() => {
        const b = bookings.find((x) => x.id === activeBookingId);
        if (!b) return null;
        return <div className="fixed inset-0 z-40 grid place-items-center bg-black/30 p-4" onClick={() => setActiveBookingId(null)}><div className="card w-full max-w-sm p-4" onClick={(e) => e.stopPropagation()}><p className="font-semibold">Booking details</p><p>{b.customerName}</p><p>{b.customerPhone}</p><p>{format(parseISO(b.start), 'EEE d MMM HH:mm')}</p><p>Source: {b.source}</p></div></div>;
      })()}

      {openBlock && <div className="fixed inset-0 z-40 grid place-items-center bg-black/30 p-4"><div className="card w-full max-w-md space-y-2 p-4"><p className="font-semibold">Block off time</p><p className="text-xs">{format(openBlock.day, 'EEE d MMM')} {openBlock.time ?? ''}</p><select className="input" value={blockType} onChange={(e) => setBlockType(e.target.value as any)}><option value="full-day">Full day</option><option value="half-day">Half day</option><option value="range">Specific time range</option></select>{blockType === 'half-day' && <select className="input" value={half} onChange={(e) => setHalf(e.target.value as any)}><option value="morning">Morning</option><option value="afternoon">Afternoon</option></select>}{blockType === 'range' && <div className="grid grid-cols-2 gap-2"><input className="input" type="time" value={rangeStart} onChange={(e) => setRangeStart(e.target.value)} /><input className="input" type="time" value={rangeEnd} onChange={(e) => setRangeEnd(e.target.value)} /></div>}<input className="input" placeholder="Reason" value={reason} onChange={(e) => setReason(e.target.value)} /><div className="flex justify-end gap-2"><button className="btn-secondary" onClick={() => setOpenBlock(null)}>Cancel</button><button className="btn-primary" onClick={() => {
        const s = new Date(openBlock.day);
        const e = new Date(openBlock.day);
        if (blockType === 'full-day') {
          s.setHours(0, 0, 0, 0);
          e.setHours(23, 59, 59, 999);
        } else if (blockType === 'half-day') {
          s.setHours(half === 'morning' ? 9 : 13, 0, 0, 0);
          e.setHours(half === 'morning' ? 13 : 18, 0, 0, 0);
        } else {
          const [sh, sm] = rangeStart.split(':').map(Number);
          const [eh, em] = rangeEnd.split(':').map(Number);
          s.setHours(sh, sm, 0, 0);
          e.setHours(eh, em, 0, 0);
        }
        addBlock({ staffId, type: blockType, start: s.toISOString(), end: e.toISOString(), half: blockType === 'half-day' ? half : undefined, reason });
        setOpenBlock(null);
      }}>Save block-off</button></div></div></div>}

      {openManual && <div className="fixed inset-0 z-40 grid place-items-center bg-black/30 p-4"><div className="card w-full max-w-lg space-y-2 p-4"><p className="font-semibold">Manual booking</p><input type="date" className="input" value={manualDate} onChange={(e) => setManualDate(e.target.value)} /><div className="grid max-h-32 gap-1 overflow-y-auto">{serviceMenu.map((s) => <label key={s.id} className="btn-secondary flex justify-between"><span>{s.name}</span><input type="checkbox" checked={manualServices.includes(s.id)} onChange={() => setManualServices((p) => p.includes(s.id) ? p.filter((x) => x !== s.id) : [...p, s.id])} /></label>)}</div><select className="input" value={manualSlot} onChange={(e) => setManualSlot(e.target.value)}><option value="">Select available slot</option>{manualSlots.map((s) => <option key={s.toISOString()} value={s.toISOString()}>{format(s, 'HH:mm')}</option>)}</select><div className="flex justify-end gap-2"><button className="btn-secondary" onClick={() => setOpenManual(false)}>Cancel</button><button className="btn-primary" disabled={!manualSlot || manualServices.length === 0} onClick={() => {
        addBooking({ staffId, serviceIds: manualServices, start: manualSlot, customerName: 'Phone booking', customerPhone: 'N/A', customerEmail: '', source: 'manual', notes: 'Manual calendar booking' });
        setOpenManual(false);
      }}>Create manual booking</button></div></div></div>}
    </div>
  );
}

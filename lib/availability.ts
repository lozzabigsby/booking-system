import { addMinutes, formatISO, isMonday, isSameDay, parseISO, startOfDay } from 'date-fns';
import { BlockOff, Booking, Service, Staff } from './types';

export const WORK_START = 9;
export const WORK_END = 18;

const overlaps = (aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) => aStart < bEnd && aEnd > bStart;

export function bookingDurationMin(services: Service[], selectedIds: string[]) {
  return selectedIds.reduce((acc, id) => acc + (services.find((s) => s.id === id)?.durationMin ?? 0), 0);
}

export function staffServiceMenu(staff: Staff, services: Service[], date?: Date) {
  if (staff.trainingOnlyMondays && date && isMonday(date)) {
    return services.filter((s) => s.category === 'training');
  }
  return services.filter((s) => staff.categories.includes(s.category));
}

export function isSlotAvailable(params: {
  staff: Staff;
  slotStart: Date;
  durationMin: number;
  bookings: Booking[];
  blocks: BlockOff[];
  services: Service[];
  selectedServiceIds: string[];
}) {
  const { staff, slotStart, durationMin, bookings, blocks, services, selectedServiceIds } = params;
  const slotEnd = addMinutes(slotStart, durationMin);
  const dayStart = startOfDay(slotStart);

  const menu = staffServiceMenu(staff, services, slotStart);
  if (selectedServiceIds.some((id) => !menu.some((s) => s.id === id))) {
    return { ok: false, reason: 'Unavailable: Service restriction' };
  }
  if (staff.trainingOnlyMondays && isMonday(slotStart) && selectedServiceIds.some((id) => services.find((s) => s.id === id)?.category !== 'training')) {
    return { ok: false, reason: 'Unavailable: Training day' };
  }

  const blocked = blocks
    .filter((b) => b.staffId === staff.id)
    .find((b) => overlaps(slotStart, slotEnd, parseISO(b.start), parseISO(b.end)) || (b.type === 'full-day' && isSameDay(parseISO(b.start), dayStart)));
  if (blocked) return { ok: false, reason: `Unavailable: ${blocked.reason}` };

  const clash = bookings
    .filter((b) => b.staffId === staff.id)
    .find((b) => overlaps(slotStart, slotEnd, parseISO(b.start), parseISO(b.end)));
  if (clash) return { ok: false, reason: 'Unavailable: Existing booking' };

  return { ok: true as const };
}

export function generateSlots(date: Date, durationMin: number) {
  const slots: Date[] = [];
  let cursor = new Date(date);
  cursor.setHours(WORK_START, 0, 0, 0);
  const end = new Date(date);
  end.setHours(WORK_END, 0, 0, 0);
  while (addMinutes(cursor, durationMin) <= end) {
    slots.push(new Date(cursor));
    cursor = addMinutes(cursor, 30);
  }
  return slots;
}

export const toIso = (d: Date) => formatISO(d);

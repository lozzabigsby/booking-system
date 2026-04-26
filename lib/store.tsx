'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { addMinutes } from 'date-fns';
import { staffSeed, servicesSeed } from './mockData';
import { BlockOff, Booking, Service, Staff } from './types';
import { bookingDurationMin } from './availability';

type DataStore = {
  staff: Staff[];
  services: Service[];
  bookings: Booking[];
  blocks: BlockOff[];
  addBooking: (payload: Omit<Booking, 'id' | 'end'>) => void;
  addBlock: (payload: Omit<BlockOff, 'id'>) => void;
};

const Ctx = createContext<DataStore | null>(null);
const key = 'pink-velvet-data-v1';

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [blocks, setBlocks] = useState<BlockOff[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw) as { bookings: Booking[]; blocks: BlockOff[] };
      setBookings(parsed.bookings ?? []);
      setBlocks(parsed.blocks ?? []);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify({ bookings, blocks }));
  }, [bookings, blocks]);

  const value = useMemo<DataStore>(
    () => ({
      staff: staffSeed,
      services: servicesSeed,
      bookings,
      blocks,
      addBooking(payload) {
        const duration = bookingDurationMin(servicesSeed, payload.serviceIds);
        const end = addMinutes(new Date(payload.start), duration || 30).toISOString();
        setBookings((p) => [...p, { ...payload, id: crypto.randomUUID(), end }]);
      },
      addBlock(payload) {
        setBlocks((p) => [...p, { ...payload, id: crypto.randomUUID() }]);
      },
    }),
    [bookings, blocks],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useStore = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
};

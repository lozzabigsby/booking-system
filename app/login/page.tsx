'use client';

import { useState } from 'react';

export default function LoginPage() {
  const [role, setRole] = useState<'staff' | 'admin'>('staff');
  return (
    <div className="card mx-auto max-w-md space-y-3 p-5">
      <h1 className="text-xl font-semibold">Login</h1>
      <input className="input" placeholder="Email" />
      <input className="input" placeholder="Password" type="password" />
      <select className="input" value={role} onChange={(e) => setRole(e.target.value as 'staff' | 'admin')}>
        <option value="staff">Staff</option>
        <option value="admin">Admin</option>
      </select>
      <button className="btn-primary w-full">Continue as {role}</button>
    </div>
  );
}

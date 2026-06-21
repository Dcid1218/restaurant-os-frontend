'use client';

import { useState, useEffect } from 'react';
import DashboardShell from '@/components/DashboardShell';
import { apiFetch, getOrgId } from '@/lib/api';

interface OrgUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt?: string;
}

interface OrgInfo {
  id: string;
  name: string;
  slug: string;
  address?: string;
  phone?: string;
  timezone?: string;
  createdAt?: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<OrgUser[]>([]);
  const [org, setOrg] = useState<OrgInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ email: '', firstName: '', lastName: '', role: 'STAFF', password: '' });
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<'users' | 'org'>('users');
  const orgId = getOrgId();

  const load = async () => {
    try {
      const [usersRes, orgRes] = await Promise.all([
        apiFetch(`/organizations/${orgId}/users`),
        apiFetch(`/organizations/${orgId}`),
      ]);
      setUsers(Array.isArray(usersRes) ? usersRes : usersRes.users || usersRes.data || []);
      setOrg(orgRes);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ ...form, organizationId: orgId }),
      });
      setForm({ email: '', firstName: '', lastName: '', role: 'STAFF', password: '' });
      setShowForm(false);
      await load();
    } catch (err: any) {
      alert(err.message);
    }
    setSaving(false);
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm('Deactivate this user?')) return;
    try {
      await apiFetch(`/organizations/${orgId}/users/${id}/deactivate`, { method: 'POST' });
      await load();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const roleColors: Record<string, string> = {
    OWNER: 'bg-amber-500/10 text-amber-400',
    MANAGER: 'bg-blue-500/10 text-blue-400',
    STAFF: 'bg-slate-700/50 text-slate-400',
  };

  return (
    <DashboardShell active="Users">
      <div className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">Team & Organization</h1>
            <p className="mt-1 text-sm text-slate-400">Manage users, roles, and organization settings</p>
          </div>
          {tab === 'users' && (
            <button onClick={() => setShowForm(!showForm)} className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition">
              {showForm ? 'Cancel' : '+ Invite User'}
            </button>
          )}
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400">{error}</div>}

        {/* Tabs */}
        <div className="flex gap-2">
          <button onClick={() => setTab('users')} className={`rounded-lg px-4 py-2 text-sm font-medium transition ${tab === 'users' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
            Team Members ({users.length})
          </button>
          <button onClick={() => setTab('org')} className={`rounded-lg px-4 py-2 text-sm font-medium transition ${tab === 'org' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
            Organization Settings
          </button>
        </div>

        {loading ? (
          <div className="text-center text-slate-500 py-12">Loading...</div>
        ) : tab === 'users' ? (
          <>
            {showForm && (
              <form onSubmit={handleCreate} className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-4">
                <div className="text-sm font-medium text-slate-200">Invite New Team Member</div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">First Name</label>
                    <input value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} required className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Last Name</label>
                    <input value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} required className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Email</label>
                    <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Role</label>
                    <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500">
                      <option value="STAFF">Staff</option>
                      <option value="MANAGER">Manager</option>
                      <option value="OWNER">Owner</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Temporary Password</label>
                    <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500" />
                  </div>
                </div>
                <button type="submit" disabled={saving} className="rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 px-4 py-2 text-sm font-medium text-white transition">
                  {saving ? 'Sending Invite...' : 'Send Invite'}
                </button>
              </form>
            )}

            <div className="rounded-xl border border-slate-800 bg-slate-900/50">
              <div className="border-b border-slate-800 px-5 py-4">
                <div className="text-sm font-medium text-slate-200">Team Members ({users.length})</div>
              </div>
              {users.length === 0 ? (
                <div className="p-8 text-center text-slate-500">No team members yet. Invite your first team member above.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wider text-slate-400">
                        <th className="px-5 py-3">Name</th>
                        <th className="px-5 py-3">Email</th>
                        <th className="px-5 py-3">Role</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3">Last Login</th>
                        <th className="px-5 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                          <td className="px-5 py-3 text-slate-300">{u.firstName} {u.lastName}</td>
                          <td className="px-5 py-3 text-slate-400">{u.email}</td>
                          <td className="px-5 py-3">
                            <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${roleColors[u.role] ?? 'bg-slate-700 text-slate-300'}`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${u.isActive !== false ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-700/50 text-slate-500'}`}>
                              {u.isActive !== false ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-slate-500">{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : 'Never'}</td>
                          <td className="px-5 py-3">
                            {u.isActive !== false && (
                              <button onClick={() => handleDeactivate(u.id)} className="text-rose-400 hover:text-rose-300 text-xs font-medium">Deactivate</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Org Settings Tab */
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 space-y-6">
            {org ? (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Organization Name</label>
                    <div className="text-white font-medium">{org.name}</div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Slug</label>
                    <div className="text-slate-300 font-mono">{org.slug}</div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Address</label>
                    <div className="text-slate-300">{org.address || 'Not set'}</div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Phone</label>
                    <div className="text-slate-300">{org.phone || 'Not set'}</div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Timezone</label>
                    <div className="text-slate-300">{org.timezone || 'Not set'}</div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Organization ID</label>
                    <div className="text-slate-500 font-mono text-xs">{org.id}</div>
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-800">
                  <p className="text-xs text-slate-500">To update organization settings, contact support or use the API directly.</p>
                </div>
              </>
            ) : (
              <div className="text-slate-500">Organization details not available.</div>
            )}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

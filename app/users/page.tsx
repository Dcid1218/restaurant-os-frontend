'use client';

import { useState, useEffect } from 'react';
import DashboardShell from '@/components/DashboardShell';
import Badge from '@/components/Badge';
import Button from '@/components/Button';
import Avatar from '@/components/Avatar';
import EmptyState from '@/components/EmptyState';
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

const roleVariant: Record<string, 'warning' | 'info' | 'neutral'> = {
  OWNER: 'warning',
  MANAGER: 'info',
  STAFF: 'neutral',
};

const inputCls =
  'w-full bg-inset border border-edge rounded-lg px-3 py-2 text-sm text-hi placeholder-lo focus:outline-none focus:border-accent transition-colors';

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

  useEffect(() => {
    load();
  }, []);

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

  return (
    <DashboardShell active="Team">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-lg font-semibold text-hi">Team & Organization</h1>
            <p className="text-xs text-lo mt-0.5">Manage users, roles, and organization settings</p>
          </div>
          {tab === 'users' && (
            <Button onClick={() => setShowForm(!showForm)} variant={showForm ? 'secondary' : 'primary'}>
              {showForm ? 'Cancel' : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Invite User
                </>
              )}
            </Button>
          )}
        </div>

        {error && (
          <div className="bg-danger/5 border border-danger/20 rounded-lg px-4 py-3 text-sm text-danger">{error}</div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 border-b border-rim">
          {[
            { key: 'users', label: `Team Members (${users.length})` },
            { key: 'org', label: 'Organization Settings' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key as 'users' | 'org')}
              className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                tab === key
                  ? 'text-accent border-accent'
                  : 'text-lo border-transparent hover:text-mid'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="h-48 rounded-lg bg-surface border border-rim animate-pulse" />
        ) : tab === 'users' ? (
          <>
            {/* Invite form */}
            {showForm && (
              <form onSubmit={handleCreate} className="bg-surface border border-rim rounded-lg p-5 space-y-4">
                <div className="text-sm font-medium text-hi">Invite New Team Member</div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label className="block text-xs text-mid mb-1.5">First Name</label>
                    <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs text-mid mb-1.5">Last Name</label>
                    <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs text-mid mb-1.5">Email</label>
                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs text-mid mb-1.5">Role</label>
                    <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={inputCls}>
                      <option value="STAFF">Staff</option>
                      <option value="MANAGER">Manager</option>
                      <option value="OWNER">Owner</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-mid mb-1.5">Temporary Password</label>
                    <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required className={inputCls} />
                  </div>
                </div>
                <Button type="submit" loading={saving}>
                  Send Invite
                </Button>
              </form>
            )}

            {/* Users table */}
            <div className="bg-surface border border-rim rounded-lg overflow-hidden">
              <div className="border-b border-rim px-5 py-3.5">
                <span className="text-sm font-medium text-hi">Team Members</span>
              </div>
              {users.length === 0 ? (
                <EmptyState
                  title="No team members yet"
                  description="Invite your first team member to get started."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-rim text-xs uppercase tracking-wider text-lo">
                        <th className="text-left px-5 py-3">Name</th>
                        <th className="text-left px-5 py-3">Email</th>
                        <th className="text-left px-5 py-3">Role</th>
                        <th className="text-left px-5 py-3">Status</th>
                        <th className="text-left px-5 py-3">Last Login</th>
                        <th className="text-left px-5 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id} className="border-b border-rim/50 hover:bg-raised/40 transition-colors">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <Avatar name={`${u.firstName} ${u.lastName}`} size="sm" />
                              <span className="text-mid font-medium">{u.firstName} {u.lastName}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-lo">{u.email}</td>
                          <td className="px-5 py-3">
                            <Badge variant={roleVariant[u.role] ?? 'neutral'}>{u.role}</Badge>
                          </td>
                          <td className="px-5 py-3">
                            <Badge variant={u.isActive !== false ? 'success' : 'neutral'}>
                              {u.isActive !== false ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                          <td className="px-5 py-3 text-lo text-xs">
                            {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : 'Never'}
                          </td>
                          <td className="px-5 py-3">
                            {u.isActive !== false && (
                              <button
                                onClick={() => handleDeactivate(u.id)}
                                className="text-xs text-lo hover:text-danger transition-colors font-medium"
                              >
                                Deactivate
                              </button>
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
          /* Org Settings */
          <div className="bg-surface border border-rim rounded-lg p-6 space-y-6">
            {org ? (
              <>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {[
                    { label: 'Organization Name', value: org.name, mono: false },
                    { label: 'Slug', value: org.slug, mono: true },
                    { label: 'Address', value: org.address || 'Not set', mono: false },
                    { label: 'Phone', value: org.phone || 'Not set', mono: false },
                    { label: 'Timezone', value: org.timezone || 'Not set', mono: false },
                    { label: 'Organization ID', value: org.id, mono: true },
                  ].map(({ label, value, mono }) => (
                    <div key={label}>
                      <div className="text-xs font-medium text-lo mb-1.5">{label}</div>
                      <div className={`text-sm text-mid ${mono ? 'font-mono text-xs' : ''}`}>{value}</div>
                    </div>
                  ))}
                </div>
                <div className="pt-5 border-t border-rim">
                  <p className="text-xs text-lo">
                    To update organization settings, contact support or use the API directly.
                  </p>
                </div>
              </>
            ) : (
              <div className="text-sm text-lo">Organization details not available.</div>
            )}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

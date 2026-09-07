'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { Workspace, WorkspaceMember, MemberRole } from '../../types';
import { generateId } from '../../lib/utils';
import { Copy, Check, UserPlus, Trash2, Mail, Link as LinkIcon, Shield } from 'lucide-react';

import toast from 'react-hot-toast';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspace: Workspace;
  onAddMember: (member: WorkspaceMember) => void;
  onRemoveMember: (memberId: string) => void;
  onUpdateMemberRole: (memberId: string, role: MemberRole) => void;
}

export function InviteMemberModal({
  isOpen,
  onClose,
  workspace,
  onAddMember,
  onRemoveMember,
  onUpdateMemberRole,
}: InviteMemberModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<MemberRole>('member');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);

  const inviteLink = generatedToken 
    ? `${window.location.origin}/join?token=${generatedToken}`
    : `${window.location.origin}/join?workspace=${workspace.slug}`; // Fallback if no specific token

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setGeneratedToken(null);

    if (!email.trim()) {
      setError('Please enter an email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email format');
      return;
    }

    // Check if already in workspace
    const exists = workspace.members.some(
      (m) => m.email.toLowerCase() === email.trim().toLowerCase()
    );
    if (exists) {
      setError('This user is already a member of this workspace');
      return;
    }

    setIsInviting(true);
    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId: workspace.id,
          email: email.trim(),
          role: role,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setGeneratedToken(data.invite.token);
        setEmail('');
        toast.success(`Invitation link generated for ${data.invite.email}`);
      } else {
        const errData = await res.json();
        setError(errData.error || 'Failed to generate invite');
        toast.error(errData.error || 'Failed to generate invite');
      }
    } catch (err: any) {
      console.error(err);
      setError('A network error occurred while generating invite');
      toast.error('Network error generating invite');
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Invite to ${workspace.name}`}
      description="Collaborators can view tasks, update status, and manage sprint deliverables."
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Copy Invite Link */}
        <div className="p-3 rounded-lg border border-zinc-800 bg-zinc-950/60 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span className="flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5" />
              DIRECT INVITATION LINK
            </span>
            <span>Link expires in 7 days</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={generatedToken ? inviteLink : "Generate an invite via email below"}
              className="flex-1 bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300 px-3 py-1.5 rounded-md focus:outline-none truncate"
            />
            <Button
              type="button"
              variant={copied ? 'secondary' : 'outline'}
              size="sm"
              onClick={handleCopyLink}
              disabled={!generatedToken}
              className="font-mono text-xs flex items-center gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Invite by Email form */}
        <form onSubmit={handleInviteSubmit} className="space-y-3">
          <div className="text-xs font-mono text-zinc-400 font-medium">
            INVITE VIA EMAIL
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <Input
                placeholder="colleague@company.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                leftIcon={<Mail className="w-4 h-4 text-zinc-400" />}
              />
            </div>
            <div className="w-full sm:w-36">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as MemberRole)}
                className="flex h-9 w-full rounded-md border bg-zinc-950 px-3 py-1 text-xs font-mono text-zinc-200 shadow-xs focus-visible:outline-none focus-visible:border-zinc-500"
              >
                <option value="member">Member (Edit)</option>
                <option value="admin">Admin (Full)</option>
                <option value="viewer">Viewer (Read)</option>
              </select>
            </div>
            <Button type="submit" variant="default" size="default" className="flex items-center gap-1.5" disabled={isInviting}>
              {isInviting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Inviting...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Send Invite</span>
                </>
              )}
            </Button>
          </div>
          {error && <p className="text-xs font-mono text-rose-400">{error}</p>}
        </form>

        {/* Current Roster */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400 font-medium">
            <span>WORKSPACE MEMBERS ({workspace.members.length})</span>
            <span>ROLE PERMISSIONS</span>
          </div>

          <div className="divide-y divide-zinc-800/80 max-h-56 overflow-y-auto pr-1">
            {workspace.members.map((m) => (
              <div key={m.id} className="py-2.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar src={m.avatar} name={m.name} size="md" />
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-zinc-200 truncate flex items-center gap-1.5">
                      {m.name}
                      {m.role === 'admin' && (
                        <span className="text-[10px] font-mono text-blue-400 bg-blue-950/40 px-1 py-0.5 rounded border border-blue-800/40">
                          Admin
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] font-mono text-zinc-400 truncate">
                      {m.email} • Joined {m.joinedAt}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={m.role}
                    onChange={(e) => onUpdateMemberRole(m.id, e.target.value as MemberRole)}
                    className="h-7 text-xs font-mono bg-zinc-950 border border-zinc-800 rounded px-2 text-zinc-300 focus:outline-none"
                  >
                    <option value="admin">Admin</option>
                    <option value="member">Member</option>
                    <option value="viewer">Viewer</option>
                  </select>

                  {workspace.members.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onRemoveMember(m.id)}
                      className="p-1 rounded text-zinc-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                      title="Remove member"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-zinc-800">
          <Button variant="ghost" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
}

'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User } from '../../types';
import { DEMO_USERS } from '../../data/initialData';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Avatar } from '../ui/Avatar';
import { ArrowLeft, Check, Sparkles, ShieldCheck, ArrowRight, Lock, Mail, User as UserIcon } from 'lucide-react';

interface AuthViewProps {
  currentUser: User | null;
  onLogin: (user: User) => void;
  onClose: () => void;
}

export function AuthView({ currentUser, onLogin, onClose }: AuthViewProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [role, setRole] = useState('Frontend Engineer');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isSignUp) {
      if (!name.trim() || !email.trim() || !password.trim()) {
        setError('Please fill in all required fields.');
        return;
      }

      const newUser: User = {
        id: `usr_${Date.now().toString(36)}`,
        name: name.trim(),
        email: email.trim(),
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}`,
        role: role,
        title: title.trim() || role,
      };

      onLogin(newUser);
    } else {
      if (!email.trim() || !password.trim()) {
        setError('Please enter your email and password.');
        return;
      }

      // Check if matches any demo user
      const existing = DEMO_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        onLogin(existing);
      } else {
        // Allow arbitrary login for evaluation ease
        const demoUser: User = {
          id: `usr_${Date.now().toString(36)}`,
          name: email.split('@')[0].replace('.', ' '),
          email: email.trim(),
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(email)}`,
          role: 'Team Contributor',
          title: 'Software Engineer',
        };
        onLogin(demoUser);
      }
    }
  };

  const handleQuickLogin = (user: User) => {
    onLogin(user);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col justify-between p-3 sm:p-6 md:p-8">
      {/* Top Header */}
      <div className="max-w-6xl w-full mx-auto flex flex-wrap items-center justify-between gap-2">
        <button
          onClick={onClose}
          className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-zinc-200 transition-colors py-1.5 px-2 rounded-md hover:bg-zinc-800/60"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Workspace Board</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-zinc-400 hidden xs:inline">STATUS:</span>
          <span className="inline-flex items-center gap-1 text-[10px] xs:text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            AUTH SERVICE ACTIVE
          </span>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-4xl w-full mx-auto my-auto grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 py-4 sm:py-8 items-center">
        {/* Left Column: Quick demo switcher & feature highlights */}
        <div className="md:col-span-6 space-y-5">
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-400">
              <Sparkles className="w-3 h-3 text-zinc-300" />
              <span>INTERN EVALUATION ACCESS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-zinc-100">
              High-throughput team productivity OS
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-md">
              Designed with precision Geist Mono typography, zero artificial gradient clutter, and real-time kanban state synchronization.
            </p>
          </div>

          {/* Quick Demo Switcher Cards */}
          <div className="space-y-2.5 pt-2">
            <span className="text-xs font-mono text-zinc-400 block font-medium">
              ONE-CLICK DEMO ACCOUNTS:
            </span>
            <div className="grid grid-cols-1 gap-2">
              {DEMO_USERS.map((u) => {
                const isSelected = currentUser?.id === u.id;
                return (
                  <button
                    key={u.id}
                    onClick={() => handleQuickLogin(u)}
                    className={`flex items-center justify-between p-2.5 rounded-lg border text-left transition-all ${
                      isSelected
                        ? 'border-zinc-500 bg-zinc-800/80 text-zinc-100 shadow-sm'
                        : 'border-zinc-800/90 bg-zinc-900/40 hover:bg-zinc-800/50 hover:border-zinc-700 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar src={u.avatar} name={u.name} size="md" />
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-zinc-200 truncate flex items-center gap-1.5">
                          {u.name}
                          {isSelected && (
                            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-1 py-0.2 rounded border border-emerald-800/40">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-mono text-zinc-400 truncate">
                          {u.email} • {u.role}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-zinc-400 flex items-center gap-1 group-hover:text-zinc-200">
                      <span>Sign in</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Custom Login / Sign Up Form */}
        <div className="md:col-span-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-zinc-800 bg-zinc-900/90 p-4 sm:p-7 shadow-xl space-y-5 sm:space-y-6"
          >
            {/* Tabs */}
            <div className="flex rounded-lg bg-zinc-950 p-1 border border-zinc-800">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(false);
                  setError('');
                }}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  !isSignUp
                    ? 'bg-zinc-800 text-zinc-100 shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(true);
                  setError('');
                }}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  isSignUp
                    ? 'bg-zinc-800 text-zinc-100 shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Create Account
              </button>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-zinc-100">
                {isSignUp ? 'Create your workspace profile' : 'Sign in to your account'}
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                {isSignUp
                  ? 'Join an existing workspace or initialize a new team board.'
                  : 'Enter your credentials or click any demo preset on the left.'}
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-md bg-rose-950/40 border border-rose-800/50 text-xs font-mono text-rose-300">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <>
                  <Input
                    label="FULL NAME"
                    id="fullName"
                    placeholder="e.g. Jordan Lee"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    leftIcon={<UserIcon className="w-4 h-4" />}
                    required
                  />

                  <Input
                    label="JOB TITLE / SPECIALTY"
                    id="title"
                    placeholder="e.g. Staff Fullstack Engineer"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />

                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono text-zinc-400 font-medium">
                      TEAM DISCIPLINE
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="flex h-9 w-full rounded-md border border-zinc-800 bg-zinc-950/80 px-3 py-1 text-sm text-zinc-100 shadow-xs focus-visible:outline-none focus-visible:border-zinc-500"
                    >
                      <option value="Frontend Engineer">Frontend Engineer</option>
                      <option value="Backend Specialist">Backend Specialist</option>
                      <option value="Product Designer">Product Designer</option>
                      <option value="DevOps / Infra">DevOps / Infra</option>
                      <option value="Product Manager">Product Manager</option>
                    </select>
                  </div>
                </>
              )}

              <Input
                label="EMAIL ADDRESS"
                id="email"
                type="email"
                placeholder="alex.vance@teamflow.dev"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
                required
              />

              <Input
                label="PASSWORD"
                id="password"
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
                required
              />

              <Button type="submit" className="w-full mt-2" size="default">
                {isSignUp ? 'Initialize Profile & Enter' : 'Sign In with Email'}
              </Button>
            </form>

            <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] font-mono text-zinc-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
                Session auto-cached
              </span>
              <span>Ed25519 Token Mock</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-6xl w-full mx-auto text-center text-xs font-mono text-zinc-400 py-4 border-t border-zinc-900">
        Task Management OS • Intern Project Showcase • Designed with Geist Mono & Shadcn Aesthetics
      </div>
    </div>
  );
}

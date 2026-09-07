'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { ArrowLeft, Lock, Mail, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

function LoginForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const redirectUrl = searchParams.get('redirect') || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        // On successful signup, Supabase auto-logins if email confirmations are disabled.
        router.push(redirectUrl);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push(redirectUrl);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full space-y-8">
        <button
          onClick={() => router.push('/')}
          className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-zinc-200 transition-colors py-1.5 px-2 rounded-md hover:bg-zinc-800/60"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </button>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-zinc-800 bg-zinc-900/90 p-6 sm:p-8 shadow-xl space-y-6"
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
            <h2 className="text-xl font-semibold text-zinc-100 tracking-tight">
              {isSignUp ? 'Create your account' : 'Sign in to Kanso'}
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              {isSignUp
                ? 'Join a high-throughput productivity environment.'
                : 'Welcome back. Enter your credentials.'}
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-md bg-rose-950/40 border border-rose-800/50 text-xs font-mono text-rose-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="EMAIL ADDRESS"
              id="email"
              type="email"
              placeholder="alex@example.com"
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

            <Button type="submit" className="w-full mt-2" size="default" disabled={loading}>
              {loading
                ? 'Processing...'
                : isSignUp
                ? 'Create Account'
                : 'Sign In'}
            </Button>
          </form>

          <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-center text-[11px] font-mono text-zinc-500 gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Secured by Supabase Auth</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#09090b] flex justify-center items-center"><div className="text-zinc-400 font-mono text-sm">Loading...</div></div>}>
      <LoginForm />
    </Suspense>
  );
}

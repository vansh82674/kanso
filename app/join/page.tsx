'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';
import { Button } from '../../src/components/ui/Button';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';

function JoinContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const supabase = createClient();

  const [invite, setInvite] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing invitation token.');
      setLoading(false);
      return;
    }

    const checkAuthAndFetchInvite = async () => {
      // Check auth
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Redirect to login if not authenticated
        router.push(`/login?redirect=/join?token=${token}`);
        return;
      }
      
      setIsAuthenticated(true);

      // Fetch invite
      try {
        const res = await fetch(`/api/invites/${token}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch invite');
        setInvite(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetchInvite();
  }, [token, router, supabase]);

  const handleAccept = async () => {
    setProcessing(true);
    try {
      const res = await fetch(`/api/invites/${token}/accept`, {
        method: 'POST'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to accept invite');
      
      toast.success('Successfully joined the workspace!');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.message);
      setProcessing(false);
    }
  };

  const handleDecline = async () => {
    setProcessing(true);
    try {
      const res = await fetch(`/api/invites/${token}/decline`, {
        method: 'POST'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to decline invite');
      
      toast.success('Invitation declined.');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.message);
      setProcessing(false);
    }
  };

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#09090b] flex justify-center items-center">
        <div className="text-zinc-400 font-mono text-sm animate-pulse">Loading invitation...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col justify-center items-center space-y-4 p-4 text-center">
        <div className="text-rose-400 font-mono text-sm max-w-md p-4 bg-rose-950/20 rounded-md border border-rose-900/50">
          {error}
        </div>
        <Button variant="outline" onClick={() => router.push('/dashboard')}>
          Go to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col justify-center items-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full rounded-xl border border-zinc-800 bg-zinc-900/90 p-8 shadow-2xl space-y-6 text-center"
      >
        <div className="mx-auto w-12 h-12 rounded-lg border border-zinc-700 bg-zinc-800 flex items-center justify-center mb-4" style={{ backgroundColor: invite?.workspace?.color || '#3f3f46' }}>
          <span className="text-xl font-bold text-white">
            {invite?.workspace?.name?.charAt(0).toUpperCase()}
          </span>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-zinc-100">
            You've been invited!
          </h2>
          <p className="text-sm text-zinc-400 mt-2">
            You have been invited to join the <span className="text-zinc-200 font-medium">{invite?.workspace?.name}</span> workspace as a <span className="capitalize font-medium">{invite?.role.toLowerCase()}</span>.
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            Invitation for: {invite?.email}
          </p>
        </div>

        <div className="flex flex-col gap-3 pt-4">
          <Button onClick={handleAccept} disabled={processing} className="w-full">
            {processing ? 'Processing...' : 'Accept Invitation'}
          </Button>
          <Button onClick={handleDecline} disabled={processing} variant="outline" className="w-full text-zinc-400 hover:text-rose-400 hover:border-rose-900/50 hover:bg-rose-950/20">
            Decline
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#09090b] flex justify-center items-center"><div className="text-zinc-400 font-mono text-sm">Loading...</div></div>}>
      <JoinContent />
    </Suspense>
  );
}

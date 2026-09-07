import { createClient } from './supabase/server';
import { prisma } from './prisma';

export async function requireAuth() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error('Unauthorized');
  }

  // Ensure the user exists in our Prisma database
  let dbUser = await prisma.user.findUnique({
    where: { email: user.email },
  });

  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        id: user.id, // Keep IDs in sync if possible
        email: user.email!,
        name: user.email!.split('@')[0], // Fallback name
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.email!)}`,
      },
    });
  }

  return { supabaseUser: user, dbUser };
}

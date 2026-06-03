import LoginForm from '@/components/LoginForm';
import { getSessionUser } from '@/lib/auth-helpers';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to access the client, domain, server, and renewal management dashboard.',
};

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) {
    redirect('/dashboard');
  }

  return <LoginForm />;
}

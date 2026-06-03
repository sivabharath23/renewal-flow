import LoginForm from '@/components/LoginForm';
import { getSessionUser } from '@/lib/auth-helpers';
import { redirect } from 'next/navigation';

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) {
    redirect('/dashboard');
  }

  return <LoginForm />;
}

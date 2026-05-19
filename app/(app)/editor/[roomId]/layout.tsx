import { redirect } from 'next/navigation';
import { ReactNode } from 'react';

import { AccessDenied } from '@/components/editor/access-denied';
import { checkProjectAccess, getCurrentIdentity } from '@/lib/project-access';

type EditorLayoutProps = {
  children: ReactNode;
  params: Promise<{ roomId: string }>;
};

export default async function EditorLayout({
  children,
  params,
}: EditorLayoutProps) {
  const { roomId } = await params;
  const identity = await getCurrentIdentity();

  if (!identity) {
    redirect('/sign-in');
  }

  const project = await checkProjectAccess(roomId);

  if (!project) {
    return <AccessDenied />;
  }

  return <>{children}</>;
}

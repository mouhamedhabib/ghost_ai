import { Lock } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

export function AccessDenied() {
  return (
    <div className="flex h-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="rounded-full bg-muted p-4">
          <Lock className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-semibold">Access Denied</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            You do not have permission to access this project.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/editor">Back to Projects</Link>
        </Button>
      </div>
    </div>
  );
}

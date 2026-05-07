import type { ReactNode } from "react";

import { EditorShell } from "@/components/editor/editor-shell";

export default function AppLayout({ children }: { children: ReactNode }) {
  return <EditorShell>{children}</EditorShell>;
}

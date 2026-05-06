import type { ReactNode } from "react";
import { Boxes, FileText, Network } from "lucide-react";

type AuthPageProps = {
  children: ReactNode;
};

const features = [
  {
    icon: Network,
    title: "AI Architecture Generation",
    description: "Describe your system, AI maps it to nodes and edges on a live canvas.",
  },
  {
    icon: Boxes,
    title: "Real-time Collaboration",
    description: "Live cursors, presence indicators, and shared node editing across your team.",
  },
  {
    icon: FileText,
    title: "Instant Spec Generation",
    description: "Export a complete Markdown technical spec directly from the canvas graph.",
  },
];

export function AuthPage({ children }: AuthPageProps) {
  return (
    <main className="grid min-h-dvh bg-background text-foreground lg:grid-cols-2">
      <section className="relative hidden overflow-hidden border-r border-border bg-auth-panel px-10 py-8 lg:flex lg:flex-col xl:px-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--brand-accent)_1px,transparent_1px)] bg-[length:28px_28px] opacity-10" />

        <div className="relative flex items-center gap-3 text-sm font-semibold tracking-normal text-foreground">
          <span className="flex size-6 items-center justify-center rounded-md bg-brand-accent text-xs font-bold text-primary-foreground">
            G
          </span>
          <span>Ghost AI</span>
        </div>

        <div className="relative flex flex-1 items-center">
          <div className="w-full max-w-[37rem] space-y-11">
            <div className="space-y-5">
              <h1 className="max-w-[31rem] text-4xl font-semibold leading-tight tracking-normal text-foreground xl:text-5xl">
                Design systems at the speed of thought.
              </h1>
              <p className="max-w-[33rem] text-base leading-7 text-muted-foreground">
                Describe your architecture in plain English. Ghost AI maps it to a
                shared canvas your whole team can refine in real time.
              </p>
            </div>

            <ul className="space-y-7">
              {features.map(({ icon: Icon, title, description }) => (
                <li key={title} className="flex gap-4">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-auth-icon text-brand-accent">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <span className="space-y-1.5">
                    <span className="block text-sm font-semibold text-foreground">
                      {title}
                    </span>
                    <span className="block max-w-[32rem] text-sm leading-5 text-muted-foreground">
                      {description}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="flex min-h-dvh items-center justify-center border-border bg-background px-4 py-8 sm:px-6 lg:border-l">
        <div className="w-full max-w-[26rem]">
          <div className="mb-8 flex items-center justify-center gap-3 text-sm font-semibold tracking-normal text-foreground lg:hidden">
            <span className="flex size-6 items-center justify-center rounded-md bg-brand-accent text-xs font-bold text-primary-foreground">
              G
            </span>
            <span>Ghost AI</span>
          </div>
          {children}
        </div>
      </section>
    </main>
  );
}

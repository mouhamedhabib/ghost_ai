import { dark } from "@clerk/ui/themes";

export const clerkAppearance = {
  theme: dark,
  variables: {
    colorPrimary: "var(--primary)",
    colorBackground: "var(--background)",
    colorText: "var(--foreground)",
    colorTextSecondary: "var(--muted-foreground)",
    colorInputBackground: "var(--background)",
    colorInputText: "var(--foreground)",
    colorDanger: "var(--destructive)",
    colorNeutral: "var(--muted)",
    colorRing: "var(--ring)",
    borderRadius: "var(--radius)",
    fontFamily: "var(--font-sans)",
  },
  elements: {
    rootBox: "w-full",
    cardBox: "w-full shadow-none",
    card:
      "w-full border border-border bg-background text-card-foreground shadow-none",
    headerTitle: "text-foreground",
    footerActionLink: "text-primary hover:text-primary",
    formButtonPrimary:
      "bg-brand-accent text-primary-foreground hover:bg-brand-accent/90 shadow-none",
    formFieldInput:
      "border-input bg-card text-foreground shadow-none focus-visible:ring-ring",
    headerSubtitle: "text-muted-foreground",
    socialButtonsBlockButton:
      "border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground shadow-none",
  },
} as const;

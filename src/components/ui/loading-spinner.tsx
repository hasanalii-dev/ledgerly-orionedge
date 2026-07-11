import { Loader2 } from "lucide-react";

export function LoadingSpinner() {
  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-muted-foreground animate-in fade-in duration-500">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium">Loading workspace...</p>
      </div>
    </div>
  );
}

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
      {children}
    </div>
  );
}

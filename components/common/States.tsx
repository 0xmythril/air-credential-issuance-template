"use client";

import { cn } from "@/lib/utils";

export function LoadingState({
  title = "Loading...",
  description,
  className,
}: {
  title?: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("w-full max-w-[420px] text-center space-y-3", className)}>
      <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
      <div className="text-sm text-muted-foreground">{title}</div>
      {description && (
        <div className="text-xs text-muted-foreground">{description}</div>
      )}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description,
  action,
  className,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("w-full max-w-[480px] text-center space-y-3", className)}>
      <div className="text-sm text-destructive">{title}</div>
      {description && (
        <div className="text-xs text-muted-foreground">{description}</div>
      )}
      {action}
    </div>
  );
}

export function EmptyState({
  title = "No results",
  description,
  action,
  className,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("w-full text-center space-y-2", className)}>
      <div className="text-sm text-muted-foreground">{title}</div>
      {description && (
        <div className="text-xs text-muted-foreground">{description}</div>
      )}
      {action}
    </div>
  );
}



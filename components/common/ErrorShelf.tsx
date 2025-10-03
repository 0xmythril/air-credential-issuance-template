"use client";

import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NormalizedError, buildReportMailtoUrl } from "@/lib/utils/error-utils";
import { Copy, RefreshCw, AlertCircle, ExternalLink } from "lucide-react";

interface ErrorShelfProps {
  error: NormalizedError | null;
  onRetry?: () => Promise<void> | void;
  onClear?: () => void;
  className?: string;
  supportEmail?: string;
  title?: string;
}

export function ErrorShelf({
  error,
  onRetry,
  onClear,
  className,
  supportEmail,
  title = "Something went wrong",
}: ErrorShelfProps) {
  const [copied, setCopied] = useState(false);
  if (!error) return null;

  const details = JSON.stringify(
    {
      message: error.message,
      code: error.code,
      status: error.status,
      type: error.type,
      retryable: error.retryable,
      correlationId: error.correlationId,
      context: error.context,
    },
    null,
    2
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(details);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const reportUrl = buildReportMailtoUrl({
    to: supportEmail,
    error,
  });

  return (
    <Alert variant="destructive" className={cn("max-w-[480px]", className)}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        <div className="space-y-3">
          <div className="text-sm">{error.message}</div>
          <div className="rounded-md bg-muted p-3 text-xs font-mono break-words whitespace-pre-wrap max-h-40 overflow-auto">
            {details}
          </div>
          <div className="flex items-center gap-2">
            {onRetry && (
              <Button size="sm" variant="outline" onClick={() => onRetry()}>
                <RefreshCw className="h-4 w-4" />
                Retry
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={handleCopy}>
              <Copy className="h-4 w-4" />
              {copied ? "Copied" : "Copy details"}
            </Button>
            <a href={reportUrl} target="_blank" rel="noreferrer">
              <Button size="sm" variant="ghost">
                <ExternalLink className="h-4 w-4" />
                Report issue
              </Button>
            </a>
            {onClear && (
              <Button size="sm" variant="ghost" onClick={onClear}>
                Dismiss
              </Button>
            )}
          </div>
          <div className="text-[10px] text-muted-foreground">
            Correlation ID: {error.correlationId}
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}





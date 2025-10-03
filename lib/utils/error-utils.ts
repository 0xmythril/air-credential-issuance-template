"use client";

export type NormalizedErrorType =
  | "network"
  | "auth"
  | "validation"
  | "rate_limit"
  | "timeout"
  | "unknown";

export interface NormalizedError {
  code?: string;
  type: NormalizedErrorType;
  message: string;
  retryable: boolean;
  correlationId: string;
  status?: number;
  raw?: unknown;
  context?: Record<string, unknown>;
}

export function createCorrelationId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  return `${ts}-${rand}`;
}

function inferTypeFromMessage(message: string): NormalizedErrorType {
  const m = message.toLowerCase();
  if (m.includes("timeout")) return "timeout";
  if (m.includes("network") || m.includes("fetch") || m.includes("failed to fetch")) return "network";
  if (m.includes("unauthorized") || m.includes("forbidden") || m.includes("expired") || m.includes("invalid token")) return "auth";
  if (m.includes("rate limit") || m.includes("too many requests")) return "rate_limit";
  if (m.includes("invalid") || m.includes("missing") || m.includes("required")) return "validation";
  return "unknown";
}

function inferRetryable(status?: number, type?: NormalizedErrorType): boolean {
  if (type === "validation" || type === "auth") return false;
  if (!status) return type !== "unknown"; // default retry for non-unknown without status
  if (status >= 500) return true;
  if (status === 408 || status === 425 || status === 429) return true;
  return false;
}

export function normalizeError(
  error: unknown,
  opts?: { correlationId?: string; context?: Record<string, unknown> }
): NormalizedError {
  let message = "An unexpected error occurred";
  let code: string | undefined;
  let status: number | undefined;
  let type: NormalizedErrorType = "unknown";

  if (error instanceof Error) {
    message = error.message || message;
  }
  // Handle Fetch Response-like objects or custom errors
  const anyErr = error as any;
  if (anyErr) {
    if (typeof anyErr.status === "number") status = anyErr.status;
    if (typeof anyErr.code === "string") code = anyErr.code;
    if (typeof anyErr.name === "string" && !code) code = anyErr.name;
    if (typeof anyErr.message === "string") message = anyErr.message;
  }

  type = inferTypeFromMessage(message);
  const retryable = inferRetryable(status, type);

  return {
    code,
    type,
    message,
    retryable,
    status,
    correlationId: opts?.correlationId || createCorrelationId(),
    raw: error,
    context: opts?.context,
  };
}

export function buildReportMailtoUrl(params: {
  to?: string;
  subject?: string;
  error: NormalizedError;
}): string {
  const to = params.to || "support@example.com";
  const subject = params.subject || "AIR Credential Issuance - Error Report";
  const body = [
    `Message: ${params.error.message}`,
    params.error.code ? `Code: ${params.error.code}` : undefined,
    params.error.status ? `HTTP Status: ${params.error.status}` : undefined,
    `Type: ${params.error.type}`,
    `Retryable: ${params.error.retryable}`,
    `Correlation ID: ${params.error.correlationId}`,
    params.error.context ? `Context: ${JSON.stringify(params.error.context, null, 2)}` : undefined,
  ]
    .filter(Boolean)
    .join("\n");

  return `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}





"use client";

import { useEffect, useState, useRef } from "react";
import { getAccessToken } from "@/lib/auth";
import { fetchJob } from "@/lib/api";

function getWsUrl(): string {
  if (process.env.NEXT_PUBLIC_WS_URL) {
    return process.env.NEXT_PUBLIC_WS_URL;
  }
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL;
  if (backend) {
    return backend.replace(/^https:/, "wss:").replace(/^http:/, "ws:");
  }
  if (typeof window !== "undefined") {
    const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${proto}//${window.location.host}`;
  }
  return "ws://localhost:4000";
}

export type JobStatus = "pending" | "processing" | "completed" | "failed";

interface JobStatusState {
  status: JobStatus;
  outputResult: { text: string } | null;
  errorMessage: string | null;
}

interface JobUpdateMessage {
  jobId: string;
  status: JobStatus;
  outputResult?: { text: string };
  errorMessage?: string;
}

/**
 * Listens for job updates via WebSocket and falls back to HTTP polling
 * if WebSocket is unavailable or disconnects.
 */
export function useJobStatus(jobId: string | null): JobStatusState {
  // Job is now imported but the import warning was already there — we use the type from fetchJob
  const [state, setState] = useState<JobStatusState>({
    status: "pending",
    outputResult: null,
    errorMessage: null,
  });

  // Mirror status in a ref so closures can read latest value without dep-array issues
  const statusRef = useRef<JobStatus>("pending");

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!jobId) return;

    let isSubscribed = true;
    let ws: WebSocket | null = null;

    // Start fallback HTTP polling helper
    const startPolling = () => {
      if (pollIntervalRef.current) return;
      pollIntervalRef.current = setInterval(async () => {
        if (!isSubscribed) return;
        try {
          const job = await fetchJob(jobId);
          if (job) {
            setState({
              status: (job.status as JobStatus) || "processing",
              outputResult:
                typeof job.outputResult === "string"
                  ? { text: job.outputResult }
                  : (job.outputResult as { text: string } | null) ?? null,
              errorMessage: job.errorMessage ?? null,
            });

            if (job.status === "completed" || job.status === "failed") {
              if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
                pollIntervalRef.current = null;
              }
            }
          }
        } catch {
          // ignore transient poll errors
        }
      }, 2500);
    };

    try {
      const token = getAccessToken();
      const wsBase = getWsUrl();
      const url = token ? `${wsBase}?token=${token}` : wsBase;

      ws = new WebSocket(url);

      ws.onopen = () => {
        ws?.send(JSON.stringify({ type: "subscribe", jobId }));
      };

      ws.onmessage = (event: MessageEvent) => {
        try {
          const data: JobUpdateMessage = JSON.parse(event.data as string);
          if (data.jobId !== jobId) return;

          statusRef.current = data.status;
          setState({
            status: data.status,
            outputResult: data.outputResult ?? null,
            errorMessage: data.errorMessage ?? null,
          });

          if (data.status === "completed" || data.status === "failed") {
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }
          }
        } catch {
          // Ignore parse errors
        }
      };

      ws.onerror = () => {
        // Fall back to polling instead of immediately hard failing
        startPolling();
      };

      ws.onclose = () => {
        // Use a ref to read the latest status without adding it as a dep
        if (statusRef.current !== "completed" && statusRef.current !== "failed") {
          startPolling();
        }
      };
    } catch {
      startPolling();
    }

    return () => {
      isSubscribed = false;
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      if (ws) {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        } else if (ws.readyState === WebSocket.CONNECTING) {
          ws.onopen = () => ws?.close();
        }
      }
    };
  }, [jobId]);

  return state;
}

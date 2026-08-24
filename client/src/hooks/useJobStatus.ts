import { useEffect, useState } from "react";
import { getAccessToken } from "@/lib/auth";

const WS_BASE = "ws://localhost:4000";

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
 * Opens a WebSocket connection to the Express server and listens for updates
 * that match the given jobId.  The socket is closed when the component unmounts
 * or when the job reaches a terminal state (completed / failed).
 */
export function useJobStatus(jobId: string | null): JobStatusState {
  const [state, setState] = useState<JobStatusState>({
    status: "pending",
    outputResult: null,
    errorMessage: null,
  });

  useEffect(() => {
    // Don't open a socket until we have a real jobId
    if (!jobId) return;

    const token = getAccessToken();
    const url = token ? `${WS_BASE}?token=${token}` : WS_BASE;

    const ws = new WebSocket(url);

    ws.onopen = () => {
      // Optionally subscribe to a specific job channel if the server supports it
      ws.send(JSON.stringify({ type: "subscribe", jobId }));
    };

    ws.onmessage = (event: MessageEvent) => {
      try {
        const data: JobUpdateMessage = JSON.parse(event.data as string);

        // Only act on messages for the job we care about
        if (data.jobId !== jobId) return;

        setState({
          status: data.status,
          outputResult: data.outputResult ?? null,
          errorMessage: data.errorMessage ?? null,
        });
      } catch {
        // Ignore malformed messages
      }
    };

    ws.onerror = () => {
      setState((prev) => ({
        ...prev,
        status: "failed",
        errorMessage: "WebSocket connection error.",
      }));
    };

    // Cleanup: close the socket when the component unmounts or jobId changes
    return () => {
      if (ws.readyState === 1) { // OPEN
        ws.close();
      } else if (ws.readyState === 0) { // CONNECTING
        ws.onopen = () => ws.close();
      }
    };
  }, [jobId]);

  return state;
}

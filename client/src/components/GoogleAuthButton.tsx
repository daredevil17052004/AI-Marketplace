"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface GoogleAuthButtonProps {
  mode?: "signin" | "signup";
  onError?: (err: string) => void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
          }) => void;
          prompt: () => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              theme?: "outline" | "filled_blue" | "filled_black";
              size?: "large" | "medium" | "small";
              text?: "signin_with" | "signup_with" | "continue_with" | "signin";
              shape?: "rectangular" | "pill" | "circle" | "square";
              width?: number | string;
            }
          ) => void;
        };
      };
    };
  }
}

export default function GoogleAuthButton({ mode = "signin", onError }: GoogleAuthButtonProps) {
  const router = useRouter();
  const { googleLogin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(() =>
    typeof window !== "undefined" && !!window.google?.accounts?.id
  );
  const buttonRef = useRef<HTMLDivElement>(null);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const isConfigured = Boolean(clientId && clientId !== "your_google_client_id_here");

  const handleCredentialResponse = useCallback(async (response: { credential: string }) => {
    if (!response.credential) {
      onError?.("No credentials received from Google.");
      return;
    }

    setLoading(true);
    try {
      await googleLogin(response.credential);
      router.push("/dashboard");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Google authentication failed";
      onError?.(msg);
    } finally {
      setLoading(false);
    }
  }, [googleLogin, onError, router]);

  useEffect(() => {
    // If not configured, don't attempt to load GIS
    if (!isConfigured) return;

    if (window.google?.accounts?.id) {
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => onError?.("Failed to load Google Identity Services.");
    document.body.appendChild(script);

    return () => {
      // cleanup script if unmounted before load
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [isConfigured, onError]);

  useEffect(() => {
    if (!scriptLoaded || !isConfigured || !window.google?.accounts?.id) return;

    try {
      window.google.accounts.id.initialize({
        client_id: clientId as string,
        callback: handleCredentialResponse,
      });

      if (buttonRef.current) {
        buttonRef.current.innerHTML = "";
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: "outline",
          size: "large",
          text: mode === "signup" ? "signup_with" : "signin_with",
          shape: "pill",
          width: 380,
        });
      }
    } catch (e) {
      console.error("Error initializing Google Identity:", e);
    }
  }, [scriptLoaded, isConfigured, clientId, handleCredentialResponse, mode]);

  const handleManualClick = () => {
    if (!isConfigured) {
      onError?.(
        "Google OAuth is not configured. Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID in client/.env.local and GOOGLE_CLIENT_ID in server/.env."
      );
      return;
    }

    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      onError?.("Google Sign-In SDK is still loading. Please try again in a moment.");
    }
  };

  return (
    <div className="w-full">
      {/* If Google GIS rendered its official iframe, display it */}
      {isConfigured && (
        <div
          ref={buttonRef}
          className="flex justify-center [&>div]:w-full [&_iframe]:w-full min-h-[44px]"
        />
      )}

      {/* Fallback button when not configured or while loading */}
      {(!isConfigured || !scriptLoaded) && (
        <button
          type="button"
          onClick={handleManualClick}
          disabled={loading}
          className="w-full py-3 px-4 rounded-full bg-white hover:bg-[#FAF5EE] text-[#201515] text-sm font-bold transition-all cursor-pointer border border-[#D5CBC0] flex items-center justify-center gap-3 shadow-xs hover:border-[#BFB3A6] disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-[#FF4F00]" />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                fill="#EA4335"
              />
            </svg>
          )}
          <span>
            {mode === "signup" ? "Sign up with Google" : "Continue with Google"}
          </span>
        </button>
      )}
    </div>
  );
}

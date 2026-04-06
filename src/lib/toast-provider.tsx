"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  CheckCircle2,
  AlertCircle,
  Info,
  Loader2,
} from "lucide-react";
import { useToaster, toast as hotToast } from "react-hot-toast";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
type ToastType = "success" | "error" | "info" | "loading";

/* ------------------------------------------------------------------ */
/*  Icon / colour maps  (dark-mode oklch-based)                        */
/* ------------------------------------------------------------------ */
const iconMap: Record<ToastType, React.ElementType> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  loading: Loader2,
};

const colorMap: Record<
  ToastType,
  { text: string; bg: string; border: string; glow: string }
> = {
  success: {
    text: "oklch(0.72 0.19 155)",
    bg: "oklch(0.72 0.19 155 / 8%)",
    border: "oklch(0.72 0.19 155 / 18%)",
    glow: "oklch(0.72 0.19 155 / 6%)",
  },
  error: {
    text: "oklch(0.70 0.19 22)",
    bg: "oklch(0.70 0.19 22 / 8%)",
    border: "oklch(0.70 0.19 22 / 18%)",
    glow: "oklch(0.70 0.19 22 / 6%)",
  },
  info: {
    text: "oklch(0.71 0 0)",
    bg: "oklch(0.71 0 0 / 8%)",
    border: "oklch(0.71 0 0 / 18%)",
    glow: "oklch(0.71 0 0 / 4%)",
  },
  loading: {
    text: "oklch(0.70 0.15 250)",
    bg: "oklch(0.70 0.15 250 / 8%)",
    border: "oklch(0.70 0.15 250 / 18%)",
    glow: "oklch(0.70 0.15 250 / 6%)",
  },
};

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const MAX_VISIBLE = 3;
const AUTO_DISMISS_MS = 4000;

/* ------------------------------------------------------------------ */
/*  Helper – map react-hot-toast type to our ToastType                 */
/* ------------------------------------------------------------------ */
function mapHotType(type: string): ToastType {
  if (type === "success") return "success";
  if (type === "error") return "error";
  if (type === "loading") return "loading";
  return "info";
}

/* ------------------------------------------------------------------ */
/*  ToastProvider – headless react-hot-toast + framer-motion stacking  */
/* ------------------------------------------------------------------ */
export function ToastProvider() {
  const { toasts, handlers } = useToaster();
  const { startPause, endPause } = handlers;
  const [isHovered, setIsHovered] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  /* Track created-at timestamps so the progress bar starts correctly */
  const timestampsRef = useRef<Map<string, number>>(new Map());

  /* Only take non-dismissed toasts */
  const activeToasts = useMemo(
    () => toasts.filter((t) => t.visible || t.createdAt + 200 > now),
    [toasts, now],
  );

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 100);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const timestamp = Date.now();

    for (const t of activeToasts) {
      if (!timestampsRef.current.has(t.id)) {
        timestampsRef.current.set(t.id, timestamp);
      }
    }

    const activeIds = new Set(activeToasts.map((t) => t.id));
    for (const id of timestampsRef.current.keys()) {
      if (!activeIds.has(id)) timestampsRef.current.delete(id);
    }
  }, [activeToasts]);

  const visibleToasts = activeToasts.slice(-MAX_VISIBLE);
  const hiddenCount = Math.max(0, activeToasts.length - MAX_VISIBLE);

  /* --- remove handler --- */
  const removeToast = useCallback((id: string) => {
    hotToast.dismiss(id);
  }, []);

  /* --- clear all handler --- */
  const clearAll = useCallback(() => {
    hotToast.dismiss();
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    startPause();
  }, [startPause]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    endPause();
  }, [endPause]);

  if (activeToasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)]"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* ---- Hidden count + Clear all ---- */}
      <AnimatePresence>
        {(hiddenCount > 0 || activeToasts.length > 1) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mb-2 flex items-center justify-between px-1"
          >
            <span className="text-xs font-medium text-muted-foreground">
              {hiddenCount > 0
                ? `+${hiddenCount} more notification${hiddenCount > 1 ? "s" : ""}`
                : `${activeToasts.length} notification${activeToasts.length > 1 ? "s" : ""}`}
            </span>
            <button
              onClick={clearAll}
              className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Clear all
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---- Stacked toasts ---- */}
      <div className="relative">
        <AnimatePresence mode="popLayout" initial={false}>
          {visibleToasts.map((toastItem, index) => {
            const toastType = mapHotType(toastItem.type);
            const Icon = iconMap[toastType];
            const colors = colorMap[toastType];
            const reverseIndex = visibleToasts.length - 1 - index;
            const isTop = reverseIndex === 0;
            const isLoading = toastItem.type === "loading";

            /* Resolve the message */
            const message =
              typeof toastItem.message === "string"
                ? toastItem.message
                : typeof toastItem.message === "function"
                  ? (() => {
                      const result = toastItem.message(toastItem);
                      return typeof result === "string" ? result : "Notification";
                    })()
                  : "Notification";

            return (
              <motion.div
                key={toastItem.id}
                layout
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{
                  opacity: isHovered
                    ? 1
                    : isTop
                      ? 1
                      : Math.max(0.5, 1 - reverseIndex * 0.25),
                  y: isHovered ? 0 : -reverseIndex * 8,
                  scale: isHovered
                    ? 1
                    : Math.max(0.94, 1 - reverseIndex * 0.03),
                  transition: {
                    type: "spring",
                    stiffness: 500,
                    damping: 35,
                  },
                }}
                exit={{
                  opacity: 0,
                  scale: 0.9,
                  x: 60,
                  transition: { duration: 0.2, ease: "easeIn" },
                }}
                style={{
                  zIndex: index,
                  position:
                    index === visibleToasts.length - 1
                      ? "relative"
                      : "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                }}
                className="group"
              >
                <div
                  className="relative overflow-hidden rounded-xl border"
                  style={{
                    background: "var(--card)",
                    borderColor: colors.border,
                    boxShadow: `0 4px 24px -4px oklch(0 0 0 / 18%), 0 0 0 1px ${colors.glow}`,
                  }}
                >
                  {/* Accent bar */}
                  <div
                    className="absolute bottom-0 left-0 top-0 w-[3px]"
                    style={{ background: colors.text }}
                  />

                  {/* Progress bar (non-loading) */}
                  {!isLoading && (
                    <motion.div
                      className="absolute bottom-0 left-0 h-[2px]"
                      style={{
                        background: colors.text,
                        opacity: 0.2,
                      }}
                      initial={{ width: "100%" }}
                      animate={{ width: "0%" }}
                      transition={{
                        duration: AUTO_DISMISS_MS / 1000,
                        ease: "linear",
                      }}
                    />
                  )}

                  {/* Loading bar (animated back-and-forth) */}
                  {isLoading && (
                    <motion.div
                      className="absolute bottom-0 left-0 h-[2px]"
                      style={{
                        background: colors.text,
                        opacity: 0.3,
                        width: "30%",
                      }}
                      animate={{
                        left: ["0%", "70%", "0%"],
                      }}
                      transition={{
                        duration: 1.5,
                        ease: "easeInOut",
                        repeat: Infinity,
                      }}
                    />
                  )}

                  <div className="flex items-start gap-3 py-3.5 pl-5 pr-4">
                    <div
                      className="mt-0.5 shrink-0"
                      style={{ color: colors.text }}
                    >
                      <Icon
                        size={16}
                        strokeWidth={2.5}
                        className={isLoading ? "animate-spin" : ""}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold leading-tight tracking-[-0.01em] text-card-foreground">
                        {message}
                      </p>
                    </div>

                    <button
                      onClick={() => removeToast(toastItem.id)}
                      className="-mr-1 -mt-0.5 shrink-0 rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-foreground group-hover:opacity-100"
                      aria-label="Close notification"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

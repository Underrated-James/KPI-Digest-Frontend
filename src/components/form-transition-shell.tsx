"use client";

import type { ReactNode } from "react";
import { motion, type Transition } from "framer-motion";

interface FormTransitionShellProps {
  children: ReactNode;
  maxWidthClassName?: string;
  className?: string;
}

export function FormTransitionShell({
  children,
  maxWidthClassName = "max-w-7xl",
  className = "",
}: FormTransitionShellProps) {
  const transition: Transition = {
    duration: 0.3,
    ease: [0.22, 1, 0.36, 1],
  };

  return (
    <div className="flex flex-1 items-center justify-center overflow-y-auto pb-6">
      <motion.div
        className={`w-full ${maxWidthClassName} ${className}`.trim()}
        initial={{ opacity: 0, scale: 0.965 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.99 }}
        transition={transition}
        style={{ willChange: "transform, opacity" }}
      >
        {children}
      </motion.div>
    </div>
  );
}

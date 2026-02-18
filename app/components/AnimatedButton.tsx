"use client";

import React from "react";
import styles from "./AnimatedButton.module.css";

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  size?: "small" | "medium" | "large";
  fullWidth?: boolean;
}

export function AnimatedButton({
  children,
  variant = "primary",
  size = "medium",
  fullWidth = false,
  className = "",
  ...props
}: AnimatedButtonProps) {
  const classNames = [
    styles.animatedButton,
    size === "small" && styles.small,
    size === "large" && styles.large,
    variant === "secondary" && styles.secondary,
    fullWidth && styles.fullWidth,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classNames} {...props}>
      {children}
    </button>
  );
}

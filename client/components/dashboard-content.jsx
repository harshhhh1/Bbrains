"use client";

import React from "react";

export function DashboardContent({
  children,
  className = "",
  maxWidth = "max-w-7xl",
}) {
  return (
    <div
      className={`${maxWidth} mx-auto w-full p-4 md:p-6 pb-24 md:pb-8 ${className}`}
    >
      {children}
    </div>
  );
}

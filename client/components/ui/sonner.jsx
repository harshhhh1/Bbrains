"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";
import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
} from "lucide-react";
import { useState, useEffect } from "react";

const ToasterComponent = ({ ...props }) => {
  const { theme = "system" } = useTheme();
  const [position, setPosition] = useState("bottom-right");

  useEffect(() => {
    const updatePosition = () => {
      setPosition(window.innerWidth < 640 ? "top-center" : "bottom-right");
    };
    updatePosition();
    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
  }, []);

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={{
        "--normal-bg": "var(--popover)",
        "--normal-text": "var(--popover-foreground)",
        "--normal-border": "var(--border)",
        "--border-radius": "var(--radius)",
      }}
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      position={position}
      {...props}
    />
  );
};

export { ToasterComponent as Toaster };

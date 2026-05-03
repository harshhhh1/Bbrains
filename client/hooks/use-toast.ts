"use client"

import { toast as sonnerToast } from "sonner"

type ToastProps = {
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

function toast(props: ToastProps | string) {
  if (typeof props === "string") {
    return sonnerToast(props)
  }

  const message = props.description || props.title || ""
  if (props.variant === "destructive") {
    return sonnerToast.error(message)
  }
  return sonnerToast.success(message)
}

export function useToast() {
  return {
    toast
  }
}

export { toast }

"use client"

import * as React from "react"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

type EditorDialogContentProps = React.ComponentProps<typeof DialogContent>

function EditorDialogContent({
  className,
  ...props
}: EditorDialogContentProps) {
  return (
    <DialogContent
      className={cn(
        "border border-border bg-popover text-popover-foreground shadow-2xl shadow-background/50 ring-0 sm:max-w-md",
        className
      )}
      {...props}
    />
  )
}

function EditorDialogHeader({
  className,
  ...props
}: React.ComponentProps<typeof DialogHeader>) {
  return (
    <DialogHeader className={cn("gap-2 pr-8", className)} {...props} />
  )
}

function EditorDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogTitle>) {
  return (
    <DialogTitle
      className={cn("text-base font-medium text-foreground", className)}
      {...props}
    />
  )
}

function EditorDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogDescription>) {
  return (
    <DialogDescription
      className={cn("text-sm leading-6 text-muted-foreground", className)}
      {...props}
    />
  )
}

function EditorDialogFooter({
  className,
  ...props
}: React.ComponentProps<typeof DialogFooter>) {
  return (
    <DialogFooter
      className={cn(
        "border-border bg-muted/30 sm:flex-row sm:items-center sm:justify-end",
        className
      )}
      {...props}
    />
  )
}

export {
  Dialog as EditorDialog,
  DialogClose as EditorDialogClose,
  EditorDialogContent,
  EditorDialogDescription,
  EditorDialogFooter,
  EditorDialogHeader,
  EditorDialogTitle,
  DialogTrigger as EditorDialogTrigger,
}

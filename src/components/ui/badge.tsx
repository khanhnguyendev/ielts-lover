import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-lg border px-2.5 py-1 text-[10px] font-black uppercase tracking-widest w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1.5 transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground border-primary/10",
        secondary:
          "bg-slate-100 text-slate-900 border-slate-200/60",
        destructive:
          "bg-rose-500 text-white border-rose-600/10",
        outline:
          "border-slate-200 text-slate-600 dark:border-slate-800 dark:text-slate-400",
        ghost: "bg-transparent text-slate-600 border-transparent",
        link: "text-primary underline-offset-4 [a&]:hover:underline",
        success: "bg-emerald-50 text-emerald-700 border-emerald-200/50 font-black",
        warning: "bg-amber-50 text-amber-700 border-amber-200/50 font-black",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-bold transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-3.5 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-primary/20 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 border border-primary/10",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:bg-destructive/60 border border-destructive/10",
        outline:
          "border-2 border-slate-200 bg-transparent shadow-sm hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:hover:bg-slate-800",
        secondary:
          "bg-slate-100 text-slate-900 hover:bg-slate-200 shadow-sm border border-slate-200/50",
        ghost:
          "hover:bg-primary/5 hover:text-primary transition-colors",
        link: "text-primary underline-offset-4 hover:underline",
        cta: "bg-primary text-white font-black text-sm h-14 px-10 rounded-[1.25rem] shadow-xl shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all",
        soft: "bg-primary/10 text-primary hover:bg-primary/15 transition-colors border-none shadow-none",
        white: "bg-white text-primary hover:bg-slate-50 shadow-xl shadow-black/5 font-black border border-slate-100",
      },
      size: {
        default: "h-11 px-5 has-[>svg]:px-4",
        xs: "h-7 gap-1 rounded-lg px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 rounded-xl gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-13 rounded-2xl px-8 text-base has-[>svg]:px-6",
        xl: "h-16 rounded-[1.5rem] px-12 text-lg has-[>svg]:px-10",
        icon: "size-11 rounded-2xl",
        "icon-xs": "size-7 rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-9 rounded-xl",
        "icon-lg": "size-13 rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }

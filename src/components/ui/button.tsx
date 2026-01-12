import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"

const buttonVariants = cva(
    // Base styles with unified transitions and focus ring
    cn(
        "inline-flex items-center justify-center gap-2",
        "font-medium text-sm",
        "rounded-lg",
        "whitespace-nowrap",
        "cursor-pointer",
        "transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed"
    ),
    {
        variants: {
            variant: {
                // Primary - Trust Blue
                default: cn(
                    "bg-blue-600 text-white",
                    "hover:bg-blue-700",
                    "focus-visible:ring-blue-500"
                ),
                primary: cn(
                    "bg-blue-600 text-white",
                    "hover:bg-blue-700",
                    "focus-visible:ring-blue-500"
                ),
                // Secondary - White with border
                secondary: cn(
                    "bg-white text-gray-700",
                    "border border-gray-200",
                    "hover:bg-gray-50 hover:border-gray-300",
                    "focus-visible:ring-gray-400"
                ),
                // Outline - Similar to secondary
                outline: cn(
                    "bg-white text-gray-700",
                    "border border-gray-200",
                    "hover:bg-gray-50 hover:border-gray-300",
                    "focus-visible:ring-gray-400"
                ),
                // Ghost - Transparent background
                ghost: cn(
                    "text-gray-600",
                    "hover:bg-gray-100 hover:text-gray-900",
                    "focus-visible:ring-gray-400"
                ),
                // Danger - Red for destructive actions
                danger: cn(
                    "bg-red-600 text-white",
                    "hover:bg-red-700",
                    "focus-visible:ring-red-500"
                ),
                // Destructive - Alias for danger
                destructive: cn(
                    "bg-red-600 text-white",
                    "hover:bg-red-700",
                    "focus-visible:ring-red-500"
                ),
                // Link style
                link: "text-blue-600 underline-offset-4 hover:underline focus-visible:ring-blue-500",
            },
            size: {
                default: "h-10 px-4 text-sm",
                sm: "h-8 px-3 text-xs",
                md: "h-10 px-4 text-sm",
                lg: "h-12 px-6 text-base",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }

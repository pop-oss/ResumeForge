import * as React from "react"

import { cn } from "../../lib/utils"

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> { }

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    // Base styles - consistent height and rounded corners
                    "flex w-full h-10",
                    "px-3 py-2",
                    "bg-white",
                    "border border-gray-200 rounded-lg",
                    "text-sm text-gray-900",
                    "placeholder:text-gray-400",
                    // Transitions
                    "transition-all duration-200",
                    // Focus ring - ring-2 ring-blue-500
                    "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500",
                    // File input styles
                    "file:border-0 file:bg-transparent file:text-sm file:font-medium",
                    // Disabled state
                    "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50",
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Input.displayName = "Input"

export { Input }

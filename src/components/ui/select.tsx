import * as React from "react"
import { cn } from "../../lib/utils"
import { ChevronDown } from "lucide-react"

export interface SelectProps
    extends React.SelectHTMLAttributes<HTMLSelectElement> { }

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <div className="relative">
                <select
                    className={cn(
                        // Base styles - match Input component
                        "flex w-full h-10",
                        "px-3 py-2 pr-10",
                        "bg-white",
                        "border border-gray-200 rounded-lg",
                        "text-sm text-gray-900",
                        "appearance-none",
                        "cursor-pointer",
                        // Transitions
                        "transition-all duration-200",
                        // Focus ring - match Input
                        "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500",
                        // Disabled state
                        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50",
                        className
                    )}
                    ref={ref}
                    {...props}
                >
                    {children}
                </select>
                {/* Consistent arrow indicator */}
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
        )
    }
)
Select.displayName = "Select"

export { Select }

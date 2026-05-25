import { forwardRef } from 'react'

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  options?: Array<{ value: string; label: string }>
  label?: string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, children, label, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
            {label}
          </label>
        )}
        <select
          className={`w-full px-3 py-2 border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-900 text-surface-900 dark:text-surface-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent ${className}`}
          ref={ref}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
      </div>
    )
  },
)
Select.displayName = 'Select'

export { Select }

"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"

interface NumericInputProps extends Omit<React.ComponentProps<typeof Input>, "onChange" | "value"> {
    value: number
    onChange: (val: number) => void
    onCommit?: (val: number) => void
    isFloat?: boolean
}

export function NumericInput({
    value,
    onChange,
    onCommit,
    isFloat = false,
    ...props
}: NumericInputProps) {
    const [localValue, setLocalValue] = useState<string>(value.toString())

    // Sync local state with external value changes
    useEffect(() => {
        if (parseFloat(localValue) !== value) {
            setLocalValue(value.toString())
        }
    }, [value])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value
        setLocalValue(raw)

        const parsed = isFloat ? parseFloat(raw) : parseInt(raw)
        const safe = isNaN(parsed) ? 0 : parsed
        onChange(safe)
    }

    const handleBlur = () => {
        const parsed = isFloat ? parseFloat(localValue) : parseInt(localValue)
        const safe = isNaN(parsed) ? 0 : parsed

        // Clean up the input display (e.g., "05" -> "5", empty -> "0")
        setLocalValue(safe.toString())

        if (onCommit) {
            onCommit(safe)
        }
    }

    return (
        <Input
            {...props}
            type="number"
            value={localValue}
            onChange={handleChange}
            onBlur={handleBlur}
        />
    )
}

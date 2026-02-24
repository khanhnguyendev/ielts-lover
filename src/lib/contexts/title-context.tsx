"use client"

import * as React from "react"

interface TitleContextType {
    title: string | null
    setTitle: (title: string | null) => void
}

const TitleContext = React.createContext<TitleContextType | undefined>(undefined)

export function TitleProvider({ children }: { children: React.ReactNode }) {
    const [title, setTitle] = React.useState<string | null>(null)

    return (
        <TitleContext.Provider value={{ title, setTitle }}>
            {children}
        </TitleContext.Provider>
    )
}

export function useTitle(initialTitle?: string) {
    const context = React.useContext(TitleContext)
    if (!context) {
        throw new Error("useTitle must be used within a TitleProvider")
    }

    React.useEffect(() => {
        if (initialTitle) {
            context.setTitle(initialTitle)
        }
        return () => {
            if (initialTitle) {
                context.setTitle(null)
            }
        }
    }, [initialTitle, context])

    return context
}

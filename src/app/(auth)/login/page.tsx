"use client"

import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { signInWithGoogle } from "@/app/actions"
import { PulseLoader } from "@/components/global/pulse-loader"

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleGoogleSignIn = async () => {
        setIsLoading(true)
        try {
            await signInWithGoogle()
        } catch (error) {
            console.error(error)
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
                <h1 className="text-4xl font-black font-outfit text-slate-900 leading-tight">Welcome to IELTS Lover</h1>
                <p className="text-sm font-medium text-slate-500">
                    Don&apos;t have an account?{" "}
                    <Link href="/signup" className="text-primary font-medium hover:underline underline-offset-4">
                        Register for free
                    </Link>
                </p>
            </div>

            <div className="space-y-4">
                <Button
                    variant="outline"
                    className="w-full bg-white gap-3"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <PulseLoader size="sm" color="primary" className="flex-row gap-2" />
                    ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335" />
                        </svg>
                    )}
                    {isLoading ? "Redirecting..." : "Continue with Google"}
                </Button>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-4 text-slate-500 font-bold tracking-widest uppercase text-[10px]">Log in with email</span>
                    </div>
                </div>

                <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">E-mail</Label>
                        <Input
                            id="email"
                            placeholder="name@example.com"
                            type="email"
                            autoCapitalize="none"
                            autoComplete="email"
                            autoCorrect="off"
                            className="h-12 bg-muted/30 border-muted focus:bg-white transition-all rounded-lg"
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Password</Label>
                            <Link
                                href="/forgot-password"
                                className="text-xs font-semibold text-primary hover:underline underline-offset-4"
                            >
                                Forgot password?
                            </Link>
                        </div>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className="h-12 bg-muted/30 border-muted focus:bg-white transition-all pr-12 rounded-lg"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {showPassword ? (
                                    <EyeOff className="h-5 w-5" />
                                ) : (
                                    <Eye className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                    </div>
                    <Button type="submit" className="w-full">
                        Log in
                    </Button>
                </form>
            </div>

            <p className="text-center text-[10px] text-slate-500 font-medium leading-relaxed px-4 uppercase tracking-wider">
                By signing up, I agree to IELTS Lover&apos;s{" "}
                <Link href="/privacy" className="font-bold underline underline-offset-2">Privacy Policy</Link> and{" "}
                <Link href="/terms" className="font-bold underline underline-offset-2">Terms of Service</Link>
            </p>
        </div>
    )
}

"use client"

import Link from "next/link"
import { Eye, EyeOff, Check } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { signInWithGoogle } from "@/app/actions"
import { PulseLoader } from "@/components/global/pulse-loader"

export default function SignupPage() {
    const [showPassword, setShowPassword] = useState(false)
    const [showEmailForm, setShowEmailForm] = useState(false)
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
    const [password, setPassword] = useState("")

    const passwordValidation = {
        length: password.length >= 8,
        letter: /[a-zA-Z]/.test(password),
        number: /[0-9]/.test(password),
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
                <h1 className="text-4xl font-bold font-outfit text-[#1F2937]">Sign Up</h1>
                <div className="space-y-1">
                    <p className="text-sm font-medium text-[#4B5563]">No credit card nor upfront payment required!</p>
                    <p className="text-sm text-muted-foreground">
                        Already a member?{" "}
                        <Link href="/login" className="text-primary font-medium hover:underline underline-offset-4">
                            Log in
                        </Link>
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                <Button
                    variant="outline"
                    className="w-full h-12 rounded-lg border-2 border-slate-200 bg-white hover:bg-slate-50 transition-all font-bold text-slate-800 shadow-sm flex items-center justify-center gap-3 active:scale-[0.98]"
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

                <div className="pt-2">
                    <button
                        onClick={() => setShowEmailForm(!showEmailForm)}
                        className="w-full flex items-center justify-center gap-2 group"
                    >
                        <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors uppercase tracking-wider">
                            Sign up with email
                        </span>
                        <svg
                            className={cn("w-4 h-4 text-muted-foreground transition-transform duration-300", showEmailForm && "rotate-180")}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                </div>

                {showEmailForm && (
                    <form className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-300" onSubmit={(e) => e.preventDefault()}>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">E-mail</Label>
                            <Input
                                id="email"
                                placeholder="name@example.com"
                                type="email"
                                className="h-12 bg-muted/30 border-muted focus:bg-white transition-all rounded-lg"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="h-12 bg-muted/30 border-muted focus:bg-white transition-all pr-12 rounded-lg"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            <div className="flex gap-4 mt-2">
                                <div className="flex items-center gap-1.5 grayscale opacity-60">
                                    <div className={cn("w-3.5 h-3.5 rounded-full border border-muted-foreground flex items-center justify-center", passwordValidation.length && "bg-green-500 border-green-500 opacity-100")}>
                                        {passwordValidation.length && <Check className="w-2.5 h-2.5 text-white" />}
                                    </div>
                                    <span className="text-[10px] whitespace-nowrap">8 characters min.</span>
                                </div>
                                <div className="flex items-center gap-1.5 grayscale opacity-60">
                                    <div className={cn("w-3.5 h-3.5 rounded-full border border-muted-foreground flex items-center justify-center", passwordValidation.letter && "bg-green-500 border-green-500 opacity-100")}>
                                        {passwordValidation.letter && <Check className="w-2.5 h-2.5 text-white" />}
                                    </div>
                                    <span className="text-[10px] whitespace-nowrap">1 letter</span>
                                </div>
                                <div className="flex items-center gap-1.5 grayscale opacity-60">
                                    <div className={cn("w-3.5 h-3.5 rounded-full border border-muted-foreground flex items-center justify-center", passwordValidation.number && "bg-green-500 border-green-500 opacity-100")}>
                                        {passwordValidation.number && <Check className="w-2.5 h-2.5 text-white" />}
                                    </div>
                                    <span className="text-[10px] whitespace-nowrap">1 number</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3 pt-2">
                            <Checkbox id="marketing" className="mt-1 border-muted-foreground/30 data-[state=checked]:bg-primary" />
                            <Label htmlFor="marketing" className="text-xs font-medium leading-relaxed text-muted-foreground select-none">
                                Yes, I want to receive marketing communication (product tips, use case etc.) from IELTS Lover
                            </Label>
                        </div>

                        <Button type="submit" className="w-full h-12 text-base font-semibold rounded-lg bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all">
                            Sign up for free
                        </Button>
                    </form>
                )}
            </div>

            <p className="text-center text-[10px] text-muted-foreground leading-relaxed px-4">
                By signing up, I agree to IELTS Lover&apos;s{" "}
                <Link href="/privacy" className="font-semibold underline underline-offset-2">Privacy Policy</Link> and{" "}
                <Link href="/terms" className="font-semibold underline underline-offset-2">Terms of Service</Link>
            </p>
        </div>
    )
}

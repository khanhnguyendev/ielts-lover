"use client"

import * as React from "react"
import { X, Share2, Gift, Star, Copy, Check } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface InviteFriendsModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function InviteFriendsModal({ open, onOpenChange }: InviteFriendsModalProps) {
    const [copied, setCopied] = React.useState(false)
    const inviteLink = "https://ieltslover.com/ielts/refer/aws-khanh"

    const handleCopy = () => {
        navigator.clipboard.writeText(inviteLink)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-[32px] border-none shadow-2xl">
                <div className="relative">
                    {/* Header Section */}
                    <div className="p-10 pt-12 text-center space-y-4">
                        <div className="inline-flex items-center gap-2 bg-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-primary/20">
                            Earn a free mock test
                        </div>
                        <div className="space-y-1">
                            <DialogTitle className="text-3xl font-black font-outfit text-slate-900">Invite your friends</DialogTitle>
                            <p className="text-muted-foreground font-medium">and get a free mock test</p>
                        </div>

                        {/* Illustration Placeholder or Image */}
                        <div className="py-2 flex justify-center">
                            <div className="w-32 h-32 bg-primary/5 rounded-full flex items-center justify-center relative">
                                <Gift className="h-16 w-16 text-primary/40 rotate-12" />
                                <div className="absolute -top-2 -right-2 bg-white p-2 rounded-xl shadow-md border animate-bounce">
                                    <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* How it works Section */}
                    <div className="bg-primary p-10 space-y-8">
                        <h3 className="text-white font-black text-sm uppercase tracking-widest opacity-80">How it works:</h3>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                                    <Share2 className="h-3 w-3 text-white" />
                                </div>
                                <p className="text-sm font-bold text-white/90">Share the invite link with your friends</p>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                                    <Gift className="h-3 w-3 text-white" />
                                </div>
                                <p className="text-sm font-bold text-white/90">Your friend signs up and gets <span className="text-white underline">1 free mock test</span></p>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                                    <Star className="h-3 w-3 text-white" />
                                </div>
                                <p className="text-sm font-bold text-white/90">You get <span className="text-white underline">1 free mock test</span> every time a friend signs up</p>
                            </div>
                        </div>

                        {/* Invite Input */}
                        <div className="relative mt-8 group">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none opacity-50">
                                <Share2 className="h-4 w-4 text-white" />
                            </div>
                            <div className="w-full h-14 bg-white/10 border border-white/20 rounded-2xl pl-12 pr-32 flex items-center text-[10px] font-bold text-white/80 overflow-hidden whitespace-nowrap">
                                {inviteLink}
                            </div>
                            <Button
                                onClick={handleCopy}
                                className={cn(
                                    "absolute top-1.5 right-1.5 h-11 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all",
                                    copied ? "bg-green-500 hover:bg-green-600 text-white" : "bg-white text-primary hover:bg-slate-100"
                                )}
                            >
                                {copied ? (
                                    <>
                                        <Check className="mr-2 h-3.5 w-3.5 stroke-[3]" />
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <Copy className="mr-2 h-3.5 w-3.5" />
                                        Copy Link
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Footer Stats */}
                    <div className="p-8 px-10 flex items-center justify-between border-t bg-white">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Friends signed up</span>
                            <span className="text-xl font-black font-outfit">0</span>
                        </div>
                        <div className="flex flex-col gap-1 items-end">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Earned mock tests</span>
                            <div className="flex items-center gap-4">
                                <div className="flex gap-1.5 items-baseline">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Used</span>
                                    <span className="text-xl font-black font-outfit">0</span>
                                </div>
                                <div className="w-px h-8 bg-slate-100" />
                                <div className="flex gap-1.5 items-baseline">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Total</span>
                                    <span className="text-xl font-black font-outfit">0</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

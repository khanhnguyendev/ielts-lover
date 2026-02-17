"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, Save, MoveUp, MoveDown, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NumericInput } from "@/components/global/numeric-input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { useNotification } from "@/lib/contexts/notification-context"
import {
    getCreditPackages,
    createCreditPackage,
    updateCreditPackage,
    deleteCreditPackage,
    seedCreditPackages
} from "../actions"
import { CreditPackage } from "@/types"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

function LoadingSkeleton() {
    return (
        <div className="p-8 space-y-8 max-w-5xl mx-auto">
            <div className="flex justify-between items-center">
                <div className="space-y-2">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <div className="flex gap-4">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-32" />
                </div>
            </div>

            <div className="grid gap-6">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="p-6 space-y-4">
                        <div className="flex justify-between mb-4">
                            <div className="flex gap-4">
                                <Skeleton className="h-12 w-12 rounded-xl" />
                                <div className="space-y-2">
                                    <Skeleton className="h-6 w-32" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                            </div>
                            <Skeleton className="h-8 w-24 rounded-lg" />
                        </div>
                        <div className="grid md:grid-cols-4 gap-6">
                            {[1, 2, 3, 4].map((j) => (
                                <div key={j} className="space-y-2">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-10 w-full rounded-xl" />
                                </div>
                            ))}
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}

export default function AdminCreditsPage() {
    const { notifySuccess, notifyError } = useNotification()
    const [packages, setPackages] = useState<CreditPackage[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadPackages()
    }, [])

    const loadPackages = async () => {
        try {
            const data = await getCreditPackages()
            setPackages(data)
        } catch (error) {
            notifyError("Loading Failed", "Failed to load credit packages")
        } finally {
            setLoading(false)
        }
    }

    const handleSeed = async () => {
        try {
            await seedCreditPackages()
            notifySuccess("Database Seeded", "Default credit packages have been initialized")
            loadPackages()
        } catch (error) {
            notifyError("Seed Failed", "Failed to seed credit packages database")
        }
    }

    const handleAddPackage = async () => {
        const newPkg: Omit<CreditPackage, "id" | "created_at" | "updated_at"> = {
            name: "New Package",
            credits: 100,
            bonus_credits: 0,
            price: 5.00,
            tagline: "Description here",
            type: "starter",
            is_active: true,
            display_order: packages.length + 1
        }

        try {
            await createCreditPackage(newPkg)
            notifySuccess("Package Added", "New credit package created successfully")
            loadPackages()
        } catch (error) {
            notifyError("Add Failed", "Failed to add new credit package")
        }
    }

    const handleUpdate = async (id: string, updates: Partial<CreditPackage>) => {
        try {
            await updateCreditPackage(id, updates)
            notifySuccess("Package Updated", "Credit package updated successfully")
            loadPackages()
        } catch (error) {
            notifyError("Update Failed", "Failed to update credit package")
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this package?")) return

        try {
            await deleteCreditPackage(id)
            notifySuccess("Package Deleted", "Credit package has been removed")
            loadPackages()
        } catch (error) {
            notifyError("Delete Failed", "Failed to delete credit package")
        }
    }

    if (loading) return <LoadingSkeleton />

    return (
        <div className="p-8 space-y-8 max-w-5xl mx-auto">
            <div className="flex justify-end items-center gap-4">
                <Button variant="outline" onClick={handleSeed} className="gap-2">
                    <Zap className="h-4 w-4" /> Seed Database
                </Button>
                <Button onClick={handleAddPackage} className="gap-2">
                    <Plus className="h-4 w-4" /> Add Package
                </Button>
            </div>

            <div className="grid gap-6">
                {packages.map((pkg) => (
                    <Card key={pkg.id} className={cn(
                        "transition-all",
                        !pkg.is_active && "opacity-60 grayscale"
                    )}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <div className="flex items-center gap-4">
                                <div className="space-y-1">
                                    <CardTitle className="flex items-center gap-2">
                                        {pkg.name}
                                        {pkg.type === 'pro' && <Zap className="h-4 w-4 text-primary fill-current" />}
                                    </CardTitle>
                                    <CardDescription>{pkg.type.toUpperCase()} Package</CardDescription>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <Label htmlFor={`active-${pkg.id}`} className="text-xs">Active</Label>
                                    <Switch
                                        id={`active-${pkg.id}`}
                                        checked={pkg.is_active}
                                        onCheckedChange={(checked) => handleUpdate(pkg.id, { is_active: checked })}
                                    />
                                </div>
                                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(pkg.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="grid md:grid-cols-4 gap-6">
                            <div className="space-y-2">
                                <Label>Package Name</Label>
                                <Input
                                    value={pkg.name}
                                    onChange={(e) => setPackages(prev => prev.map(p => p.id === pkg.id ? { ...p, name: e.target.value } : p))}
                                    onBlur={(e) => handleUpdate(pkg.id, { name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Credits</Label>
                                <NumericInput
                                    value={pkg.credits}
                                    onChange={(val) => setPackages(prev => prev.map(p => p.id === pkg.id ? { ...p, credits: val } : p))}
                                    onCommit={(val) => handleUpdate(pkg.id, { credits: val })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Bonus Credits</Label>
                                <NumericInput
                                    value={pkg.bonus_credits}
                                    onChange={(val) => setPackages(prev => prev.map(p => p.id === pkg.id ? { ...p, bonus_credits: val } : p))}
                                    onCommit={(val) => handleUpdate(pkg.id, { bonus_credits: val })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Price ($)</Label>
                                <NumericInput
                                    isFloat
                                    step="0.01"
                                    value={pkg.price}
                                    onChange={(val) => setPackages(prev => prev.map(p => p.id === pkg.id ? { ...p, price: val } : p))}
                                    onCommit={(val) => handleUpdate(pkg.id, { price: val })}
                                />
                            </div>
                            <div className="md:col-span-3 space-y-2">
                                <Label>Tagline</Label>
                                <Input
                                    value={pkg.tagline}
                                    onChange={(e) => setPackages(prev => prev.map(p => p.id === pkg.id ? { ...p, tagline: e.target.value } : p))}
                                    onBlur={(e) => handleUpdate(pkg.id, { tagline: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Type</Label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={pkg.type}
                                    onChange={(e) => handleUpdate(pkg.id, { type: e.target.value as any })}
                                >
                                    <option value="starter">Starter</option>
                                    <option value="pro">Pro</option>
                                    <option value="master">Master</option>
                                </select>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

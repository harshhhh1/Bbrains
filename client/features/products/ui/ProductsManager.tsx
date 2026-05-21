"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { api } from "@/services/api/client"
import { toast } from "sonner"
import { SectionHeader } from "@/features/admin/ui/SectionHeader"
import { CrudDrawer } from "@/features/admin/ui/CrudDrawer"
import { ConfirmDialog } from "@/features/admin/ui/ConfirmDialog"
import { ProductEditForm } from "@/features/products/ui/ProductEditForm"
import { fetchProducts, fmtCurrency } from "@/features/products/api/data"
import { initForm, type ProductFormData } from "@/features/products/types"
import type { ApiProduct } from "@/features/products/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { LoadingState } from "@/components/ui/loading-state"
import { Stack } from "@/components/layout/page-primitives"
import { SearchField } from "@/components/ui/toolbar"
import { Pencil, Trash2, CheckCircle, XCircle, Package, Loader2, ImageIcon } from "lucide-react"

interface ProductsManagerProps {
    initialProducts: ApiProduct[]
}

const approvalColors: Record<string, string> = {
    approved: "bg-green-500/15 text-green-600",
    rejected: "bg-red-500/15 text-red-600",
    pending: "bg-yellow-500/15 text-yellow-600",
}

function fmtDate(value: string) {
    return new Date(value).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    })
}

export function ProductsManager({ initialProducts }: ProductsManagerProps) {
    const [products, setProducts] = useState<ApiProduct[]>(initialProducts)
    const [loading, setLoading] = useState(false)
    const [editing, setEditing] = useState<ApiProduct | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<ApiProduct | null>(null)
    const [form, setForm] = useState<ProductFormData>(initForm())
    const [submitting, setSubmitting] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [approvalLoading, setApprovalLoading] = useState<number | null>(null)
    const [searchQuery, setSearchQuery] = useState("")

    const load = useCallback(async () => {
        try {
            setLoading(true)
            const data = await fetchProducts()
            setProducts(data)
        } catch (e) {
            console.error(e)
            toast.error("Failed to load products")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        load()
    }, [load])

    const filteredProducts = useMemo(() => {
        if (!searchQuery.trim()) return products
        const query = searchQuery.toLowerCase()
        return products.filter(
            (p) =>
                p.name.toLowerCase().includes(query) ||
                p.description?.toLowerCase().includes(query) ||
                p.creator?.username?.toLowerCase().includes(query)
        )
    }, [products, searchQuery])

    function openEdit(p: ApiProduct) {
        setEditing(p)
        setForm(initForm(p))
    }

    async function handleUpdate() {
        if (!editing || !form.name.trim()) return
        try {
            setSubmitting(true)
            const r = await api.put<ApiProduct>(`/market/products/${editing.id}`, {
                name: form.name,
                description: form.description || undefined,
                price: Number(form.price),
                stock: Number(form.stock),
                imageUrl: form.imageUrl || undefined,
            })
            if (r.success) {
                toast.success("Product updated")
                setProducts((prev) => prev.map((p) => (p.id === editing.id ? (r.data as ApiProduct) : p)))
                setEditing(null)
            } else {
                toast.error(r.message || "Failed to update product")
            }
        } catch (e) {
            console.error(e)
            toast.error("An error occurred")
        } finally {
            setSubmitting(false)
        }
    }

    async function handleDelete() {
        if (!deleteTarget) return
        try {
            setDeleting(true)
            const res = await api.delete(`/market/products/${deleteTarget.id}`)
            if (res.success) {
                toast.success("Product deleted")
                setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id))
                setDeleteTarget(null)
            } else {
                toast.error(res.message || "Failed to delete product")
            }
        } catch (e) {
            console.error(e)
            toast.error("Failed to delete product")
        } finally {
            setDeleting(false)
        }
    }

    async function handleApproval(id: number, status: "approved" | "rejected") {
        try {
            setApprovalLoading(id)
            const r = await api.patch<ApiProduct>(`/market/products/${id}/approval`, { status })
            if (r.success) {
                toast.success(`Product ${status}`)
                setProducts((prev) => prev.map((p) => (p.id === id ? (r.data as ApiProduct) : p)))
            } else {
                toast.error(r.message || "Approval failed")
            }
        } catch (e) {
            console.error(e)
            toast.error("Approval failed")
        } finally {
            setApprovalLoading(null)
        }
    }

    if (loading) {
        return <LoadingState label="Loading products..." className="py-8" iconClassName="size-4" />
    }

    return (
        <Stack>
            <SectionHeader title="Products" subtitle={`${products.length} total items in market`} />

            <SearchField
                wrapperClassName="max-w-md"
                    className="rounded-xl pl-9"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />

            {filteredProducts.length === 0 ? (
                <EmptyState
                    icon={<Package className="size-8" />}
                    title={searchQuery ? "No products match your search." : "No products found."}
                    className="py-10"
                />
            ) : (
                <Stack gap="md">
                    {filteredProducts.map((product) => (
                        <Card key={product.id} className="border-border/60 overflow-hidden group hover:border-border transition-colors">
                            <CardContent className="p-0">
                                <div className="flex flex-col sm:flex-row h-auto sm:h-32">
                                    {/* Product Image */}
                                    <div className="relative w-full sm:w-48 h-32 bg-muted shrink-0">
                                        {product.image ? (
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <ImageIcon className="size-8 text-muted-foreground/50" />
                                            </div>
                                        )}
                                        <Badge className={`absolute top-2 left-2 text-[10px] font-semibold ${approvalColors[product.approval]}`}>
                                            {product.approval}
                                        </Badge>
                                    </div>

                                    {/* Content Area */}
                                    <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                                            <div className="space-y-1 min-w-0">
                                                <h3 className="font-bold text-foreground text-lg truncate">{product.name}</h3>
                                                {product.description && (
                                                    <p className="text-sm text-muted-foreground line-clamp-1">{product.description}</p>
                                                )}
                                            </div>
                                            <div className="flex flex-col items-end gap-1 shrink-0">
                                                <span className="font-black text-brand-purple text-lg">{fmtCurrency(product.price)}</span>
                                                <span className="text-xs text-muted-foreground">Stock: {product.stock}</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center justify-between gap-4 mt-2">
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1.5">
                                                    <div className="size-5 rounded-full bg-muted flex items-center justify-center overflow-hidden border border-border/50">
                                                        <Package className="size-3" />
                                                    </div>
                                                    By {product.creator?.username ?? "Unknown"}
                                                </span>
                                                <span className="px-2 py-0.5 rounded-full bg-muted text-[10px] font-bold uppercase tracking-wider">
                                                    {fmtDate(product.createdAt)}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {product.approval === "pending" && (
                                                    <div className="flex gap-1.5 mr-1 pr-1 border-r border-border/50">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-500/10 rounded-lg"
                                                            disabled={approvalLoading === product.id}
                                                            onClick={() => handleApproval(product.id, "approved")}
                                                        >
                                                            {approvalLoading === product.id ? (
                                                                <Loader2 className="size-4 animate-spin" />
                                                            ) : (
                                                                <CheckCircle className="size-4" />
                                                            )}
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-500/10 rounded-lg"
                                                            disabled={approvalLoading === product.id}
                                                            onClick={() => handleApproval(product.id, "rejected")}
                                                        >
                                                            <XCircle className="size-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 gap-1.5 text-xs rounded-lg"
                                                    onClick={() => openEdit(product)}
                                                >
                                                    <Pencil className="size-3.5" />
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg"
                                                    onClick={() => setDeleteTarget(product)}
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </Stack>
            )}

            <CrudDrawer
                open={!!editing}
                onClose={() => setEditing(null)}
                title="Edit Product"
                onSubmit={handleUpdate}
                submitting={submitting}
            >
                <ProductEditForm form={form} onChange={setForm} />
            </CrudDrawer>

            <ConfirmDialog
                open={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                confirming={deleting}
                title="Delete Product"
                description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
            />
        </Stack>
    )
}

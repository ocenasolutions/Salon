"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, PackageIcon, Edit, Trash2, Sparkles } from "lucide-react"
import type { Package } from "@/lib/models/Package"
import CreatePackageDialog from "@/components/packages/create-package-dialog"
import EditPackageDialog from "@/components/packages/edit-package-dialog"
import DeletePackageDialog from "@/components/packages/delete-package-dialog"
import Link from "next/link"

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingPackage, setEditingPackage] = useState<Package | null>(null)
  const [deletingPackage, setDeletingPackage] = useState<Package | null>(null)

  const fetchPackages = async () => {
    try {
      const token = localStorage.getItem("auth-token")
      const response = await fetch("/api/packages", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setPackages(data.packages)
      }
    } catch (error) {
      console.error("Error fetching packages:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPackages()
  }, [])

  const handlePackageCreated = () => {
    fetchPackages()
    setShowCreateDialog(false)
  }

  const handlePackageUpdated = () => {
    fetchPackages()
    setEditingPackage(null)
  }

  const handlePackageDeleted = () => {
    fetchPackages()
    setDeletingPackage(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading packages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            <span className="text-2xl font-serif font-bold text-primary">SalonPro</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/packages" className="text-foreground font-medium">
              Packages
            </Link>
            <Link href="/bills" className="text-muted-foreground hover:text-foreground transition-colors">
              Bills
            </Link>
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <Link href="/reports" className="text-muted-foreground hover:text-foreground transition-colors">
              Reports
            </Link>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-serif font-bold text-foreground mb-2">Service Packages</h1>
            <p className="text-xl text-muted-foreground">Manage your salon service offerings</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            Create Package
          </Button>
        </div>

        {/* Packages Grid */}
        {packages.length === 0 ? (
          <Card className="border-border/40">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <PackageIcon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-serif font-semibold mb-2">No packages yet</h3>
              <p className="text-muted-foreground mb-6 text-center max-w-md">
                Create your first service package to start managing your salon offerings
              </p>
              <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Your First Package
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <Card key={pkg._id?.toString()} className="border-border/40 hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl font-serif mb-2">{pkg.name}</CardTitle>
                      <Badge variant={pkg.type === "Premium" ? "default" : "secondary"} className="mb-2">
                        {pkg.type}
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setEditingPackage(pkg)} className="h-8 w-8 p-0">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingPackage(pkg)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4 leading-relaxed">{pkg.description}</CardDescription>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-serif font-bold text-primary">₹{pkg.price}</span>
                    <span className="text-sm text-muted-foreground">
                      Created {new Date(pkg.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <CreatePackageDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={handlePackageCreated}
      />

      {editingPackage && (
        <EditPackageDialog
          open={!!editingPackage}
          onOpenChange={() => setEditingPackage(null)}
          package={editingPackage}
          onSuccess={handlePackageUpdated}
        />
      )}

      {deletingPackage && (
        <DeletePackageDialog
          open={!!deletingPackage}
          onOpenChange={() => setDeletingPackage(null)}
          package={deletingPackage}
          onSuccess={handlePackageDeleted}
        />
      )}
    </div>
  )
}

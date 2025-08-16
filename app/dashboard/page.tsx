"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DollarSign,
  TrendingUp,
  Package,
  Receipt,
  Calendar,
  Edit,
  Trash2,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import type { Bill } from "@/lib/models/Bill"
import Link from "next/link"
import EditBillDialog from "@/components/bills/edit-bill-dialog"
import DeleteBillDialog from "@/components/bills/delete-bill-dialog"
import type { Package as PackageType } from "@/lib/models/Package"

interface DashboardAnalytics {
  todaysTotalSales: number
  highestBillToday: Bill | null
  totalPackages: number
  totalBills: number
  recentBills: Bill[]
  thisWeeksTotalSales: number
  thisMonthsTotalSales: number
  todaysBillsCount: number
}

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null)
  const [packages, setPackages] = useState<PackageType[]>([])
  const [loading, setLoading] = useState(true)
  const [editingBill, setEditingBill] = useState<Bill | null>(null)
  const [deletingBill, setDeletingBill] = useState<Bill | null>(null)

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem("auth-token")
      const response = await fetch("/api/dashboard/analytics", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error("Error fetching analytics:", error)
    }
  }

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
    fetchAnalytics()
    fetchPackages()
  }, [])

  const handleBillUpdated = () => {
    fetchAnalytics()
    setEditingBill(null)
  }

  const handleBillDeleted = () => {
    fetchAnalytics()
    setDeletingBill(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
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
            <Link href="/packages" className="text-muted-foreground hover:text-foreground transition-colors">
              Packages
            </Link>
            <Link href="/bills" className="text-muted-foreground hover:text-foreground transition-colors">
              Bills
            </Link>
            <Link href="/dashboard" className="text-foreground font-medium">
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
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-xl text-muted-foreground">Overview of your salon's performance</p>
        </div>

        {analytics && (
          <>
            {/* Key Metrics Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="border-border/40 hover:shadow-lg transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-serif font-bold text-primary">
                    ₹{analytics.todaysTotalSales.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {analytics.todaysBillsCount} bill{analytics.todaysBillsCount !== 1 ? "s" : ""} today
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/40 hover:shadow-lg transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Highest Bill Today</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-serif font-bold text-primary">
                    ₹{analytics.highestBillToday ? analytics.highestBillToday.totalAmount.toFixed(2) : "0.00"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {analytics.highestBillToday ? "Peak transaction" : "No bills today"}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/40 hover:shadow-lg transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Packages</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-serif font-bold text-primary">{analytics.totalPackages}</div>
                  <p className="text-xs text-muted-foreground">Active service packages</p>
                </CardContent>
              </Card>

              <Card className="border-border/40 hover:shadow-lg transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Bills</CardTitle>
                  <Receipt className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-serif font-bold text-primary">{analytics.totalBills}</div>
                  <p className="text-xs text-muted-foreground">All time invoices</p>
                </CardContent>
              </Card>
            </div>

            {/* Sales Overview */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card className="border-border/40">
                <CardHeader>
                  <CardTitle className="text-lg font-serif flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    This Week
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-serif font-bold text-primary mb-2">
                    ₹{analytics.thisWeeksTotalSales.toFixed(2)}
                  </div>
                  <div className="flex items-center gap-2">
                    {analytics.thisWeeksTotalSales >= analytics.todaysTotalSales ? (
                      <ArrowUpRight className="h-4 w-4 text-green-500" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm text-muted-foreground">Weekly performance</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/40">
                <CardHeader>
                  <CardTitle className="text-lg font-serif flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    This Month
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-serif font-bold text-primary mb-2">
                    ₹{analytics.thisMonthsTotalSales.toFixed(2)}
                  </div>
                  <div className="flex items-center gap-2">
                    {analytics.thisMonthsTotalSales >= analytics.thisWeeksTotalSales ? (
                      <ArrowUpRight className="h-4 w-4 text-green-500" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm text-muted-foreground">Monthly performance</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/40">
                <CardHeader>
                  <CardTitle className="text-lg font-serif">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/packages">
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <Package className="h-4 w-4 mr-2" />
                      Manage Packages
                    </Button>
                  </Link>
                  <Link href="/bills">
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <Receipt className="h-4 w-4 mr-2" />
                      Create New Bill
                    </Button>
                  </Link>
                  <Link href="/reports">
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      View Reports
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* Recent Bills - Editable */}
            <Card className="border-border/40">
              <CardHeader>
                <CardTitle className="text-2xl font-serif">Recent Bills</CardTitle>
                <CardDescription>Last 15 bills - these can be edited or deleted</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics.recentBills.length === 0 ? (
                  <div className="text-center py-8">
                    <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No bills created yet</p>
                    <Link href="/bills">
                      <Button className="mt-4">Create Your First Bill</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {analytics.recentBills.map((bill) => (
                      <div
                        key={bill._id?.toString()}
                        className="flex items-center justify-between p-4 border border-border/40 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold">Bill #{bill._id?.toString().slice(-6).toUpperCase()}</h4>
                            <span className="text-2xl font-serif font-bold text-primary">
                              ₹{bill.totalAmount.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            {bill.items.slice(0, 3).map((item, index) => (
                              <Badge
                                key={index}
                                variant={item.packageType === "Premium" ? "default" : "secondary"}
                                className="text-xs"
                              >
                                {item.packageName}
                              </Badge>
                            ))}
                            {bill.items.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{bill.items.length - 3} more
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {new Date(bill.createdAt).toLocaleDateString()} at{" "}
                            {new Date(bill.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingBill(bill)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingBill(bill)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Dialogs */}
      {editingBill && (
        <EditBillDialog
          open={!!editingBill}
          onOpenChange={() => setEditingBill(null)}
          bill={editingBill}
          packages={packages}
          onSuccess={handleBillUpdated}
        />
      )}

      {deletingBill && (
        <DeleteBillDialog
          open={!!deletingBill}
          onOpenChange={() => setDeletingBill(null)}
          bill={deletingBill}
          onSuccess={handleBillDeleted}
        />
      )}
    </div>
  )
}

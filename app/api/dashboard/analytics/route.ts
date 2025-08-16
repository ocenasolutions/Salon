import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { Bill } from "@/lib/models/Bill"
import type { Package } from "@/lib/models/Package"
import { ObjectId } from "mongodb"
import { verifyToken } from "@/lib/auth"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = await verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const userId = decoded.userId

    const db = await getDatabase()
    const billsCollection = db.collection<Bill>("bills")
    const packagesCollection = db.collection<Package>("packages")

    // Get today's date range
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

    // Get today's bills
    const todaysBills = await billsCollection
      .find({
        userId: new ObjectId(userId),
        createdAt: {
          $gte: startOfDay,
          $lt: endOfDay,
        },
      })
      .toArray()

    // Calculate today's total sales
    const todaysTotalSales = todaysBills.reduce((sum, bill) => sum + bill.totalAmount, 0)

    // Find highest bill of the day
    const highestBillToday = todaysBills.reduce(
      (highest, bill) => (bill.totalAmount > highest.totalAmount ? bill : highest),
      { totalAmount: 0, _id: null, items: [], createdAt: new Date(), userId: new ObjectId(), updatedAt: new Date() },
    )

    // Get total number of packages
    const totalPackages = await packagesCollection.countDocuments({ userId: new ObjectId(userId) })

    // Get total number of bills
    const totalBills = await billsCollection.countDocuments({ userId: new ObjectId(userId) })

    // Get recent bills (last 15 for editing)
    const recentBills = await billsCollection
      .find({ userId: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(15)
      .toArray()

    // Get this week's sales
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    const thisWeeksBills = await billsCollection
      .find({
        userId: new ObjectId(userId),
        createdAt: { $gte: startOfWeek },
      })
      .toArray()

    const thisWeeksTotalSales = thisWeeksBills.reduce((sum, bill) => sum + bill.totalAmount, 0)

    // Get this month's sales
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const thisMonthsBills = await billsCollection
      .find({
        userId: new ObjectId(userId),
        createdAt: { $gte: startOfMonth },
      })
      .toArray()

    const thisMonthsTotalSales = thisMonthsBills.reduce((sum, bill) => sum + bill.totalAmount, 0)

    return NextResponse.json(
      {
        todaysTotalSales,
        highestBillToday: highestBillToday.totalAmount > 0 ? highestBillToday : null,
        totalPackages,
        totalBills,
        recentBills,
        thisWeeksTotalSales,
        thisMonthsTotalSales,
        todaysBillsCount: todaysBills.length,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Dashboard analytics error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

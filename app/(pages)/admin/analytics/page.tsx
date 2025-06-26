"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    Legend,
    AreaChart,
    Area,
} from "recharts";

interface BookingData {
    id: number;
    part_id: number;
    quantity: number;
    status: string;
    date: string;
    parts: {
        name: string;
        price: number;
        stock: number;
        types: { name: string };
        vehicles: { name: string; make: string; model: string };
    };
}

interface AnalyticsData {
    totalRevenue: number;
    totalBookings: number;
    completedBookings: number;
    pendingBookings: number;
    canceledBookings: number;
    averageOrderValue: number;
    conversionRate: number;
    topSellingParts: Array<{
        name: string;
        quantity: number;
        revenue: number;
        vehicle: string;
    }>;
    bookingsByStatus: Array<{
        status: string;
        count: number;
    }>;
    bookingsByCategory: Array<{
        category: string;
        count: number;
        revenue: number;
    }>;
    dailyBookings: Array<{
        date: string;
        bookings: number;
        revenue: number;
        completed: number;
    }>;
    partsByCategory: Array<{
        category: string;
        count: number;
        revenue: number;
    }>;
    inventoryStatus: Array<{
        name: string;
        stock: number;
        status: string;
        category: string;
    }>;
    vehiclePopularity: Array<{
        vehicle: string;
        bookings: number;
        revenue: number;
    }>;
    monthlyTrends: Array<{
        month: string;
        bookings: number;
        revenue: number;
        avgOrderValue: number;
    }>;
    topRevenueGenerators: Array<{
        name: string;
        revenue: number;
        quantity: number;
        avgPrice: number;
    }>;
}

const COLORS = [
    "#f59e0b",
    "#ef4444",
    "#10b981",
    "#3b82f6",
    "#8b5cf6",
    "#f97316",
    "#06b6d4",
    "#84cc16",
];

export default function AdminAnalytics() {
    const [data, setData] = useState<AnalyticsData>({
        totalRevenue: 0,
        totalBookings: 0,
        completedBookings: 0,
        pendingBookings: 0,
        canceledBookings: 0,
        averageOrderValue: 0,
        conversionRate: 0,
        topSellingParts: [],
        bookingsByStatus: [],
        bookingsByCategory: [],
        dailyBookings: [],
        partsByCategory: [],
        inventoryStatus: [],
        vehiclePopularity: [],
        monthlyTrends: [],
        topRevenueGenerators: [],
    });
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState("30");

    const supabase = createClient();

    const fetchAnalyticsData = useCallback(async () => {
        setLoading(true);

        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - parseInt(dateRange));

        const { data: bookingsData, error } = await supabase
            .from("bookings")
            .select(
                `
                *,
                parts (
                    name,
                    price,
                    stock,
                    types (name),
                    vehicles (name, make, model)
                )
            `
            )
            .gte("date", startDate.toISOString())
            .order("date", { ascending: false });

        const { data: allParts } = await supabase.from("parts").select(`
                *,
                types (name)
            `);

        if (bookingsData && allParts) {
            const processedData = processAnalytics(
                bookingsData as BookingData[],
                allParts
            );
            setData(processedData);
        }
        setLoading(false);
    }, [supabase, dateRange]);

    useEffect(() => {
        fetchAnalyticsData();
    }, [fetchAnalyticsData]);

    const processAnalytics = (
        bookings: BookingData[],
        allParts: any[]
    ): AnalyticsData => {
        const totalBookings = bookings.length;
        const completedBookings = bookings.filter(
            (b) => b.status === "completed"
        ).length;
        const pendingBookings = bookings.filter(
            (b) => b.status === "pending"
        ).length;
        const canceledBookings = bookings.filter(
            (b) => b.status === "canceled"
        ).length;

        const totalRevenue = bookings
            .filter((b) => b.status === "completed")
            .reduce(
                (sum, booking) => sum + booking.parts.price * booking.quantity,
                0
            );

        const averageOrderValue =
            completedBookings > 0 ? totalRevenue / completedBookings : 0;
        const conversionRate =
            totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0;

        const partSales = bookings
            .filter((b) => b.status === "completed")
            .reduce((acc, booking) => {
                const partName = booking.parts.name;
                const vehicle = `${booking.parts.vehicles?.make || ""} ${
                    booking.parts.vehicles?.model || ""
                }`.trim();
                if (!acc[partName]) {
                    acc[partName] = { quantity: 0, revenue: 0, vehicle };
                }
                acc[partName].quantity += booking.quantity;
                acc[partName].revenue += booking.parts.price * booking.quantity;
                return acc;
            }, {} as Record<string, { quantity: number; revenue: number; vehicle: string }>);

        const topSellingParts = Object.entries(partSales)
            .map(([name, data]) => ({ name, ...data }))
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 10);

        const topRevenueGenerators = Object.entries(partSales)
            .map(([name, data]) => ({
                name,
                revenue: data.revenue,
                quantity: data.quantity,
                avgPrice: data.revenue / data.quantity,
            }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 8);

        const statusCounts = bookings.reduce((acc, booking) => {
            acc[booking.status] = (acc[booking.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const bookingsByStatus = Object.entries(statusCounts).map(
            ([status, count]) => ({
                status: status.charAt(0).toUpperCase() + status.slice(1),
                count,
            })
        );

        const categoryBookings = bookings.reduce((acc, booking) => {
            const category = booking.parts.types?.name || "Uncategorized";
            if (!acc[category]) {
                acc[category] = { count: 0, revenue: 0 };
            }
            acc[category].count += 1;
            if (booking.status === "completed") {
                acc[category].revenue += booking.parts.price * booking.quantity;
            }
            return acc;
        }, {} as Record<string, { count: number; revenue: number }>);

        const bookingsByCategory = Object.entries(categoryBookings).map(
            ([category, data]) => ({
                category,
                count: data.count,
                revenue: data.revenue,
            })
        );

        const dailyBookingsMap = bookings.reduce((acc, booking) => {
            const date = new Date(booking.date).toISOString().split("T")[0];
            if (!acc[date]) {
                acc[date] = { bookings: 0, revenue: 0, completed: 0 };
            }
            acc[date].bookings += 1;
            if (booking.status === "completed") {
                acc[date].revenue += booking.parts.price * booking.quantity;
                acc[date].completed += 1;
            }
            return acc;
        }, {} as Record<string, { bookings: number; revenue: number; completed: number }>);

        const dailyBookings = Object.entries(dailyBookingsMap)
            .map(([date, data]) => ({ date, ...data }))
            .sort((a, b) => a.date.localeCompare(b.date))
            .slice(-14);

        const categoryRevenue = bookings
            .filter((b) => b.status === "completed")
            .reduce((acc, booking) => {
                const category = booking.parts.types?.name || "Uncategorized";
                if (!acc[category]) {
                    acc[category] = { count: 0, revenue: 0 };
                }
                acc[category].count += booking.quantity;
                acc[category].revenue += booking.parts.price * booking.quantity;
                return acc;
            }, {} as Record<string, { count: number; revenue: number }>);

        const partsByCategory = Object.entries(categoryRevenue).map(
            ([category, data]) => ({
                category,
                ...data,
            })
        );

        const vehicleBookings = bookings
            .filter((b) => b.status === "completed")
            .reduce((acc, booking) => {
                const vehicle = `${booking.parts.vehicles?.make || "Unknown"} ${
                    booking.parts.vehicles?.model || "Model"
                }`.trim();
                if (!acc[vehicle]) {
                    acc[vehicle] = { bookings: 0, revenue: 0 };
                }
                acc[vehicle].bookings += 1;
                acc[vehicle].revenue += booking.parts.price * booking.quantity;
                return acc;
            }, {} as Record<string, { bookings: number; revenue: number }>);

        const vehiclePopularity = Object.entries(vehicleBookings)
            .map(([vehicle, data]) => ({ vehicle, ...data }))
            .sort((a, b) => b.bookings - a.bookings)
            .slice(0, 8);

        const monthlyData = bookings.reduce((acc, booking) => {
            const month = new Date(booking.date).toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
            });
            if (!acc[month]) {
                acc[month] = { bookings: 0, revenue: 0, completed: 0 };
            }
            acc[month].bookings += 1;
            if (booking.status === "completed") {
                acc[month].revenue += booking.parts.price * booking.quantity;
                acc[month].completed += 1;
            }
            return acc;
        }, {} as Record<string, { bookings: number; revenue: number; completed: number }>);

        const monthlyTrends = Object.entries(monthlyData)
            .map(([month, data]) => ({
                month,
                bookings: data.bookings,
                revenue: data.revenue,
                avgOrderValue:
                    data.completed > 0 ? data.revenue / data.completed : 0,
            }))
            .slice(-6);

        const inventoryStatus = allParts
            .map((part) => ({
                name: part.name,
                stock: part.stock || 0,
                category: part.types?.name || "Uncategorized",
                status:
                    (part.stock || 0) > 10
                        ? "In Stock"
                        : (part.stock || 0) > 5
                        ? "Low Stock"
                        : "Critical",
            }))
            .sort((a, b) => a.stock - b.stock);

        return {
            totalRevenue,
            totalBookings,
            completedBookings,
            pendingBookings,
            canceledBookings,
            averageOrderValue,
            conversionRate,
            topSellingParts,
            bookingsByStatus,
            bookingsByCategory,
            dailyBookings,
            partsByCategory,
            inventoryStatus,
            vehiclePopularity,
            monthlyTrends,
            topRevenueGenerators,
        };
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-inter">
                <div className="flex justify-center items-center">
                    <div className="text-lg text-gray-600">
                        Loading analytics...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-inter">
            <div className="sm:mx-auto sm:w-full sm:max-w-7xl">
                <div className="text-center mb-8">
                    <Link
                        href="/admin/dashboard"
                        className="inline-flex items-center text-amber-600 hover:text-amber-500 mb-4"
                    >
                        <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                        Back to Dashboard
                    </Link>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">
                        Analytics Dashboard
                    </h2>
                    <p className="text-sm text-gray-600">
                        Comprehensive business insights and performance metrics
                    </p>
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-7xl">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-medium text-gray-900">
                            Business Overview
                        </h3>
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                        >
                            <option value="7">Last 7 days</option>
                            <option value="30">Last 30 days</option>
                            <option value="90">Last 90 days</option>
                            <option value="365">Last year</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg p-6 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-amber-100 text-sm font-medium">
                                        Total Revenue
                                    </p>
                                    <p className="text-2xl font-bold">
                                        ₱{data.totalRevenue.toLocaleString()}
                                    </p>
                                </div>
                                <div className="text-amber-200">
                                    <svg
                                        className="w-8 h-8"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100 text-sm font-medium">
                                        Total Bookings
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {data.totalBookings}
                                    </p>
                                </div>
                                <div className="text-blue-200">
                                    <svg
                                        className="w-8 h-8"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-100 text-sm font-medium">
                                        Avg Order Value
                                    </p>
                                    <p className="text-2xl font-bold">
                                        ₱
                                        {data.averageOrderValue.toLocaleString()}
                                    </p>
                                </div>
                                <div className="text-green-200">
                                    <svg
                                        className="w-8 h-8"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-purple-100 text-sm font-medium">
                                        Conversion Rate
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {data.conversionRate.toFixed(1)}%
                                    </p>
                                </div>
                                <div className="text-purple-200">
                                    <svg
                                        className="w-8 h-8"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h4 className="text-lg font-medium text-gray-900 mb-4">
                                Daily Performance Trends
                            </h4>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={data.dailyBookings}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Area
                                            type="monotone"
                                            dataKey="bookings"
                                            stackId="1"
                                            stroke="#f59e0b"
                                            fill="#fbbf24"
                                            name="Total Bookings"
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="completed"
                                            stackId="2"
                                            stroke="#10b981"
                                            fill="#34d399"
                                            name="Completed"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h4 className="text-lg font-medium text-gray-900 mb-4">
                                Bookings by Category
                            </h4>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={data.bookingsByCategory}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ category, percent }) =>
                                                `${category} ${(
                                                    percent * 100
                                                ).toFixed(0)}%`
                                            }
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="count"
                                        >
                                            {data.bookingsByCategory.map(
                                                (entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={
                                                            COLORS[
                                                                index %
                                                                    COLORS.length
                                                            ]
                                                        }
                                                    />
                                                )
                                            )}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h4 className="text-lg font-medium text-gray-900 mb-4">
                                Top Revenue Generators
                            </h4>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data.topRevenueGenerators}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="name"
                                            angle={-45}
                                            textAnchor="end"
                                            height={80}
                                        />
                                        <YAxis />
                                        <Tooltip
                                            formatter={(value, name) => [
                                                name === "revenue"
                                                    ? `₱${value?.toLocaleString()}`
                                                    : value,
                                                name === "revenue"
                                                    ? "Revenue"
                                                    : "Avg Price",
                                            ]}
                                        />
                                        <Bar dataKey="revenue" fill="#10b981" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h4 className="text-lg font-medium text-gray-900 mb-4">
                                Popular Vehicle Models
                            </h4>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={data.vehiclePopularity}
                                        layout="horizontal"
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis type="number" />
                                        <YAxis
                                            dataKey="vehicle"
                                            type="category"
                                            width={80}
                                        />
                                        <Tooltip />
                                        <Bar
                                            dataKey="bookings"
                                            fill="#3b82f6"
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h4 className="text-lg font-medium text-gray-900 mb-4">
                                Top Selling Parts Details
                            </h4>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                Part Name
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                Vehicle
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                Sold
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                Revenue
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {data.topSellingParts
                                            .slice(0, 8)
                                            .map((part, index) => (
                                                <tr key={index}>
                                                    <td className="px-4 py-4 text-sm font-medium text-gray-900">
                                                        {part.name}
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-gray-600">
                                                        {part.vehicle ||
                                                            "Universal"}
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-gray-900">
                                                        {part.quantity}
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-gray-900">
                                                        ₱
                                                        {part.revenue.toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h4 className="text-lg font-medium text-gray-900 mb-4">
                                Inventory Alert System
                            </h4>
                            <div className="space-y-3 max-h-64 overflow-y-auto">
                                {data.inventoryStatus
                                    .slice(0, 12)
                                    .map((item, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                        >
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {item.name}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {item.category} • Stock:{" "}
                                                    {item.stock}
                                                </p>
                                            </div>
                                            <span
                                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                    item.status === "In Stock"
                                                        ? "bg-green-100 text-green-800"
                                                        : item.status ===
                                                          "Low Stock"
                                                        ? "bg-yellow-100 text-yellow-800"
                                                        : "bg-red-100 text-red-800"
                                                }`}
                                            >
                                                {item.status}
                                            </span>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

import React, { useMemo, useState } from "react";
import useSWR from "swr";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  BadgeIndianRupee,
  Boxes,
  CircleAlert,
  PackageCheck,
  PackageX,
  ShoppingBag,
  ShoppingCart,
  TrendingUp,
  Users,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Clock3,
  Zap,
  RefreshCw,
} from "lucide-react";
import { Card, Spin, Empty, Tag, Button } from "antd";
import { fetcher } from "../../lib/fetcher";

const COLORS = ["#111827", "#16a34a", "#f59e0b", "#2563eb"];

const currency = (value = 0) => `₹${Number(value || 0).toLocaleString()}`;

const safeTitle = (product) =>
  product?.title ||
  product?.name ||
  product?.product?.title ||
  "Unnamed product";

const getProductDoc = (lineItem) =>
  lineItem?.id || lineItem?.product || lineItem;

const getQty = (lineItem) => Number(lineItem?.qnt || lineItem?.quantity || 0);

const Dashboard = () => {
  const [range, setRange] = useState("7d");
  const {
    data: products,
    error: productsError,
    isLoading: productsLoading,
    mutate: mutateProducts,
  } = useSWR("/products", fetcher, { revalidateOnFocus: false });

  const {
    data: orders,
    error: ordersError,
    isLoading: ordersLoading,
    mutate: mutateOrders,
  } = useSWR("/orders", fetcher, { revalidateOnFocus: false });

  const loading = productsLoading || ordersLoading;
  const error = productsError || ordersError;

  const liveData = useMemo(() => {
    const allProducts = Array.isArray(products) ? products : [];
    const allOrders = Array.isArray(orders) ? orders : [];

    const paidOrders = allOrders.filter(
      (order) => order.paymentStatus === "paid",
    );
    const unpaidOrders = allOrders.filter(
      (order) => order.paymentStatus == "unpaid",
    );
    const pendingOrders = allOrders.filter(
      (order) => order.status === "pending",
    );
    const dispatchedOrders = allOrders.filter(
      (order) => order.status === "dispatched",
    );
    const cancelledOrders = allOrders.filter(
      (order) => order.status === "cancelled",
    );

    const totalRevenue = paidOrders.reduce(
      (sum, order) => sum + Number(order.amount || 0),
      0,
    );
    const totalUsers = new Set(
      allOrders
        .map((order) => order.user?._id || order.user)
        .filter(Boolean)
        .map(String),
    ).size;

    const outOfStock = allProducts.filter(
      (product) => Number(product.stock || 0) === 0,
    );
    const lowStock = allProducts.filter(
      (product) =>
        Number(product.stock || 0) > 0 && Number(product.stock || 0) <= 10,
    );

    const revenueByDayMap = new Map();
    const days = range === "30d" ? 30 : range === "24h" ? 1 : 7;
    const now = new Date();

    for (let i = days - 1; i >= 0; i -= 1) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      revenueByDayMap.set(key, 0);
    }

    paidOrders.forEach((order) => {
      const dayKey = new Date(order.createdAt).toISOString().slice(0, 10);
      if (revenueByDayMap.has(dayKey)) {
        revenueByDayMap.set(
          dayKey,
          revenueByDayMap.get(dayKey) + Number(order.amount || 0),
        );
      }
    });

    const revenueTrend = Array.from(revenueByDayMap.entries()).map(
      ([key, revenue]) => ({
        name: new Date(key).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        }),
        revenue,
      }),
    );

    const categoryMap = new Map();
    allProducts.forEach((product) => {
      const key = product.category || "Other";
      categoryMap.set(
        key,
        (categoryMap.get(key) || 0) + Number(product.stock || 0),
      );
    });

    const categorySales = Array.from(categoryMap.entries())
      .map(([category, stock]) => ({ category, sales: stock }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 6);

    const productSalesMap = new Map();
    paidOrders.forEach((order) => {
      (order.products || []).forEach((line) => {
        const product = getProductDoc(line);
        const qnt = getQty(line);
        const id = product?._id || product?.id || String(product);
        const title = safeTitle(product);
        const stock = Number(product?.stock || 0);

        if (!productSalesMap.has(String(id))) {
          productSalesMap.set(String(id), { name: title, sold: 0, stock });
        }
        const current = productSalesMap.get(String(id));
        current.sold += qnt;
        if (stock !== undefined) current.stock = stock;
      });
    });

    const topProducts = Array.from(productSalesMap.values())
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5);

    const orderStatusData = [
      { name: "Paid", value: paidOrders.length, color: "#16a34a" },
      { name: "Unpaid", value: unpaidOrders.length, color: "#9a16a3" },
      { name: "Pending", value: pendingOrders.length, color: "#f59e0b" },
      { name: "Cancelled", value: cancelledOrders.length, color: "#ef4444" },
      { name: "Dispatched", value: dispatchedOrders.length, color: "#2563eb" },
    ];

    const recentOrders = [...allOrders]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    return {
      totalRevenue,
      paidOrders: paidOrders.length,
      unpaidOrders: unpaidOrders.length,
      pendingOrders: pendingOrders.length,
      dispatchedOrders: dispatchedOrders.length,
      cancelledOrders: cancelledOrders.length,
      totalProducts: allProducts.length,
      totalUsers,
      outOfStock: outOfStock.length,
      lowStock: lowStock.length,
      revenueTrend,
      orderStatusData,
      categorySales,
      topProducts,
      recentOrders,
      outOfStockProducts: outOfStock.slice(0, 5),
      lowStockProducts: lowStock.slice(0, 5),
    };
  }, [products, orders, range]);

  const statCards = [
    {
      label: "Total Revenue",
      value: currency(liveData.totalRevenue),
      sub: `${liveData.paidOrders} paid orders`,
      up: true,
      icon: <BadgeIndianRupee className="h-5 w-5" />,
    },
    {
      label: "Total Orders",
      value: String(Array.isArray(orders) ? orders.length : 0),
      sub: `${liveData.pendingOrders} pending`,
      up: true,
      icon: <ShoppingCart className="h-5 w-5" />,
    },
    {
      label: "Pending Orders",
      value: String(liveData.pendingOrders),
      sub: `${liveData.dispatchedOrders} dispatched`,
      up: false,
      icon: <Clock3 className="h-5 w-5" />,
    },
    {
      label: "Out of Stock",
      value: String(liveData.outOfStock),
      sub: "Needs restock",
      up: false,
      icon: <PackageX className="h-5 w-5" />,
    },
    {
      label: "Low Stock",
      value: String(liveData.lowStock),
      sub: "10 or fewer left",
      up: false,
      icon: <CircleAlert className="h-5 w-5" />,
    },
    {
      label: "Total Users",
      value: String(liveData.totalUsers),
      sub: "Placed at least one order",
      up: true,
      icon: <Users className="h-5 w-5" />,
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
        <Card className="max-w-xl rounded-3xl shadow-sm">
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900">
              Failed to load dashboard
            </p>
            <p className="mt-2 text-sm text-gray-500">{error.message}</p>
            <Button
              onClick={() => {
                mutateProducts();
                mutateOrders();
              }}
              className="mt-5"
              icon={<RefreshCw className="h-4 w-4" />}
            >
              Retry
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100 text-gray-900">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.06)] backdrop-blur-xl">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700">
                <Zap className="h-4 w-4 text-zinc-900" />
                Live Admin Dashboard · e-shop
              </div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl xl:text-5xl">
                Real-time overview of sales, orders, users, and inventory.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-600 sm:text-base">
                This dashboard is powered by your backend data. Revenue, order
                states, stock alerts, and top products are computed live from
                your products and orders APIs.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 shadow-sm">
                <p className="text-xs font-medium text-gray-500">
                  Selected Period
                </p>
                <select
                  value={range}
                  onChange={(e) => setRange(e.target.value)}
                  className="mt-1 w-full bg-transparent text-sm font-semibold outline-none"
                >
                  <option value="24h">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                </select>
              </div>

              <div className="rounded-2xl bg-zinc-900 px-5 py-4 text-white shadow-lg">
                <div className="flex items-center gap-2 text-sm text-zinc-300">
                  <Filter className="h-4 w-4" />
                  Live Snapshot
                </div>
                <div className="mt-1 text-2xl font-bold">Auto-updated</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          {statCards.map((stat) => (
            <div
              key={stat.label}
              className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="rounded-2xl bg-zinc-900 p-3 text-white shadow-sm">
                  {stat.icon}
                </div>
                <div
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                    stat.up
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-rose-50 text-rose-700"
                  }`}
                >
                  {stat.up ? (
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  ) : (
                    <ArrowDownRight className="h-3.5 w-3.5" />
                  )}
                  {stat.up ? "Healthy" : "Watch"}
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-500">{stat.label}</p>
              <p className="mt-1 text-2xl font-bold tracking-tight text-gray-900">
                {stat.value}
              </p>
              <p className="mt-1 text-xs text-gray-500">{stat.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm xl:col-span-2">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Revenue Trend
                </h2>
                <p className="text-sm text-gray-500">
                  Paid order revenue over time
                </p>
              </div>
            </div>
            {liveData.revenueTrend.length > 0 ? (
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={liveData.revenueTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 16,
                        border: "1px solid #e5e7eb",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#111827"
                      strokeWidth={3}
                      dot={{ r: 4, fill: "#111827" }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <Empty description="No paid orders yet" />
            )}
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="mb-5">
              <h2 className="text-xl font-bold text-gray-900">Order Status</h2>
              <p className="text-sm text-gray-500">Current breakdown</p>
            </div>
            {liveData.orderStatusData.some((x) => x.value > 0) ? (
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={liveData.orderStatusData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={72}
                      outerRadius={105}
                      paddingAngle={3}
                    >
                      {liveData.orderStatusData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: 16,
                        border: "1px solid #e5e7eb",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <Empty description="No order data yet" />
            )}
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm xl:col-span-2">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Category Stock
                </h2>
                <p className="text-sm text-gray-500">
                  Available stock by category
                </p>
              </div>
              <Boxes className="h-5 w-5 text-gray-400" />
            </div>
            {liveData.categorySales.length > 0 ? (
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={liveData.categorySales}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="category" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 16,
                        border: "1px solid #e5e7eb",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                      }}
                    />
                    <Bar
                      dataKey="sales"
                      radius={[12, 12, 0, 0]}
                      fill="#111827"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <Empty description="No product data yet" />
            )}
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Top Products
                </h2>
                <p className="text-sm text-gray-500">
                  Best sellers this period
                </p>
              </div>
              <TrendingUp className="h-5 w-5 text-gray-400" />
            </div>

            {liveData.topProducts.length > 0 ? (
              <div className="space-y-4">
                {liveData.topProducts.map((product) => (
                  <div
                    key={product.name}
                    className="rounded-2xl border border-gray-200 bg-gray-50 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900">
                          {product.name}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          Sold {product.sold} units
                        </p>
                      </div>
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        Trending
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                      <span>Stock</span>
                      <span>{product.stock} left</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-zinc-900"
                        style={{
                          width: `${Math.min((product.sold / 140) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Empty description="No paid sales yet" />
            )}
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Recent Orders
                </h2>
                <p className="text-sm text-gray-500">
                  Latest customer purchases
                </p>
              </div>
              <ShoppingBag className="h-5 w-5 text-gray-400" />
            </div>

            {liveData.recentOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-500">
                      <th className="pb-3 font-medium">Order</th>
                      <th className="pb-3 font-medium">Customer</th>
                      <th className="pb-3 font-medium">Amount</th>
                      <th className="pb-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {liveData.recentOrders.map((order) => {
                      const customer =
                        order.user?.fullname ||
                        order.user?.name ||
                        order.user ||
                        "Guest";
                      const status =
                        order.paymentStatus === "paid"
                          ? "Paid"
                          : order.status || "Pending";
                      return (
                        <tr
                          key={order._id}
                          className="border-b border-gray-100 last:border-b-0"
                        >
                          <td className="py-4 font-medium text-gray-900">
                            {order.sessionId?.slice(0, 10) ||
                              order._id?.slice(0, 10)}
                          </td>
                          <td className="py-4 text-gray-600">{customer}</td>
                          <td className="py-4 font-semibold text-gray-900">
                            {currency(order.amount)}
                          </td>
                          <td className="py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                status === "Paid"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : status === "Pending"
                                    ? "bg-amber-50 text-amber-700"
                                    : status === "Cancelled"
                                      ? "bg-rose-50 text-rose-700"
                                      : "bg-blue-50 text-blue-700"
                              }`}
                            >
                              {status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <Empty description="No orders found" />
            )}
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Stock Alerts
                </h2>
                <p className="text-sm text-gray-500">
                  Items that need attention
                </p>
              </div>
              <PackageCheck className="h-5 w-5 text-gray-400" />
            </div>

            <div className="space-y-4">
              {liveData.outOfStockProducts.length > 0 ||
              liveData.lowStockProducts.length > 0 ? (
                <>
                  {liveData.lowStockProducts.slice(0, 3).map((product) => (
                    <div
                      key={product._id}
                      className="flex items-center justify-between gap-4 rounded-2xl border border-gray-200 p-4"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900">
                          {product.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {product.category}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-rose-600">
                          {product.stock} left
                        </p>
                        <p className="text-xs text-gray-500">Restock soon</p>
                      </div>
                    </div>
                  ))}

                  {liveData.outOfStockProducts.slice(0, 3).map((product) => (
                    <div
                      key={product._id}
                      className="flex items-center justify-between gap-4 rounded-2xl border border-rose-200 bg-rose-50 p-4"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900">
                          {product.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {product.category}
                        </p>
                      </div>
                      <Tag color="red" className="!m-0 rounded-full">
                        Out of Stock
                      </Tag>
                    </div>
                  ))}
                </>
              ) : (
                <Empty description="No stock alerts" />
              )}
            </div>

            <div className="mt-5 rounded-2xl bg-zinc-900 p-5 text-white">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-zinc-300">Operational Health</p>
                  <h3 className="mt-1 text-2xl font-bold">
                    {liveData.outOfStock === 0 && liveData.lowStock === 0
                      ? "Excellent"
                      : "Needs Attention"}
                  </h3>
                </div>
                <PackageCheck className="h-6 w-6 text-emerald-400" />
              </div>
              <p className="mt-3 text-sm leading-6 text-zinc-300">
                Revenue, order tracking, and inventory metrics are all driven by
                live backend data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

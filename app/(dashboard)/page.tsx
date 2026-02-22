"use client";

import { useEffect, useMemo, useState } from "react";
import { Separator } from "@/components/ui/separator";
import Loader from "@/components/custom ui/Loader";
import { useLiveUpdates } from "@/lib/useLiveUpdates";

type DashboardSummary = {
  kpis: {
    revenue30d: number;
    orders30d: number;
    productsActive: number;
    conversionRate: number;
  };
  regionalRevenue: { region: string; value: number }[];
  currencyMix: { currency: string; value: number }[];
  fulfillment: { status: string; count: number }[];
  dailyRevenue: { day: string; value: number }[];
  recentOrders: {
    _id: string;
    customer: string;
    country: string;
    totalAmount: number;
    currency: string;
    status: string;
    createdAt: string;
  }[];
};

const MetricCard = ({ title, value }: { title: string; value: string | number }) => (
  <div className="rounded-xl border bg-white p-5 shadow-sm">
    <p className="text-sm text-grey-1">{title}</p>
    <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
  </div>
);

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);

  const getSummary = async () => {
    try {
      const res = await fetch("/api/dashboard/summary", {
        method: "GET",
        cache: "no-store",
      });
      if (!res.ok) {
        throw new Error(await res.text());
      }
      const data = await res.json();
      setSummary(data);
    } catch (err) {
      console.log("[dashboard_summary_GET]", err);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getSummary();
  }, []);

  useLiveUpdates(getSummary);

  const maxRegional = useMemo(
    () =>
      Math.max(
        1,
        ...(summary?.regionalRevenue.map((item) => item.value) ?? [1])
      ),
    [summary]
  );

  if (loading) return <Loader />;

  return (
    <div className="px-10 py-6">
      <p className="text-heading2-bold">Global Commerce Overview</p>
      <p className="mt-2 text-sm text-grey-1">Auto-refreshes every 30 seconds</p>
      <Separator className="my-6 bg-black/10" />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Revenue (30d)"
          value={summary ? summary.kpis.revenue30d.toLocaleString() : "-"}
        />
        <MetricCard
          title="Orders (30d)"
          value={summary ? summary.kpis.orders30d : "-"}
        />
        <MetricCard
          title="Products Active"
          value={summary ? summary.kpis.productsActive : "-"}
        />
        <MetricCard
          title="Conversion Rate"
          value={summary ? `${summary.kpis.conversionRate}%` : "-"}
        />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <div className="rounded-xl border bg-white p-5 shadow-sm xl:col-span-2">
          <p className="text-base font-semibold text-slate-900">Regional Revenue Split</p>
          {summary && summary.regionalRevenue.length > 0 ? (
            <div className="mt-4 space-y-3">
              {summary.regionalRevenue.map((item) => (
                <div key={item.region}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <p className="text-slate-700">{item.region}</p>
                    <p className="font-medium text-slate-900">{item.value.toLocaleString()}</p>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-slate-800"
                      style={{ width: `${(item.value / maxRegional) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-6 py-10 text-center text-sm text-slate-500">No regional data yet.</p>
          )}
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-base font-semibold text-slate-900">Currency Mix</p>
          {summary && summary.currencyMix.length > 0 ? (
            <div className="mt-4 space-y-2">
              {summary.currencyMix.map((item) => (
                <div key={item.currency} className="flex items-center justify-between text-sm">
                  <p className="text-slate-700">{item.currency}</p>
                  <p className="font-medium text-slate-900">{item.value.toLocaleString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-6 py-10 text-center text-sm text-slate-500">No currency data yet.</p>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-base font-semibold text-slate-900">Fulfillment Pipeline</p>
          {summary && summary.fulfillment.length > 0 ? (
            <div className="mt-4 space-y-2">
              {summary.fulfillment.map((item) => (
                <div key={item.status} className="flex items-center justify-between text-sm">
                  <p className="text-slate-700">{item.status}</p>
                  <p className="font-medium text-slate-900">{item.count}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-6 py-10 text-center text-sm text-slate-500">No fulfillment data yet.</p>
          )}
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm xl:col-span-2">
          <p className="text-base font-semibold text-slate-900">Recent Orders</p>
          {summary && summary.recentOrders.length > 0 ? (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-[700px] w-full text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-2 text-xs font-medium text-slate-600">Order</th>
                    <th className="px-3 py-2 text-xs font-medium text-slate-600">Customer</th>
                    <th className="px-3 py-2 text-xs font-medium text-slate-600">Country</th>
                    <th className="px-3 py-2 text-xs font-medium text-slate-600">Total</th>
                    <th className="px-3 py-2 text-xs font-medium text-slate-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.recentOrders.map((order) => (
                    <tr key={order._id} className="border-t">
                      <td className="px-3 py-2 text-sm">{order._id}</td>
                      <td className="px-3 py-2 text-sm">{order.customer}</td>
                      <td className="px-3 py-2 text-sm">{order.country}</td>
                      <td className="px-3 py-2 text-sm">
                        {order.currency} {order.totalAmount.toLocaleString()}
                      </td>
                      <td className="px-3 py-2 text-sm">{order.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-6 py-10 text-center text-sm text-slate-500">No recent orders yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

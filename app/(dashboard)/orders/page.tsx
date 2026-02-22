"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/custom ui/DataTable";
import Loader from "@/components/custom ui/Loader";
import { Separator } from "@/components/ui/separator";
import { columns } from "@/components/orders/OrderColumns";
import { useLiveUpdates } from "@/lib/useLiveUpdates";

const Orders = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<OrderColumnType[]>([]);

  const getOrders = async () => {
    try {
      const res = await fetch("/api/orders", { method: "GET", cache: "no-store" });
      if (!res.ok) {
        throw new Error(await res.text());
      }
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.log("[orders_GET]", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getOrders();
  }, []);

  useLiveUpdates(getOrders);

  if (loading) return <Loader />;

  return (
    <div className="px-10 py-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-heading2-bold">Orders</p>
          <p className="mt-2 text-sm text-grey-1">Cross-border orders and fulfillment status</p>
        </div>
      </div>
      <Separator className="my-6 bg-black/10" />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-grey-1">Total Orders</p>
          <p className="mt-2 text-2xl font-semibold">{orders.length}</p>
        </div>
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-grey-1">Countries</p>
          <p className="mt-2 text-2xl font-semibold">
            {new Set(orders.map((order) => order.country)).size}
          </p>
        </div>
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-grey-1">Gross Volume</p>
          <p className="mt-2 text-2xl font-semibold">
            {orders.reduce((sum, order) => sum + order.totalAmount, 0).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-xl border bg-white p-4 shadow-sm">
        <DataTable columns={columns} data={orders} searchKey="customer" />
      </div>
    </div>
  );
};

export default Orders;

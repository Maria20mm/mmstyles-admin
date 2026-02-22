"use client";

import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import Loader from "@/components/custom ui/Loader";
import { useLiveUpdates } from "@/lib/useLiveUpdates";

const Customers = () => {
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<CustomerType[]>([]);

  const getCustomers = async () => {
    try {
      const res = await fetch("/api/customers", { method: "GET", cache: "no-store" });
      if (!res.ok) {
        throw new Error(await res.text());
      }
      const data = await res.json();
      setCustomers(data);
    } catch (err) {
      console.log("[customers_GET]", err);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCustomers();
  }, []);

  useLiveUpdates(getCustomers);

  if (loading) return <Loader />;

  return (
    <div className="px-10 py-6">
      <p className="text-heading2-bold">Customers</p>
      <p className="mt-2 text-sm text-grey-1">Global customer directory</p>
      <Separator className="my-6 bg-black/10" />

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-sm font-medium text-slate-700">Customer ID</th>
              <th className="px-4 py-3 text-sm font-medium text-slate-700">Name</th>
              <th className="px-4 py-3 text-sm font-medium text-slate-700">Email</th>
              <th className="px-4 py-3 text-sm font-medium text-slate-700">Country</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr className="border-t">
                <td colSpan={4} className="px-4 py-10 text-center text-sm text-slate-500">
                  No customers yet.
                </td>
              </tr>
            ) : (
              customers.map((customer) => (
                <tr key={customer._id || customer.email} className="border-t">
                  <td className="px-4 py-3 text-sm">{customer.clerkId || "-"}</td>
                  <td className="px-4 py-3 text-sm">{customer.name}</td>
                  <td className="px-4 py-3 text-sm">{customer.email}</td>
                  <td className="px-4 py-3 text-sm">{customer.country || "Unknown"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Customers;

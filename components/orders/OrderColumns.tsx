"use client";

import { ColumnDef } from "@tanstack/react-table";

export const columns: ColumnDef<OrderColumnType>[] = [
  {
    accessorKey: "_id",
    header: "Order ID",
  },
  {
    accessorKey: "customer",
    header: "Customer",
  },
  {
    accessorKey: "country",
    header: "Country",
  },
  {
    accessorKey: "products",
    header: "Items",
  },
  {
    accessorKey: "totalAmount",
    header: "Total",
    cell: ({ row }) =>
      `${row.original.currency} ${row.original.totalAmount.toLocaleString()}`,
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "createdAt",
    header: "Created",
  },
];

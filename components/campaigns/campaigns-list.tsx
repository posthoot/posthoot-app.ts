'use client';
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";

type Campaign = {
  id: string;
  name: string;
  status: string;
  sent: number;
  total: number;
  openRate: string;
  clickRate: string;
}

const campaigns = [
  {
    id: "1", 
    name: "Welcome Series",
    status: "Active",
    sent: 150,
    total: 300,
    openRate: "45%",
    clickRate: "12%",
  },
  {
    id: "2",
    name: "Monthly Newsletter", 
    status: "Draft",
    sent: 0,
    total: 500,
    openRate: "0%",
    clickRate: "0%",
  },
];

const columns: ColumnDef<Campaign>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge variant={status === "Active" ? "default" : "secondary"}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "sent",
    header: "Progress",
    cell: ({ row }) => {
      const sent = row.getValue("sent") as number;
      const total = row.original.total;
      return `${sent} of ${total} sent`;
    },
  },
  {
    accessorKey: "openRate",
    header: "Open Rate",
  },
  {
    accessorKey: "clickRate", 
    header: "Click Rate",
  },
];

export function CampaignsList() {
  return <DataTable columns={columns} data={campaigns} />;
}
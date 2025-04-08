"use client";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "../ui/button";
import { Edit, Mail, MoreHorizontal, Trash } from "lucide-react";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { useCampaigns } from "@/app/providers/campaigns-provider";
import { Campaign } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useRouter } from "next/navigation";

export function CampaignsList() {
  const {
    campaigns,
    refetch,
    loading: isLoading,
    total,
    page,
    limit,
    setPage,
    setLimit,
  } = useCampaigns();
  const router = useRouter();
  const deleteCampaign = async (id: string) => {
    const campaign = await fetch(`/api/campaigns/${id}`, {
      method: "DELETE",
    });

    if (campaign.ok) {
      refetch();
      return toast({
        title: "Success",
        description: "Campaign deleted successfully",
      });
    }

    return toast({
      title: "Error",
      description: "Error deleting campaign",
      variant: "destructive",
    });
  };

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
          <Badge variant={status === "SCHEDULED" ? "default" : "secondary"}>
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "schedule",
      header: "Frequency",
      cell: ({ row }) => {
        const schedule = row.getValue("schedule") as string;
        return schedule;
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => {
        const createdAt = row.getValue("createdAt") as Date;
        return format(new Date(createdAt), "PPP");
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {row.getValue("status") === "SCHEDULED" && (
                <DropdownMenuItem
                  onClick={() => {}} // sendCampaign(row.original.id)}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Send Now
                </DropdownMenuItem>
              )}
              {row.getValue("status") === "SCHEDULED" ||
                (row.getValue("status") === "DRAFT" && (
                  <DropdownMenuItem
                    onClick={() => {
                      router.push(`/campaigns/${row.original.id}`);
                    }}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Campaign
                  </DropdownMenuItem>
                ))}
              <DropdownMenuSeparator />
              {row.getValue("status") !== "SENDING" && (
                <DropdownMenuItem
                  onClick={() => deleteCampaign(row.original.id)}
                  className="text-red-500"
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete Campaign
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <DataTable
      pagination={true}
      onPaginationChange={(pagination: {
        pageIndex: number;
        pageSize: number;
      }) => {
        setPage(pagination.pageIndex);
        setLimit(pagination.pageSize);
      }}
      totalRows={total}
      isLoading={isLoading}
      pageIndex={page}
      pageSize={limit}
      columns={columns as any}
      data={campaigns}
    />
  );
}

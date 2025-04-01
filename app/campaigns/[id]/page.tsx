"use client";

import { Suspense, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CampaignsProvider,
  useCampaigns,
} from "@/app/providers/campaigns-provider";
import { Campaign } from "@/types";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const CampaignViewPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const router = useRouter();
  const { id } = use(params);
  const { getCampaign, refetch, campaign } = useCampaigns();

  useEffect(() => {
    console.log("id data", id);
    getCampaign(id as string);
  }, [id]);

  useEffect(() => {
    if (!campaign) {
      toast.error("Campaign not found");
    }
  }, [campaign]);

  const handleDelete = async () => {
    const response = await fetch(`/api/campaigns/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      toast.success("Campaign deleted successfully");
      refetch();
      router.push("/campaigns");
    } else {
      toast.error("Error deleting campaign");
    }
  };

  if (!campaign) return <div>Loading...</div>;

  return (
    <div className="container mx-auto">
      <PageHeader heading={campaign.name}>
        <div className="flex gap-2 items-center">
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete Campaign
          </Button>
        </div>
      </PageHeader>
      <div className="mt-4 px-8">
        <h2 className="text-2xl font-semibold">Details</h2>
        <p>
          <strong>Status:</strong> {campaign.status}
        </p>
        <p>
          <strong>Created At:</strong> {campaign.createdAt.toLocaleString()}
        </p>
        <p>
          <strong>Description:</strong> {campaign.description}
        </p>
        <p>
          <strong>Schedule:</strong> {campaign.schedule}
        </p>
        <p>
          <strong>Scheduled For:</strong>{" "}
          {campaign.scheduledFor?.toLocaleString()}
        </p>
        <p>
          <strong>Recurring Schedule:</strong> {campaign.recurringSchedule}
        </p>
        <p>
          <strong>Cron Expression:</strong> {campaign.cronExpression}
        </p>
      </div>
    </div>
  );
};

const CampaignViewPageWrapper = ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CampaignsProvider>
        <CampaignViewPage params={params} />
      </CampaignsProvider>
    </Suspense>
  );
};

export default CampaignViewPageWrapper;

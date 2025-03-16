"use client";

import { Button } from "@/components/ui/button";
import { useForms } from "@/app/providers/forms-provider";
import { useMailingLists } from "@/app/providers/mailinglist-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { format } from "date-fns";
import { PageHeader } from "@/components/page-header";

export default function FormsPage() {
  const { forms, isLoading } = useForms();
  const { lists } = useMailingLists();

  return (
    <div className="container mx-auto">
      <PageHeader heading="Other forms">
        <Link href="/forms/new">
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" />
            Create form
          </Button>
        </Link>
      </PageHeader>

      <div className="flex bg-primary/10 p-16 items-center gap-4 justify-between">
        <div className="flex flex-col w-1/2 gap-2">
          <span className="text-4xl font-semibold">
            Transform site visitors into email subscribers
          </span>
          <span className="text-muted-foreground font-inter">
            Grow your audience with customizable forms while gathering data to
            personalize your marketing.
          </span>
        </div>
        <img
          src="https://ouch-cdn2.icons8.com/pH0dDQiwxlwXEzfiOsEhlSdpv1US9Twcij9ftQxKUzo/rs:fit:608:456/czM6Ly9pY29uczgu/b3VjaC1wcm9kLmFz/c2V0cy9zdmcvNjg5/L2E0M2QyM2U0LTQy/NjEtNDhjYi1hNDQw/LTc5MmZkMTQ0Njkx/YS5zdmc.png"
          alt=""
          width={200}
        />
      </div>

      <div className="mb-12 p-8">
        <h2 className="text-2xl font-semibold mb-4">Recent forms</h2>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="w-full">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-1/2 mb-2" />
                  <Skeleton className="h-4 w-1/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : forms.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <h3 className="text-xl font-semibold mb-2">No forms yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first form to start collecting subscribers
              </p>
              <Button asChild>
                <Link href="/forms/new">
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Create form
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {forms.map((form) => (
              <Card key={form.id}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <Link
                      href={`/forms/${form.id}`}
                      className="hover:underline"
                    >
                      {form.name}
                    </Link>
                    <span className="text-xs text-muted-foreground capitalize px-2 py-1 bg-secondary rounded">
                      {form.status}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">
                    {form.description || "No description"}
                  </p>
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>
                      Created {format(new Date(form.createdAt), "MMM d, yyyy")}
                    </span>
                    <span>
                      {form.mailingListId
                        ? `Connected to ${
                            lists.find((l) => l.id === form.mailingListId)?.name
                          }`
                        : "No mailing list"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

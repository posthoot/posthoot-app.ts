"use client";

import * as React from "react";
import {
  AlertCircle,
  Archive,
  ArchiveX,
  File,
  Inbox,
  MessagesSquare,
  Search,
  Send,
  ShoppingCart,
  Trash2,
  Users2,
} from "lucide-react";
import { useInfiniteQuery } from "@tanstack/react-query";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TooltipProvider } from "@/components/ui/tooltip";
import MailDisplay from "@/app/developer/logs/emails/components/mail-display";
import MailList from "@/app/developer/logs/emails/components/mail-list";
import { type Mail } from "@/app/types";
import { useMail } from "@/hooks/use-mail";

const PAGE_SIZE = 20;

async function fetchEmails({ pageParam = 0, filter = "SENT" }) {
  // Replace with your actual API endpoint
  const response = await fetch(
    `/api/emails?page=${pageParam}&filter=${filter}&limit=${PAGE_SIZE}`
  );
  const data = await response.json();
  return {
    results: data.data,
    offset: data.page * PAGE_SIZE,
    total: data.total,
  };
}

export default function Mail() {
  const defaultLayout = [265, 440, 655]
  const { mail } = useMail();
  const [activeTab, setActiveTab] = React.useState("SENT");
  const [search, setSearch] = React.useState("");
  const [searchTimeout, setSearchTimeout] =
    React.useState<NodeJS.Timeout | null>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status, isLoading } =
    useInfiniteQuery({
      queryKey: ["emails", activeTab],
      queryFn: ({ pageParam }) => fetchEmails({ pageParam, filter: activeTab }),
      getNextPageParam: (lastPage, pages) => {
        return lastPage.offset + PAGE_SIZE < lastPage.total
          ? pages.length + 1
          : undefined;
      },
      initialPageParam: 0,
    });

  const emails = data?.pages.flatMap((page) => page.results) || [];

  // Intersection Observer for infinite scroll
  const observerTarget = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.2 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <TooltipProvider delayDuration={0}>
      <ResizablePanelGroup
        direction="horizontal"
        onLayout={(sizes: number[]) => {
          document.cookie = `react-resizable-panels:layout=${JSON.stringify(
            sizes
          )}`;
        }}
        className="!h-[calc(100vh-100px)] !max-h-[calc(100vh-100px)] overflow-hidden items-stretch"
      >
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-center px-4 py-2">
              <h1 className="text-xl font-bold">Outbox</h1>
              <TabsList className="ml-auto">
                <TabsTrigger
                  onClick={() => setActiveTab("SENT")}
                  value="SENT"
                  className="text-zinc-600 dark:text-zinc-200"
                >
                  Sent
                </TabsTrigger>
                <TabsTrigger
                  onClick={() => setActiveTab("PENDING")}
                  value="PENDING"
                  className="text-zinc-600 dark:text-zinc-200"
                >
                  Pending
                </TabsTrigger>
              </TabsList>
            </div>
            <Separator />
            <div className="bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <form>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search"
                    className="pl-8"
                  />
                </div>
              </form>
            </div>
            <TabsContent value="SENT" className="m-0">
              {isLoading ? (
                <div className="text-center p-4">Loading...</div>
              ) : (
                <>
                  <MailList items={emails} />
                  <div ref={observerTarget} className="h-4" />
                  {isFetchingNextPage && (
                    <div className="text-center p-4">Loading more...</div>
                  )}
                </>
              )}
            </TabsContent>
            <TabsContent value="PENDING" className="m-0">
              {isLoading ? (
                <div className="text-center p-4">Loading...</div>
              ) : (
                <>
                  <MailList items={emails} />
                  <div ref={observerTarget} className="h-4" />
                  {isFetchingNextPage && (
                    <div className="text-center p-4">Loading more...</div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={defaultLayout[2]} minSize={30}>
          {isLoading ? (
            <div className="text-center p-4">Loading...</div>
          ) : (
            <MailDisplay mail={mail} />
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </TooltipProvider>
  );
}

"use client";

import * as React from "react";
import {
  Archive,
  ArchiveX,
  FileIcon,
  Inbox,
  MailX,
  Search,
  Send,
  Trash2,
} from "lucide-react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

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
import { cn } from "@/lib/utils";
import { Nav } from "./components/nav";
import { IMAPEmail, IMAPEmailResponse } from "../api/imap/emails/route";

const PAGE_SIZE = 20;

async function fetchFolders() {
  const response = await fetch(`/api/imap/folders`);
  const data = await response.json();
  const folders = data.folders;
  // we need to sort the foldesr we need to put inbox first
  const sortedFolders = folders.sort(
    (a: { Name: string }, b: { Name: string }) => {
      if (a.Name.toUpperCase().includes("INBOX")) return -1;
      if (b.Name.toUpperCase().includes("INBOX")) return 1;
      return 0;
    }
  );
  return sortedFolders;
}

async function fetchEmails({ pageParam = 1, folder = "INBOX" }) {
  const response = await fetch(
    `/api/imap/emails?page=${pageParam}&folder=${folder}&limit=${PAGE_SIZE}`
  );
  const data: IMAPEmailResponse = await response.json();
  return {
    results: data.emails,
    offset: data.offset,
    total: data.total_emails,
    limit: data.limit,
  };
}

export default function Mail() {
  const defaultLayout = [265, 440, 655];
  const { mail } = useMail();
  const [activeTab, setActiveTab] = React.useState("INBOX");
  const [search, setSearch] = React.useState("");
  const [searchTimeout, setSearchTimeout] =
    React.useState<NodeJS.Timeout | null>(null);

  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["emails", activeTab],
    queryFn: ({ pageParam }) => fetchEmails({ pageParam, folder: activeTab }),
    getNextPageParam: (lastPage, pages) => {
      return lastPage.offset + PAGE_SIZE < lastPage.total
        ? pages.length + 1
        : undefined;
    },
    initialPageParam: 0,
  });

  const { data: folders, isLoading: isFoldersLoading } = useQuery({
    queryKey: ["folders"],
    queryFn: fetchFolders,
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

  const getTentativeIcon = (name: string) => {
    name = name.toUpperCase();
    if (name.includes("INBOX")) {
      return Inbox;
    }
    if (name.includes("SENT")) {
      return Send;
    }
    if (name.includes("DRAFTS")) {
      return FileIcon;
    }
    if (name.includes("JUNK") || name.includes("SPAM")) {
      return ArchiveX;
    }
    if (name.includes("TRASH") || name.includes("DELETED")) {
      return Trash2;
    }
    if (name.includes("ARCHIVE")) {
      return Archive;
    }
    return Inbox;
  };

  return (
    <TooltipProvider delayDuration={0}>
      <ResizablePanelGroup
        direction="horizontal"
        onLayout={(sizes: number[]) => {
          document.cookie = `react-resizable-panels:layout=${JSON.stringify(
            sizes
          )}`;
        }}
        className="!h-[calc(100vh-70px)] !max-h-[calc(100vh-70px)] overflow-hidden items-stretch"
      >
        <ResizableHandle withHandle />
        <ResizablePanel
          defaultSize={defaultLayout[0]}
          collapsedSize={4}
          collapsible={true}
          minSize={15}
          maxSize={20}
          onCollapse={() => {
            setIsCollapsed(true);
            document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(
              true
            )}`;
          }}
          className={cn(
            isCollapsed &&
              "min-w-[50px] transition-all duration-300 ease-in-out"
          )}
        >
          <div
            className={cn(
              "flex h-[52px] items-center justify-center",
              isCollapsed ? "h-[52px]" : "px-2"
            )}
          ></div>
          <Separator />
          {!isFoldersLoading && (
            <Nav
              isCollapsed={isCollapsed}
              onSelect={(folder) => {
                setActiveTab(folder);
              }}
              links={folders?.map(
                (folder: { Name: string; Total: number }) => ({
                  title: folder.Name,
                  label: folder.Total,
                  icon: getTentativeIcon(folder.Name),
                  variant: folder.Name === activeTab ? "default" : "ghost",
                })
              )}
            />
          )}

          {isFoldersLoading && (
            <div className="text-center p-4">Loading...</div>
          )}
          <Separator />
        </ResizablePanel>
        <ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-center px-4 py-3 relative">
              <h1 className="text-xl font-bold">Inbox</h1>
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

            {isLoading ? (
              <div className="text-center p-4">Loading...</div>
            ) : (
              <MailList
                items={emails}
                isFetchingNextPage={isFetchingNextPage}
                observerTarget={observerTarget}
              />
            )}
          </Tabs>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={defaultLayout[2]} minSize={30}>
          {isLoading ? (
            <div className="text-center p-4">Loading...</div>
          ) : (
            <MailDisplay fetchMail={false} mail={mail as IMAPEmail} />
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </TooltipProvider>
  );
}

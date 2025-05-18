import { addDays } from "date-fns";
import { addHours } from "date-fns";
import { format } from "date-fns";
import { nextSaturday } from "date-fns";
import {
  Archive,
  ArchiveX,
  Clock,
  Forward,
  MoreVertical,
  Reply,
  ReplyAll,
  Trash2,
} from "lucide-react";

import {
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Mail } from "@/app/types";
import { useQuery } from "@tanstack/react-query";
import { extract } from "letterparser";
import { Letter } from "react-letter";
import { IMAPEmail } from "@/app/api/imap/emails/route";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { parsedMailFrom } from "../utils";

interface MailDisplayProps {
  mail: IMAPEmail | Mail | null;
  fetchMail?: boolean;
}

export default function MailDisplay({
  mail,
  fetchMail = true,
}: MailDisplayProps) {
  const today = new Date();
  const [reply, setReply] = useState("");
  const getMail = async (id: string) => {
    const response = await fetch(`/api/emails?id=${id}`);
    const data = await response.json();
    return { ...data.data?.[0] };
  };

  const getParsedMail = (email: { body: string }) => {
    const decodedBody = email?.body;
    const { html, text } = extract(`Date: Wed, 01 Apr 2020 00:00:00 -0000
From: A <a@example.com>
To: B <b@example.com>
Subject: Hello world!
Mime-Version: 1.0
Content-Type: text/html; charset=utf-8 

${decodedBody}
`);

    return { html, text };
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let email = extractEmail(mailToRender?.replyTo ?? mailToRender?.from);
    const response = await fetch(`/api/email`, {
      method: "POST",
      body: JSON.stringify({
        email,
        html: `
        ${reply}
        <div style="padding: 20px; border-left: 2px solid #ccc; margin: 10px 0;">
          <div style="color: #666; margin-bottom: 10px;">On ${format(new Date(mailToRender?.createdAt ?? mailToRender?.date), "PPpp")}, ${mailToRender?.from} wrote:</div>
          ${getParsedMail(mailToRender)}
        </div>
        `,
        cc: mailToRender?.cc
          ?.split(",")
          .filter((cc) => cc !== email && cc !== "N/A"),
        bcc: mailToRender?.bcc
          ?.split(",")
          .filter((bcc) => bcc !== email && bcc !== "N/A"),
        subject: mailToRender?.subject ?? "Reply to email",
      }),
    });
    if (!response.ok) {
      toast.error("Failed to send email");
      return;
    }
    toast.success("Email sent successfully");
    setReply("");
  };

  const { data: fetchedMail } = useQuery({
    queryKey: ["mail", mail?.id],
    queryFn: () => getMail(mail?.id),
    enabled: !!mail?.id && fetchMail,
  });

  const extractEmail = (email: string) => {
    const emailRegex = /<([^>]+)>/;
    const match = email.match(emailRegex);
    console.log("match", match);
    return match ? match[1] : email;
  };

  const mailToRender = useMemo(() => {
    if (fetchMail) {
      return fetchedMail;
    }
    return mail;
  }, [mail, fetchedMail, fetchMail]);

  return (
    <div className="flex h-full flex-col">
      {!fetchMail && (
        <>
          <div className="flex items-center p-2">
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" disabled={!fetchedMail}>
                    <Archive className="h-4 w-4" />
                    <span className="sr-only">Archive</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Archive</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" disabled={!fetchedMail}>
                    <ArchiveX className="h-4 w-4" />
                    <span className="sr-only">Move to junk</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Move to junk</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" disabled={!fetchedMail}>
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Move to trash</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Move to trash</TooltipContent>
              </Tooltip>
              <Separator orientation="vertical" className="mx-1 h-6" />
              <Tooltip>
                <Popover>
                  <PopoverTrigger asChild>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={!fetchedMail}
                      >
                        <Clock className="h-4 w-4" />
                        <span className="sr-only">Snooze</span>
                      </Button>
                    </TooltipTrigger>
                  </PopoverTrigger>
                  <PopoverContent className="flex w-[535px] p-0">
                    <div className="flex flex-col gap-2 border-r px-2 py-4">
                      <div className="px-4 text-sm font-medium">
                        Snooze until
                      </div>
                      <div className="grid min-w-[250px] gap-1">
                        <Button
                          variant="ghost"
                          className="justify-start font-normal"
                        >
                          Later today{" "}
                          <span className="ml-auto text-muted-foreground">
                            {format(addHours(today, 4), "E, h:m b")}
                          </span>
                        </Button>
                        <Button
                          variant="ghost"
                          className="justify-start font-normal"
                        >
                          Tomorrow
                          <span className="ml-auto text-muted-foreground">
                            {format(addDays(today, 1), "E, h:m b")}
                          </span>
                        </Button>
                        <Button
                          variant="ghost"
                          className="justify-start font-normal"
                        >
                          This weekend
                          <span className="ml-auto text-muted-foreground">
                            {format(nextSaturday(today), "E, h:m b")}
                          </span>
                        </Button>
                        <Button
                          variant="ghost"
                          className="justify-start font-normal"
                        >
                          Next week
                          <span className="ml-auto text-muted-foreground">
                            {format(addDays(today, 7), "E, h:m b")}
                          </span>
                        </Button>
                      </div>
                    </div>
                    <div className="p-2">
                      <Calendar />
                    </div>
                  </PopoverContent>
                </Popover>
                <TooltipContent>Snooze</TooltipContent>
              </Tooltip>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" disabled={!mailToRender}>
                    <Reply className="h-4 w-4" />
                    <span className="sr-only">Reply</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Reply</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" disabled={!mailToRender}>
                    <ReplyAll className="h-4 w-4" />
                    <span className="sr-only">Reply all</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Reply all</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" disabled={!mailToRender}>
                    <Forward className="h-4 w-4" />
                    <span className="sr-only">Forward</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Forward</TooltipContent>
              </Tooltip>
            </div>
            <Separator orientation="vertical" className="mx-2 h-6" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" disabled={!mailToRender}>
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">More</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Mark as unread</DropdownMenuItem>
                <DropdownMenuItem>Star thread</DropdownMenuItem>
                <DropdownMenuItem>Add label</DropdownMenuItem>
                <DropdownMenuItem>Mute thread</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Separator />
        </>
      )}
      {mail ? (
        <div className="flex flex-1 flex-col">
          <div className="flex items-start p-4">
            <div className="flex items-start gap-4 text-sm">
              <Avatar>
                <AvatarImage alt={parsedMailFrom(mailToRender)} />
                <AvatarFallback>
                  {parsedMailFrom(mailToRender)
                    ?.split(" ")
                    .map((chunk) => chunk[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <div className="font-semibold">
                  {parsedMailFrom(mailToRender)}
                </div>
                <div className="line-clamp-1 text-xs">
                  {mailToRender?.subject}
                </div>
                <div className="line-clamp-1 text-xs">
                  <span className="font-medium">Reply-To:</span>{" "}
                  {mailToRender?.replyTo}
                </div>
              </div>
            </div>
            {(mailToRender?.createdAt || mailToRender?.date) && (
              <div className="ml-auto text-xs text-muted-foreground">
                {format(
                  new Date(mailToRender.createdAt ?? mailToRender.date),
                  "PPpp"
                )}
              </div>
            )}
          </div>
          <Separator />
          <Letter html={getParsedMail(mailToRender).html} />
          <Separator className="mt-auto" />
          {!fetchMail && (
            <div className="p-4">
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4">
                  <Textarea
                    className="p-4"
                    name="reply"
                    onChange={(e) => {
                      setReply(e.target.value);
                    }}
                    placeholder={`Reply ${mailToRender?.from}...`}
                  />
                  <div className="flex items-center">
                    <Label
                      htmlFor="mute"
                      className="flex items-center gap-2 text-xs font-normal"
                    >
                      <Switch id="mute" aria-label="Mute thread" /> Mute this
                      thread
                    </Label>
                    <Button type="submit" size="sm" className="ml-auto">
                      Send
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      ) : (
        <div className="p-8 text-center text-muted-foreground">
          No message selected
        </div>
      )}
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { XIcon } from "lucide-react";
import { EnvelopeClosedIcon, PersonIcon } from "@radix-ui/react-icons";

export default function AudiencePage() {
  return (
    <div className="container mx-auto py-8 px-8">
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">TheBoringTeam</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>
                <strong className="text-[#007C89]">2</strong> total contacts
              </span>
              <span>
                <strong className="text-[#007C89]">2</strong> email subscribers
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">View Contacts</Button>
            <Button>Manage Audience</Button>
          </div>
        </div>

        {/* Messages Inbox */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <EnvelopeClosedIcon className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <h3 className="font-medium">Messages Inbox</h3>
                <p className="text-sm text-muted-foreground">
                  You've received 0 messages in the last 30 days.
                </p>
              </div>
              <Button variant="link" className="text-[#007C89]">
                View Inbox
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* QuickBooks Integration */}
        <Card className="bg-[#E7FFE9] border-none">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded bg-white p-2">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/QuickBooks_Logo.svg/2560px-QuickBooks_Logo.svg.png"
                  alt="QuickBooks"
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">Try the QuickBooks Online integration</h3>
                    <p className="text-sm text-muted-foreground">
                      Automatically sync your QuickBooks Online customers and sales data to your Mailchimp account.
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground"
                  >
                    <XIcon className="h-4 w-4" />
                  </Button>
                </div>
                <Button variant="outline" className="mt-4 bg-white">
                  Connect accounts
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-6">
          {/* Recent Growth */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <PersonIcon className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-base">Recent growth</CardTitle>
              </div>
              <CardDescription>
                New contacts added to this audience in the last 30 days.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="text-3xl font-semibold">2</div>
                  <div className="text-sm text-muted-foreground">New Contacts</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    From February 15, 2025 to March 17, 2025
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-[#FF8C61]" />
                      <span className="text-sm">Subscribed</span>
                    </div>
                    <span className="text-sm">2</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-gray-300" />
                      <span className="text-sm">Non-Subscribed</span>
                    </div>
                    <span className="text-sm">0</span>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium mb-2">
                    Where your contacts came from:
                  </div>
                  <div className="h-2 w-full rounded-full bg-[#FF8C61]" />
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span>100%</span>
                      <span>Admin Add</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full border flex items-center justify-center">
                      +
                    </div>
                    <div className="flex-1">
                      <Button variant="link" className="h-auto p-0 text-[#007C89]">
                        Add a pop-up form
                      </Button>
                      <p className="text-sm text-muted-foreground">
                        to your site and collect contacts up to 50% faster.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full border flex items-center justify-center">
                      +
                    </div>
                    <div className="flex-1">
                      <Button variant="link" className="h-auto p-0 text-[#007C89]">
                        Create a landing page
                      </Button>
                      <p className="text-sm text-muted-foreground">
                        to collect new contacts or promote your product.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full border flex items-center justify-center">
                      +
                    </div>
                    <div className="flex-1">
                      <Button variant="link" className="h-auto p-0 text-[#007C89]">
                        Connect your site
                      </Button>
                      <p className="text-sm text-muted-foreground">
                        to sync your data and send more targeted campaigns to your customers.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <svg
                  className="h-5 w-5 text-muted-foreground"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                  <line x1="7" y1="7" x2="7.01" y2="7" />
                </svg>
                <CardTitle className="text-base">Tags</CardTitle>
              </div>
              <CardDescription>Tags will show up here.</CardDescription>
            </CardHeader>
            <CardContent className="min-h-[200px] flex flex-col items-center justify-center text-center p-8">
              <div className="space-y-4">
                <div className="flex justify-center gap-2">
                  <img
                    src="/images/tags-illustration.png"
                    alt="Tags"
                    className="h-24"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Organize and target your audience based on what you know
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Examples: Influencer, Member, or Reader
                  </p>
                  <Button>Start Tagging Contacts</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Predicted Demographics */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PersonIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <CardTitle className="text-base">Predicted demographics</CardTitle>
                  <CardDescription>
                    Your contacts broken down by their predicted gender and age.
                  </CardDescription>
                </div>
              </div>
              <div className="text-xs px-2 py-1 bg-gray-100 rounded">
                Paid Feature
              </div>
            </div>
          </CardHeader>
          <CardContent className="min-h-[200px] flex flex-col items-center justify-center text-center p-8">
            <div className="space-y-4">
              <div className="flex justify-center">
                <img
                  src="/images/demographics-illustration.png"
                  alt="Demographics"
                  className="h-32"
                />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  Know your people even better
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Send targeted campaigns based on your contacts' demographics.
                </p>
                <Button>Upgrade Now</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

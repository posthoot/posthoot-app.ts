"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { User, Bell, Key } from "lucide-react";
import { ApiKeys } from "./api-keys";

export function SettingsTabs() {
  return (
    <Tabs defaultValue="profile" className="space-y-4">
      <TabsList className="border-b rounded-none w-full justify-start gap-6 bg-transparent h-auto p-0">
        <TabsTrigger
          value="profile"
          className="flex items-center gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 px-4"
        >
          <User className="h-4 w-4" />
          Profile
        </TabsTrigger>
        <TabsTrigger
          value="notifications"
          className="flex items-center gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 px-4"
        >
          <Bell className="h-4 w-4" />
          Notifications
        </TabsTrigger>
        <TabsTrigger
          value="api"
          className="flex items-center gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 px-4"
        >
          <Key className="h-4 w-4" />
          API Keys
        </TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="space-y-4">
        <div className="border rounded-lg p-6">
          <h3 className="font-semibold mb-4">Profile Settings</h3>
          <div className="space-y-4 max-w-2xl">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Your name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Your email" />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Two-factor Authentication</Label>
                <div className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account
                </div>
              </div>
              <Switch />
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="notifications" className="space-y-4">
        <div className="border rounded-lg p-6">
          <h3 className="font-semibold mb-4">Notification Preferences</h3>
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <div className="text-sm text-muted-foreground">
                  Receive email notifications about your account activity
                </div>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Campaign Reports</Label>
                <div className="text-sm text-muted-foreground">
                  Get detailed reports after each campaign
                </div>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Security Alerts</Label>
                <div className="text-sm text-muted-foreground">
                  Important notifications about your account security
                </div>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="api" className="space-y-4">
        <ApiKeys />
      </TabsContent>
    </Tabs>
  );
}

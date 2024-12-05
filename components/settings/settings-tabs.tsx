"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { ProfileSettings } from "./profile-settings";
import { NotificationSettings } from "./notification-settings";
import { SMTPSettings } from "./smtp-settings";

export function SettingsTabs() {
  return (
    <Tabs defaultValue="profile" className="space-y-4">
      <TabsList>
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="smtp">SMTP</TabsTrigger>
        <TabsTrigger value="billing">Billing</TabsTrigger>
      </TabsList>
      <TabsContent value="profile">
        <Card className="p-6">
          <ProfileSettings />
        </Card>
      </TabsContent>
      <TabsContent value="notifications">
        <Card className="p-6">
          <NotificationSettings />
        </Card>
      </TabsContent>
      <TabsContent value="smtp">
        <Card className="p-6">
          <SMTPSettings />
        </Card>
      </TabsContent>
      <TabsContent value="billing">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Billing Settings</h2>
          <p className="text-muted-foreground">Manage your billing information and subscription</p>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
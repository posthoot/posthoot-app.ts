import { PageHeader } from "@/components/page-header";
import { SettingsTabs } from "@/components/settings/settings-tabs";

export default function SettingsPage() {
  return (
    <div className="flex-1 space-y-4">
      <PageHeader
        heading="Settings"
        description="Manage your account settings and preferences"
      />
      <div className="px-6">
        <SettingsTabs />
      </div>
    </div>
  );
}
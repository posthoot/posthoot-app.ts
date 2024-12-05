"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { PlusCircle, Trash2 } from "lucide-react";

interface SMTPConfig {
  id: string;
  provider: string;
  host: string;
  port: string;
  username: string;
  password: string;
}

export function SMTPSettings() {
  const [smtpConfigs, setSmtpConfigs] = useState<SMTPConfig[]>([
    {
      id: "1",
      provider: "custom",
      host: "",
      port: "",
      username: "",
      password: "",
    },
  ]);

  const addSMTPConfig = () => {
    setSmtpConfigs([
      ...smtpConfigs,
      {
        id: Date.now().toString(),
        provider: "custom",
        host: "",
        port: "",
        username: "",
        password: "",
      },
    ]);
  };

  const removeSMTPConfig = (id: string) => {
    setSmtpConfigs(smtpConfigs.filter((config) => config.id !== id));
  };

  const updateConfig = (id: string, field: keyof SMTPConfig, value: string) => {
    setSmtpConfigs(
      smtpConfigs.map((config) =>
        config.id === id ? { ...config, [field]: value } : config
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">SMTP Settings</h2>
        <Button onClick={addSMTPConfig} variant="outline" size="sm">
          <PlusCircle className="h-4 w-4 mr-2" />
          Add SMTP Server
        </Button>
      </div>
      
      <div className="space-y-4">
        {smtpConfigs.map((config) => (
          <Card key={config.id} className="p-4">
            <div className="grid gap-4">
              <div className="flex justify-between items-start">
                <div className="grid gap-2">
                  <Label>Provider</Label>
                  <Select
                    value={config.provider}
                    onValueChange={(value) =>
                      updateConfig(config.id, "provider", value)
                    }
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="custom">Custom SMTP</SelectItem>
                      <SelectItem value="gmail">Gmail SMTP</SelectItem>
                      <SelectItem value="outlook">Outlook SMTP</SelectItem>
                      <SelectItem value="amazon">Amazon SES</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSMTPConfig(config.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid gap-4 grid-cols-2">
                <div className="grid gap-2">
                  <Label>Host</Label>
                  <Input
                    value={config.host}
                    onChange={(e) =>
                      updateConfig(config.id, "host", e.target.value)
                    }
                    placeholder="smtp.example.com"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Port</Label>
                  <Input
                    value={config.port}
                    onChange={(e) =>
                      updateConfig(config.id, "port", e.target.value)
                    }
                    placeholder="587"
                  />
                </div>
              </div>
              
              <div className="grid gap-4 grid-cols-2">
                <div className="grid gap-2">
                  <Label>Username</Label>
                  <Input
                    value={config.username}
                    onChange={(e) =>
                      updateConfig(config.id, "username", e.target.value)
                    }
                    placeholder="username@example.com"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Password</Label>
                  <Input
                    type="password"
                    value={config.password}
                    onChange={(e) =>
                      updateConfig(config.id, "password", e.target.value)
                    }
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      <Button className="w-full">Save SMTP Settings</Button>
    </div>
  );
}
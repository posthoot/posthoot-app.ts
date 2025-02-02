import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Upload, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useTeam } from "@/app/providers/team-provider";

const brandingSchema = z.object({
  dashboardName: z
    .string()
    .min(2, "Dashboard name must be at least 2 characters"),
});

type BrandingFormData = z.infer<typeof brandingSchema>;

export function BrandingSettings() {
  const { toast } = useToast();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { team } = useTeam();


  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BrandingFormData>({
    resolver: zodResolver(brandingSchema),
    defaultValues: {
      dashboardName: team?.name || "kori 🦆", // Default name
    },
  });

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast({
          title: "Error",
          description: "Logo file size must be less than 5MB",
          variant: "destructive",
        });
        return;
      }

      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: BrandingFormData) => {
    try {
      setIsSubmitting(true);

      // Create FormData to handle file upload
      const formData = new FormData();
      formData.append("dashboardName", data.dashboardName);
      if (logoFile) {
        formData.append("logo", logoFile);
      }

      const response = await fetch("/api/settings/branding", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to update branding settings");

      toast({
        title: "Success",
        description: "Branding settings updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update branding settings",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Branding Settings</CardTitle>
          <CardDescription>
            Customize your dashboard's appearance and domain settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Logo Upload */}
          <div className="space-y-2">
            <Label>Logo</Label>
            <div className="flex items-center gap-4">
              <div className="w-32 h-32 border rounded-lg flex items-center justify-center overflow-hidden">
                {logoPreview || team?.logo ? (
                  <img
                    src={logoPreview || team?.logo}
                    alt="Logo preview"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <ImageIcon className="w-12 h-12 text-muted-foreground" />
                )}
              </div>
              <div className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    document.getElementById("logo-upload")?.click()
                  }
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Logo
                </Button>
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoChange}
                />
                <p className="text-sm text-muted-foreground">
                  Recommended size: 512x512px. Max file size: 5MB
                </p>
              </div>
            </div>
          </div>

          {/* Dashboard Name */}
          <div className="space-y-2">
            <Label htmlFor="dashboardName">Dashboard Name</Label>
            <Input
              id="dashboardName"
              {...register("dashboardName")}
              placeholder="Enter dashboard name"
            />
            {errors.dashboardName && (
              <p className="text-sm text-red-500">
                {errors.dashboardName.message}
              </p>
            )}
          </div>

          {/* Custom Domain */}
          <div className="space-y-2">
            <Label htmlFor="customDomain">Custom Domain</Label>
            <p className="text-sm text-muted-foreground">
              To use a custom domain, you need to have a domain verified and
              active. Go to <Link href="/settings/domains">Domains</Link> to add
              a custom domain.
            </p>
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}

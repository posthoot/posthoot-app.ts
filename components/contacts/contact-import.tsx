"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTeam } from "@/app/providers/team-provider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { parse } from "papaparse";
import { Label } from "@/components/ui/label";

interface ContactImportProps {
  listId: string;
  onImportComplete: () => void;
}

interface FieldMapping {
  [key: string]: string;
}

// Define field mappings for common CSV headers
const FIELD_MAPPINGS: { [key: string]: string[] } = {
  email: ['email', 'e-mail', 'e_mail', 'email_address', 'emailaddress'],
  firstName: ['first_name', 'firstname', 'first', 'given_name', 'givenname'],
  lastName: ['last_name', 'lastname', 'last', 'surname', 'family_name'],
  phone: ['phone', 'phone_number', 'phonenumber', 'mobile', 'telephone', 'tel'],
  company: ['company', 'organization', 'organisation', 'company_name', 'employer'],
  title: ['title', 'job_title', 'position', 'role'],
  address: ['address', 'address_line_1', 'street_address'],
  city: ['city', 'town'],
  state: ['state', 'province', 'region', 'state_province_region'],
  country: ['country', 'country_name'],
  postalCode: ['postal_code', 'zip', 'zip_code', 'postcode'],
};

const REQUIRED_FIELDS = ["email"];
const OPTIONAL_FIELDS = [
  "firstName",
  "lastName",
  "phone",
  "company",
  "title",
  "address",
  "city",
  "state",
  "country",
  "postalCode"
];
const ALL_FIELDS = [...REQUIRED_FIELDS, ...OPTIONAL_FIELDS];

export function ContactImport({ listId, onImportComplete }: ContactImportProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"upload" | "map" | "preview">("upload");
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [fieldMapping, setFieldMapping] = useState<FieldMapping>({});
  const [csvData, setCsvData] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { team } = useTeam();

  // Function to guess field mapping based on header name
  const guessFieldMapping = (header: string): string | null => {
    const normalizedHeader = header.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    for (const [field, variations] of Object.entries(FIELD_MAPPINGS)) {
      if (variations.some(v => normalizedHeader.includes(v.replace(/[^a-z0-9]/g, '')))) {
        return field;
      }
    }
    return null;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data.length === 0) {
          toast({
            title: "Error",
            description: "The CSV file is empty",
            variant: "destructive",
          });
          return;
        }

        // Get headers from the first row
        const headers = Object.keys(results.data[0]);
        setCsvHeaders(headers);
        setCsvData(results.data);

        // Initialize field mapping with best guesses
        const initialMapping: FieldMapping = {};
        headers.forEach(header => {
          const guessedField = guessFieldMapping(header);
          if (guessedField) {
            initialMapping[header] = guessedField;
          }
        });
        setFieldMapping(initialMapping);
        setStep("map");
      },
      error: () => {
        toast({
          title: "Error",
          description: "Failed to parse CSV file",
          variant: "destructive",
        });
      }
    });
  };

  const handleImport = async () => {
    // Validate required fields
    if (!Object.values(fieldMapping).includes("email")) {
      toast({
        title: "Error",
        description: "Email field mapping is required",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      // Transform data according to mapping
      const transformedData = csvData.map(row => {
        const transformed: any = {
          metadata: {} // Store unmapped fields in metadata
        };
        
        // First, store all original fields in metadata
        Object.entries(row).forEach(([key, value]) => {
          transformed.metadata[key] = value;
        });

        // Then map the fields according to our mapping
        Object.entries(fieldMapping).forEach(([csvField, mappedField]) => {
          if (ALL_FIELDS.includes(mappedField)) {
            transformed[mappedField] = row[csvField];
          }
        });

        return transformed;
      });

      const response = await fetch("/api/contacts/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contacts: transformedData,
          listId,
          teamId: team?.id,
        }),
      });

      if (!response.ok) throw new Error("Failed to import contacts");

      const result = await response.json();
      toast({
        title: "Success",
        description: `Successfully imported ${result.imported} contacts`,
      });

      // Reset state and close dialog
      setStep("upload");
      setIsDialogOpen(false);
      onImportComplete();

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to import contacts",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleCancel = () => {
    setStep("upload");
    setIsDialogOpen(false);
    setCsvHeaders([]);
    setFieldMapping({});
    setCsvData([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Import Contacts
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Import Contacts</DialogTitle>
          <DialogDescription>
            {step === "upload" && "Upload a CSV file with your contacts data."}
            {step === "map" && "Map your CSV columns to contact fields."}
          </DialogDescription>
        </DialogHeader>

        {step === "upload" && (
          <div className="space-y-4 py-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="w-full"
            />
            <div className="text-sm text-muted-foreground">
              <p>Your CSV file should include the following:</p>
              <ul className="list-disc list-inside mt-2">
                <li>Required: email</li>
                <li>Optional: firstName, lastName, phone, company, title, address, city, state, country, postalCode</li>
                <li>Any additional fields will be stored as metadata</li>
              </ul>
            </div>
          </div>
        )}

        {step === "map" && (
          <div className="space-y-4 py-4">
            <div className="grid gap-4">
              {ALL_FIELDS.map((field) => (
                <div key={field} className="grid grid-cols-2 items-center gap-4">
                  <Label className="capitalize">
                    {field}
                    {REQUIRED_FIELDS.includes(field) && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </Label>
                  <Select
                    value={Object.keys(fieldMapping).find(
                      key => fieldMapping[key] === field
                    ) || "none"}
                    onValueChange={(value) => {
                      const newMapping = { ...fieldMapping };
                      // Remove old mapping if it exists
                      Object.keys(newMapping).forEach(key => {
                        if (newMapping[key] === field) {
                          delete newMapping[key];
                        }
                      });
                      // Add new mapping if a column is selected
                      if (value !== "none") {
                        newMapping[value] = field;
                      }
                      setFieldMapping(newMapping);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a column" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Not mapped</SelectItem>
                      {csvHeaders.map((header) => (
                        <SelectItem key={header} value={header}>
                          {header}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            <div className="text-sm text-muted-foreground mt-4">
              <p>Preview: {csvData.length} contacts will be imported</p>
              <p className="mt-1">Unmapped columns will be stored as metadata</p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          {step === "map" && (
            <Button onClick={handleImport} disabled={isLoading}>
              {isLoading ? "Importing..." : "Import Contacts"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 
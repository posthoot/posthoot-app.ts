"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown, Download, Search, Tag, X, Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { DataTable } from "@/components/ui/data-table";

interface Tag {
  id: string;
  name: string;
  createdAt: Date;
  _count: {
    contacts: number;
  };
}

export default function TagsPage() {
  const [isCreateTagOpen, setIsCreateTagOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [sortBy, setSortBy] = useState("Date created");

  // Mock data - replace with actual API call
  const tags: Tag[] = [
    {
      id: "1",
      name: "random",
      createdAt: new Date(),
      _count: {
        contacts: 0,
      },
    },
  ];

  const handleTagSelection = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  return (
    <div className="container mx-auto py-8 max-w-[1200px]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Tags</h1>
          <div className="text-sm text-muted-foreground">
            Audience: TheBoringTeam
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-gray-200">
            Bulk tag
          </Button>
          <Sheet open={isCreateTagOpen} onOpenChange={setIsCreateTagOpen}>
            <SheetTrigger asChild>
              <Button className="bg-[#007C89] text-white hover:bg-[#005F6B]">
                <Plus className="h-4 w-4 mr-2" />
                Create new tag
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Create New Tag</SheetTitle>
                <SheetDescription>
                  Add a new tag to help organize your contacts
                </SheetDescription>
              </SheetHeader>
              <div className="py-6">
                <label className="text-sm font-medium">Tag Name</label>
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Enter tag name"
                  className="mt-2"
                />
              </div>
              <SheetFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateTagOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    // Handle tag creation
                    setIsCreateTagOpen(false);
                  }}
                  className="bg-[#007C89] text-white hover:bg-[#005F6B]"
                >
                  Create Tag
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <DataTable
        data={tags}
        columns={[
          {
            header: "Tag",
            accessorKey: "name",
          },
          {
            header: "Contacts",
            accessorKey: "_count",
            cell: ({ row }: any) => row?.original?._count?.contacts || 0,
          },
          {
            header: "Created Date",
            accessorKey: "createdAt",
            cell: ({ row }: any) =>
              format(row.original.createdAt, "MMM d, yyyy"),
          },
        ]}
      />

      {/* Automate Tagging Card */}
      <div className="mt-8 bg-card rounded-lg border border-gray-200 p-6">
        <div className="flex items-start gap-6">
          <div className="h-16 w-16 rounded-lg bg-pink-50 flex items-center justify-center">
            <svg
              className="h-8 w-8 text-pink-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Automate Tagging</h3>
            <p className="text-muted-foreground mb-4">
              You can automate tagging your contacts with our API
            </p>
            <Button variant="outline">Automate Your Tagging</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

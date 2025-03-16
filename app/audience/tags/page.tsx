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
import {
  ChevronDown,
  Download,
  Search,
  Tag,
  X,
  Plus,
} from "lucide-react";
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

      <div className="bg-white rounded-lg border border-gray-200">
        {/* Search and Sort Bar */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tags"
                className="pl-9 w-[300px] border-gray-200"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Sort by</span>
              <Select defaultValue="Date created">
                <SelectTrigger className="w-[180px] border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Date created">Date created</SelectItem>
                  <SelectItem value="Name">Name</SelectItem>
                  <SelectItem value="Contacts">Contacts</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-600"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {selectedTags.length > 0 && (
            <Button
              variant="ghost"
              className="text-[#007C89] hover:text-[#005F6B]"
            >
              Delete
            </Button>
          )}
        </div>

        {/* Tags Table */}
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50">
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedTags.length === tags.length}
                  onCheckedChange={(checked) => {
                    setSelectedTags(
                      checked ? tags.map((tag) => tag.id) : []
                    );
                  }}
                />
              </TableHead>
              <TableHead className="font-medium text-gray-600">Tag</TableHead>
              <TableHead className="font-medium text-gray-600">
                Created date
              </TableHead>
              <TableHead className="font-medium text-gray-600">
                Contacts
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tags.map((tag) => (
              <TableRow
                key={tag.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <TableCell>
                  <Checkbox
                    checked={selectedTags.includes(tag.id)}
                    onCheckedChange={() => handleTagSelection(tag.id)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-[#007C89]" />
                    <span className="font-medium text-gray-900">
                      {tag.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-gray-600">
                  {format(tag.createdAt, "MMM d, yyyy")}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className="bg-[#007C89]/5 text-[#007C89] border-[#007C89]/20"
                  >
                    {tag._count.contacts} contacts
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="p-4 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Select defaultValue="25">
              <SelectTrigger className="w-[70px] border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-gray-600">per page</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Button
              variant="ghost"
              size="sm"
              disabled
              className="text-gray-600"
            >
              Previous
            </Button>
            <span>1 of 1</span>
            <Button
              variant="ghost"
              size="sm"
              disabled
              className="text-gray-600"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Automate Tagging Card */}
      <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
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
            <p className="text-gray-600 mb-4">
              You can automate tagging your contacts with our API
            </p>
            <Button
              variant="outline"
              className="text-[#007C89] border-[#007C89] hover:bg-[#007C89]/5"
            >
              Automate Your Tagging
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 
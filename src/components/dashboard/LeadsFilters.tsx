import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { LeadFilters } from "@/pages/LeadsPage";
import { supabase } from "@/integrations/supabase/client";

interface LeadsFiltersProps {
  filters: LeadFilters;
  onFiltersChange: (filters: LeadFilters) => void;
}

export const LeadsFilters = ({ filters, onFiltersChange }: LeadsFiltersProps) => {
  const [managers, setManagers] = useState<Array<{ id: string; full_name: string }>>([]);
  const [searchInput, setSearchInput] = useState(filters.search || "");

  useEffect(() => {
    fetchManagers();
  }, []);

  const fetchManagers = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name")
      .order("full_name");

    if (data) {
      setManagers(data);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    onFiltersChange({ ...filters, search: value });
  };

  const clearFilters = () => {
    setSearchInput("");
    onFiltersChange({});
  };

  return (
    <div className="bg-card p-4 rounded-lg border space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Filters</h3>
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="h-4 w-4 mr-2" />
          Clear All
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search leads..."
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={filters.status}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, status: value })
            }
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="converted">Converted</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="manager">Assign to</Label>
          <Select
            value={filters.assignedManager}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, assignedManager: value })
            }
          >
            <SelectTrigger id="manager">
              <SelectValue placeholder="All users" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All managers</SelectItem>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {managers.map((manager) => (
                <SelectItem key={manager.id} value={manager.id}>
                  {manager.full_name || manager.id.slice(0, 8)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags">Tags</Label>
          <Select
            value={filters.tags?.[0]}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, tags: value ? [value] : [] })
            }
          >
            <SelectTrigger id="tags">
              <SelectValue placeholder="All tags" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All tags</SelectItem>
              <SelectItem value="hot">Hot</SelectItem>
              <SelectItem value="spam">Spam</SelectItem>
              <SelectItem value="called">Called</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { LeadFilters } from "@/pages/LeadsPage";
import { Loader2, Plus } from "lucide-react";
import { LeadDetailsDialog } from "./LeadDetailsDialog";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";

interface Lead {
  id: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  support_type: string | null;
  visit_frequency: string | null;
  care_duration: string | null;
  priority: string | null;
  status: string;
  created_at: string;
  assigned_manager_id: string | null;
  manager?: {
    full_name: string | null;
  } | null;
}

interface LeadsTableProps {
  filters: LeadFilters;
}

export const LeadsTable = ({ filters }: LeadsTableProps) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const { isSuperadmin, isAdmin } = useAuth();

  useEffect(() => {
    fetchLeads();

    // Set up realtime subscription
    const channel = supabase
      .channel("leads-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "leads",
        },
        () => {
          fetchLeads();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [filters]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("leads")
        .select(`
          *,
          manager:profiles!leads_assigned_manager_id_fkey (
            full_name
          )
        `)
        .order("created_at", { ascending: false });

      // Apply filters
      if (filters.status && filters.status !== "all") {
        query = query.eq("status", filters.status as "new" | "contacted" | "in_progress" | "converted" | "closed");
      }

      if (filters.assignedManager && filters.assignedManager !== "all") {
        if (filters.assignedManager === "unassigned") {
          query = query.is("assigned_manager_id", null);
        } else {
          query = query.eq("assigned_manager_id", filters.assignedManager);
        }
      }

      if (filters.search) {
        query = query.or(
          `contact_name.ilike.%${filters.search}%,contact_email.ilike.%${filters.search}%,contact_phone.ilike.%${filters.search}%`
        );
      }

      const { data, error } = await query;

      if (error) {
        toast({
          variant: "destructive",
          title: "Error loading leads",
          description: "Unable to fetch leads data",
        });
        return;
      }
      setLeads(data || []);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: "bg-blue-500",
      contacted: "bg-yellow-500",
      in_progress: "bg-purple-500",
      converted: "bg-green-500",
      closed: "bg-gray-500",
    };
    return colors[status] || "bg-gray-500";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Manager</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No leads found. Start collecting leads through your website!
                </TableCell>
              </TableRow>
            ) : (
              leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">{lead.contact_name}</TableCell>
                  <TableCell>{lead.contact_email}</TableCell>
                  <TableCell>{lead.contact_phone}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(lead.status)}>
                      {lead.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {lead.manager?.full_name || "Unassigned"}
                  </TableCell>
                  <TableCell>
                    {format(new Date(lead.created_at), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedLead(lead)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {selectedLead && (
        <LeadDetailsDialog
          lead={selectedLead}
          open={!!selectedLead}
          onOpenChange={(open) => !open && setSelectedLead(null)}
          onUpdate={fetchLeads}
        />
      )}
    </>
  );
};

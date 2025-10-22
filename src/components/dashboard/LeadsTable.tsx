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
import { Loader2, Trash2, MessageSquare, Flame, AlertCircle, Phone, Tag as TagIcon } from "lucide-react";
import { LeadDetailsDialog } from "./LeadDetailsDialog";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Lead {
  id: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  postal_code: string | null;
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
  lead_tags?: Array<{ tag: string }>;
  lead_notes?: Array<{ id: string }>;
}

interface LeadsTableProps {
  filters: LeadFilters;
}

export const LeadsTable = ({ filters }: LeadsTableProps) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<string | null>(null);
  const { isSuperadmin, isAdmin, canManageCrud } = useAuth();

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
          ),
          lead_tags (tag),
          lead_notes (id)
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

  const handleDeleteLead = async () => {
    if (!leadToDelete) return;

    try {
      const { error } = await supabase
        .from("leads")
        .delete()
        .eq("id", leadToDelete);

      if (error) throw error;

      toast({
        title: "Lead deleted",
        description: "The lead has been successfully deleted",
      });
      fetchLeads();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error deleting lead",
        description: "Unable to delete the lead",
      });
    } finally {
      setDeleteDialogOpen(false);
      setLeadToDelete(null);
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

  const tagIcons: Record<string, any> = {
    hot: Flame,
    spam: AlertCircle,
    called: Phone,
    urgent: TagIcon,
  };

  const tagColors: Record<string, string> = {
    called: "#6E8CFB",
    spam: "#FE7743",
    urgent: "#4FB7B3",
    hot: "#ef4444", // red for hot leads
  };

  const canDelete = isSuperadmin || (isAdmin && canManageCrud);

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
              <TableHead>Postcode</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead>Manager</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                  No leads found. Start collecting leads through your website!
                </TableCell>
              </TableRow>
            ) : (
              leads.map((lead) => {
                const tags = lead.lead_tags || [];
                const notesCount = lead.lead_notes?.length || 0;
                return (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">{lead.contact_name}</TableCell>
                    <TableCell>{lead.contact_email}</TableCell>
                    <TableCell>{lead.contact_phone}</TableCell>
                    <TableCell>{lead.postal_code || "-"}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(lead.status)}>
                        {lead.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {tags.map((tagObj, idx) => {
                          const Icon = tagIcons[tagObj.tag];
                          const bgColor = tagColors[tagObj.tag];
                          return (
                            <Badge 
                              key={idx} 
                              variant="secondary" 
                              className="flex items-center gap-1 text-white"
                              style={{ backgroundColor: bgColor }}
                            >
                              {Icon && <Icon className="h-3 w-3" />}
                              <span className="text-xs">{tagObj.tag}</span>
                            </Badge>
                          );
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      {notesCount > 0 && (
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          <span className="text-sm">{notesCount}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {lead.manager?.full_name || "Unassigned"}
                    </TableCell>
                    <TableCell>
                      {format(new Date(lead.created_at), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedLead(lead)}
                        >
                          View
                        </Button>
                        {canDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setLeadToDelete(lead.id);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the lead
              and all associated notes and tags.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setLeadToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteLead}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

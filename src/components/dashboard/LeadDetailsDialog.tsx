import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Flame, AlertCircle, Phone, Tag, Trash2 } from "lucide-react";

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
  assigned_manager_id: string | null;
  created_at: string;
}

interface Note {
  id: string;
  note: string;
  created_at: string;
  created_by: string;
  profiles?: {
    full_name: string | null;
  };
}

interface LeadTag {
  id: string;
  tag: string;
}

interface LeadDetailsDialogProps {
  lead: Lead;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export const LeadDetailsDialog = ({
  lead,
  open,
  onOpenChange,
  onUpdate,
}: LeadDetailsDialogProps) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [tags, setTags] = useState<LeadTag[]>([]);
  const [newNote, setNewNote] = useState("");
  const [managers, setManagers] = useState<Array<{ id: string; full_name: string }>>([]);
  const { user, isSuperadmin, isAdmin } = useAuth();
  const { toast } = useToast();

  const canEdit = isSuperadmin || isAdmin;

  useEffect(() => {
    if (open) {
      fetchNotes();
      fetchTags();
      fetchManagers();
    }
  }, [open, lead.id]);

  const fetchNotes = async () => {
    const { data } = await supabase
      .from("lead_notes")
      .select(`
        *,
        profiles:created_by (
          full_name
        )
      `)
      .eq("lead_id", lead.id)
      .order("created_at", { ascending: false });

    if (data) setNotes(data);
  };

  const fetchTags = async () => {
    const { data } = await supabase
      .from("lead_tags")
      .select("*")
      .eq("lead_id", lead.id);

    if (data) setTags(data);
  };

  const fetchManagers = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name")
      .order("full_name");

    if (data) setManagers(data);
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    const { error } = await supabase.from("lead_notes").insert({
      lead_id: lead.id,
      note: newNote,
      created_by: user!.id,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add note.",
      });
    } else {
      toast({
        title: "Success",
        description: "Note added successfully.",
      });
      setNewNote("");
      fetchNotes();
      onUpdate(); // Refresh the main table to show note count
    }
  };

  const handleToggleTag = async (tag: string) => {
    const existingTag = tags.find((t) => t.tag === tag);

    if (existingTag) {
      const { error } = await supabase
        .from("lead_tags")
        .delete()
        .eq("id", existingTag.id);

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to remove tag.",
        });
      } else {
        fetchTags();
        onUpdate(); // Refresh the main table to show tags
      }
    } else {
      const { error } = await supabase.from("lead_tags").insert([{
        lead_id: lead.id,
        tag: tag as "hot" | "spam" | "called" | "urgent",
      }]);

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to add tag.",
        });
      } else {
        fetchTags();
        onUpdate(); // Refresh the main table to show tags
      }
    }
  };

  const handleUpdateStatus = async (status: string) => {
    const { error } = await supabase
      .from("leads")
      .update({ status: status as "new" | "contacted" | "in_progress" | "converted" | "closed" })
      .eq("id", lead.id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update status.",
      });
    } else {
      toast({
        title: "Success",
        description: "Status updated successfully.",
      });
      onUpdate();
    }
  };

  const handleAssignManager = async (managerId: string) => {
    const { error } = await supabase
      .from("leads")
      .update({ assigned_manager_id: managerId === "unassigned" ? null : managerId })
      .eq("id", lead.id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to assign manager.",
      });
    } else {
      toast({
        title: "Success",
        description: "Manager assigned successfully.",
      });
      onUpdate();
    }
  };

  const tagIcons: Record<string, any> = {
    hot: Flame,
    spam: AlertCircle,
    called: Phone,
    urgent: Tag,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Lead Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Contact Information */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Contact Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Name</Label>
                <p className="font-medium">{lead.contact_name}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Email</Label>
                <p className="font-medium">{lead.contact_email}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Phone</Label>
                <a href={`tel:${lead.contact_phone}`} className="font-medium text-primary hover:underline cursor-pointer flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {lead.contact_phone}
                </a>
              </div>
              {lead.postal_code && (
                <div>
                  <Label className="text-muted-foreground">Postcode</Label>
                  <p className="font-medium">{lead.postal_code}</p>
                </div>
              )}
            </div>
          </div>

          {/* Lead Details */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Lead Details</h3>
            <div className="grid grid-cols-2 gap-4">
              {lead.support_type && (
                <div>
                  <Label className="text-muted-foreground">Support Type</Label>
                  <p className="font-medium">{lead.support_type}</p>
                </div>
              )}
              {lead.visit_frequency && (
                <div>
                  <Label className="text-muted-foreground">Visit Frequency</Label>
                  <p className="font-medium">{lead.visit_frequency}</p>
                </div>
              )}
              {lead.care_duration && (
                <div>
                  <Label className="text-muted-foreground">Care Duration</Label>
                  <p className="font-medium">{lead.care_duration}</p>
                </div>
              )}
              {lead.priority && (
                <div>
                  <Label className="text-muted-foreground">Priority</Label>
                  <p className="font-medium">{lead.priority}</p>
                </div>
              )}
            </div>
          </div>

          {/* Status & Manager (Editable) */}
          {canEdit && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={lead.status} onValueChange={handleUpdateStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="converted">Converted</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Assigned Manager</Label>
                <Select
                  value={lead.assigned_manager_id || "unassigned"}
                  onValueChange={handleAssignManager}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {managers.map((manager) => (
                      <SelectItem key={manager.id} value={manager.id}>
                        {manager.full_name || manager.id.slice(0, 8)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Tags */}
          {canEdit && (
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2 flex-wrap">
                {["hot", "spam", "called", "urgent"].map((tag) => {
                  const Icon = tagIcons[tag];
                  const isActive = tags.some((t) => t.tag === tag);
                  return (
                    <Button
                      key={tag}
                      variant={isActive ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleToggleTag(tag)}
                    >
                      <Icon className="h-4 w-4 mr-1" />
                      {tag}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Notes</h3>
            
            <div className="space-y-2">
              <Textarea
                placeholder="Add a note..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows={3}
              />
              <Button onClick={handleAddNote}>Add Note</Button>
            </div>

            <div className="space-y-2">
              {notes.map((note) => (
                <div key={note.id} className="p-3 bg-muted rounded-lg">
                  <p className="text-sm">{note.note}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    By {note.profiles?.full_name || "Unknown"} •{" "}
                    {new Date(note.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

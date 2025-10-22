import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Settings, User, Bell, Shield, Database, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface UserNotificationSettings {
  id: string;
  user_id: string;
  email_notifications: boolean;
  lead_assignment_notifications: boolean;
  profile?: {
    full_name: string | null;
    email: string | null;
  };
}

const SettingsPage = () => {
  const { user, userRole, isSuperadmin } = useAuth();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [leadAssignments, setLeadAssignments] = useState(true);
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [usersNotifications, setUsersNotifications] = useState<UserNotificationSettings[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);

  useEffect(() => {
    if (isSuperadmin) {
      fetchUsersNotifications();
    }
  }, [isSuperadmin]);

  const fetchUsersNotifications = async () => {
    setLoadingNotifications(true);
    try {
      // First get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, email");

      if (profilesError) throw profilesError;

      // Then get notification settings for all users
      const { data: settings, error: settingsError } = await supabase
        .from("user_notification_settings")
        .select("*");

      if (settingsError) throw settingsError;

      // Merge profiles with their settings
      const merged = profiles?.map((profile) => {
        const userSettings = settings?.find((s) => s.user_id === profile.id);
        return {
          id: userSettings?.id || "",
          user_id: profile.id,
          email_notifications: userSettings?.email_notifications ?? true,
          lead_assignment_notifications: userSettings?.lead_assignment_notifications ?? true,
          profile: {
            full_name: profile.full_name,
            email: profile.email,
          },
        };
      }) || [];

      setUsersNotifications(merged);
    } catch (error) {
      console.error("Error fetching user notifications:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load user notification settings",
      });
    } finally {
      setLoadingNotifications(false);
    }
  };

  const handleToggleNotification = async (
    userId: string,
    field: "email_notifications" | "lead_assignment_notifications",
    currentValue: boolean
  ) => {
    try {
      // Check if settings exist for this user
      const { data: existing } = await supabase
        .from("user_notification_settings")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (existing) {
        // Update existing settings
        const { error } = await supabase
          .from("user_notification_settings")
          .update({ [field]: !currentValue })
          .eq("user_id", userId);

        if (error) throw error;
      } else {
        // Insert new settings
        const { error } = await supabase
          .from("user_notification_settings")
          .insert({
            user_id: userId,
            [field]: !currentValue,
          });

        if (error) throw error;
      }

      toast({
        title: "Settings updated",
        description: "Notification preferences have been saved",
      });

      fetchUsersNotifications();
    } catch (error) {
      console.error("Error updating notification settings:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update notification settings",
      });
    }
  };

  const handleSaveNotifications = () => {
    toast({
      title: "Settings saved",
      description: "Your notification preferences have been updated",
    });
    setNotificationDialogOpen(false);
  };

  const handleSaveAssignments = () => {
    toast({
      title: "Settings saved",
      description: "Your lead assignment preferences have been updated",
    });
    setAssignmentDialogOpen(false);
  };

  const handleOpenBackend = () => {
    toast({
      title: "Opening backend",
      description: "Backend dashboard will open in a new window",
    });
    // This would open the backend in production
    window.open("/", "_blank");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid gap-6">
          {/* Account Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <CardTitle>Account Information</CardTitle>
              </div>
              <CardDescription>
                Your account details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ""}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <div>
                  <Badge className={
                    userRole?.role === "superadmin" ? "bg-purple-500" :
                    userRole?.role === "admin" ? "bg-blue-500" :
                    "bg-green-500"
                  }>
                    {userRole?.role || "No Role"}
                  </Badge>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Permissions</Label>
                <div className="text-sm text-muted-foreground">
                  {userRole?.can_manage_crud && (
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      <span>Can manage CRUD operations</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications - Superadmin manages all users, others see their own */}
          {isSuperadmin ? (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  <CardTitle>Manage User Notifications</CardTitle>
                </div>
                <CardDescription>
                  Configure which users receive email notifications for Email Notifications and Lead Assignments
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingNotifications ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <div className="rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Email Notifications</TableHead>
                          <TableHead>Lead Assignments</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {usersNotifications.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                              No users found
                            </TableCell>
                          </TableRow>
                        ) : (
                          usersNotifications.map((userNotif) => (
                            <TableRow key={userNotif.user_id}>
                              <TableCell className="font-medium">
                                {userNotif.profile?.full_name || "Unknown"}
                              </TableCell>
                              <TableCell>{userNotif.profile?.email}</TableCell>
                              <TableCell>
                                <Switch
                                  checked={userNotif.email_notifications}
                                  onCheckedChange={() =>
                                    handleToggleNotification(
                                      userNotif.user_id,
                                      "email_notifications",
                                      userNotif.email_notifications
                                    )
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                <Switch
                                  checked={userNotif.lead_assignment_notifications}
                                  onCheckedChange={() =>
                                    handleToggleNotification(
                                      userNotif.user_id,
                                      "lead_assignment_notifications",
                                      userNotif.lead_assignment_notifications
                                    )
                                  }
                                />
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  <CardTitle>Notifications</CardTitle>
                </div>
                <CardDescription>
                  Configure how you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive email updates about new leads
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setNotificationDialogOpen(true)}
                  >
                    Configure
                  </Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Lead Assignments</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when leads are assigned to you
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAssignmentDialogOpen(true)}
                  >
                    Configure
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* System Settings */}
          {(userRole?.role === "superadmin" || userRole?.role === "admin") && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  <CardTitle>System Settings</CardTitle>
                </div>
                <CardDescription>
                  Advanced system configuration options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Database Management</Label>
                    <p className="text-sm text-muted-foreground">
                      Access backend database and manage data
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleOpenBackend}>
                    Open Backend
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

        </div>

        {/* Notification Settings Dialog */}
        <Dialog open={notificationDialogOpen} onOpenChange={setNotificationDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Email Notification Settings</DialogTitle>
              <DialogDescription>
                Configure when you want to receive email notifications
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>New Lead Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when new leads are created
                  </p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSaveNotifications}>Save Changes</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Lead Assignment Dialog */}
        <Dialog open={assignmentDialogOpen} onOpenChange={setAssignmentDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Lead Assignment Settings</DialogTitle>
              <DialogDescription>
                Configure notifications for lead assignments
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Assignment Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when leads are assigned to you
                  </p>
                </div>
                <Switch
                  checked={leadAssignments}
                  onCheckedChange={setLeadAssignments}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSaveAssignments}>Save Changes</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;

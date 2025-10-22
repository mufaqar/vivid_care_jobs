import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Settings, User, Bell, Shield, Database } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

const SettingsPage = () => {
  const { user, userRole } = useAuth();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [leadAssignments, setLeadAssignments] = useState(true);
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);

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

          {/* Notifications */}
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

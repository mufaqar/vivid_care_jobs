import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Shield, ShieldCheck, User, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
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

interface UserWithRole {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  role?: {
    role: "superadmin" | "admin" | "manager";
    can_manage_crud: boolean;
  }[] | null;
}

const UsersPage = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const { isSuperadmin, isAdmin } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          id,
          email,
          full_name,
          created_at,
          role:user_roles(role, can_manage_crud)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error loading users",
        description: "Unable to fetch user data",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: "superadmin" | "admin" | "manager") => {
    try {
      // Check if user already has a role
      const { data: existingRole } = await supabase
        .from("user_roles")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (existingRole) {
        // Update existing role
        const { error } = await supabase
          .from("user_roles")
          .update({ role: newRole })
          .eq("user_id", userId);

        if (error) throw error;
      } else {
        // Insert new role
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: userId, role: newRole });

        if (error) throw error;
      }

      toast({
        title: "Role updated",
        description: "User role has been successfully updated",
      });
      fetchUsers();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error updating role",
        description: "Unable to update user role",
      });
    }
  };

  const handleToggleCrudPrivilege = async (userId: string, currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from("user_roles")
        .update({ can_manage_crud: !currentValue })
        .eq("user_id", userId);

      if (error) throw error;

      toast({
        title: "Privileges updated",
        description: "User privileges have been successfully updated",
      });
      fetchUsers();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error updating privileges",
        description: "Unable to update user privileges",
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      // First delete the user role
      const { error: roleError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userToDelete);

      if (roleError) throw roleError;

      // Note: We can't delete from auth.users directly via client
      // So we just remove the role assignment
      toast({
        title: "User role removed",
        description: "The user role has been successfully removed",
      });
      fetchUsers();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error removing user role",
        description: "Unable to remove user role",
      });
    } finally {
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const getUserRole = (user: UserWithRole) => {
    return user.role && user.role.length > 0 ? user.role[0] : null;
  };

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case "superadmin":
        return <ShieldCheck className="h-4 w-4" />;
      case "admin":
        return <Shield className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case "superadmin":
        return "bg-purple-500";
      case "admin":
        return "bg-blue-500";
      case "manager":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  if (!isSuperadmin && !isAdmin) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">
              You don't have permission to view this page.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage user roles and permissions
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Can Manage CRUD</TableHead>
                  <TableHead>Joined</TableHead>
                  {isSuperadmin && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => {
                    const userRole = getUserRole(user);
                    return (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {getRoleIcon(userRole?.role)}
                            {user.full_name || "Unnamed User"}
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge className={getRoleBadgeColor(userRole?.role)}>
                            {userRole?.role || "No Role"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {isSuperadmin ? (
                            <Checkbox
                              checked={userRole?.can_manage_crud || false}
                              onCheckedChange={() =>
                                handleToggleCrudPrivilege(
                                  user.id,
                                  userRole?.can_manage_crud || false
                                )
                              }
                            />
                          ) : (
                            <Badge variant={userRole?.can_manage_crud ? "default" : "outline"}>
                              {userRole?.can_manage_crud ? "Yes" : "No"}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                        {isSuperadmin && (
                          <TableCell>
                            <div className="flex gap-2">
                              <Select
                                value={userRole?.role || "manager"}
                                onValueChange={(value) =>
                                  handleRoleChange(user.id, value as "superadmin" | "admin" | "manager")
                                }
                              >
                                <SelectTrigger className="w-[140px]">
                                  <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="superadmin">Superadmin</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                  <SelectItem value="manager">Manager</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setUserToDelete(user.id);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove User Role?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove the user's role assignment. They will lose access to
                the dashboard until a new role is assigned.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setUserToDelete(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteUser}>
                Remove Role
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default UsersPage;

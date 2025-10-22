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
import { Input } from "@/components/ui/input";
import { Loader2, Shield, ShieldCheck, User, Trash2, KeyRound, Pencil, Check, X, Plus } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface UserWithRole {
  id: string;
  email: string;
  full_name: string | null;
  phone_number: string | null;
  company_name: string | null;
  postal_code: string | null;
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
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<{
    full_name: string;
    phone_number: string;
    company_name: string;
    postal_code: string;
  } | null>(null);
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const { isSuperadmin, isAdmin } = useAuth();

  const newUserSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    full_name: z.string().min(1, "Name is required"),
    phone_number: z.string().optional(),
    company_name: z.string().optional(),
    postal_code: z.string().optional(),
    role: z.enum(["superadmin", "admin", "manager"]),
  });

  type NewUserFormData = z.infer<typeof newUserSchema>;

  const form = useForm<NewUserFormData>({
    resolver: zodResolver(newUserSchema),
    defaultValues: {
      email: "",
      password: "",
      full_name: "",
      phone_number: "",
      company_name: "",
      postal_code: "",
      role: "manager",
    },
  });

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
          phone_number,
          company_name,
          postal_code,
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
        .maybeSingle();

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

  const handleResetPassword = async (userEmail: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
        redirectTo: `${window.location.origin}/auth?reset=true`,
      });

      if (error) throw error;

      toast({
        title: "Password reset email sent",
        description: `A password reset link has been sent to ${userEmail}`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error sending reset email",
        description: "Unable to send password reset email",
      });
    }
  };

  const handleStartEdit = (user: UserWithRole) => {
    setEditingUserId(user.id);
    setEditedData({
      full_name: user.full_name || "",
      phone_number: user.phone_number || "",
      company_name: user.company_name || "",
      postal_code: user.postal_code || "",
    });
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setEditedData(null);
  };

  const handleSaveEdit = async (userId: string) => {
    if (!editedData) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update(editedData)
        .eq("id", userId);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "User profile has been successfully updated",
      });
      
      setEditingUserId(null);
      setEditedData(null);
      fetchUsers();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error updating profile",
        description: "Unable to update user profile",
      });
    }
  };

  const handleCreateUser = async (data: NewUserFormData) => {
    setIsCreatingUser(true);
    try {
      // Create the user via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name,
            phone_number: data.phone_number,
            company_name: data.company_name,
            postal_code: data.postal_code,
          },
          emailRedirectTo: `${window.location.origin}/auth`,
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("User creation failed");

      // Assign role to the new user
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({
          user_id: authData.user.id,
          role: data.role,
        });

      if (roleError) throw roleError;

      toast({
        title: "User created successfully",
        description: `User ${data.email} has been created with ${data.role} role`,
      });

      setAddUserDialogOpen(false);
      form.reset();
      fetchUsers();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error creating user",
        description: error.message || "Unable to create user",
      });
    } finally {
      setIsCreatingUser(false);
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground">
              Manage user roles and permissions
            </p>
          </div>
          {isSuperadmin && (
            <Button onClick={() => setAddUserDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add New User
            </Button>
          )}
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
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Postcode</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Can Manage CRUD</TableHead>
                  <TableHead>Joined</TableHead>
                  {isSuperadmin && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => {
                    const userRole = getUserRole(user);
                    const isEditing = editingUserId === user.id;
                    return (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {isEditing ? (
                            <Input
                              value={editedData?.full_name || ""}
                              placeholder="Enter name"
                              onChange={(e) => setEditedData(prev => prev ? { ...prev, full_name: e.target.value } : null)}
                              className="max-w-[200px]"
                            />
                          ) : (
                            <div className="flex items-center gap-2">
                              {getRoleIcon(userRole?.role)}
                              {user.full_name || "Unnamed User"}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Input
                              value={editedData?.phone_number || ""}
                              placeholder="Enter phone"
                              onChange={(e) => setEditedData(prev => prev ? { ...prev, phone_number: e.target.value } : null)}
                              className="max-w-[150px]"
                            />
                          ) : (
                            user.phone_number || "—"
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Input
                              value={editedData?.company_name || ""}
                              placeholder="Enter company"
                              onChange={(e) => setEditedData(prev => prev ? { ...prev, company_name: e.target.value } : null)}
                              className="max-w-[200px]"
                            />
                          ) : (
                            user.company_name || "—"
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Input
                              value={editedData?.postal_code || ""}
                              placeholder="Enter postcode"
                              onChange={(e) => setEditedData(prev => prev ? { ...prev, postal_code: e.target.value } : null)}
                              className="max-w-[120px]"
                            />
                          ) : (
                            user.postal_code || "—"
                          )}
                        </TableCell>
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
                        {(isSuperadmin || isAdmin) && (
                          <TableCell>
                            <div className="flex gap-2">
                              {isEditing ? (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleSaveEdit(user.id)}
                                    title="Save changes"
                                  >
                                    <Check className="h-4 w-4 text-green-500" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleCancelEdit}
                                    title="Cancel"
                                  >
                                    <X className="h-4 w-4 text-muted-foreground" />
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleStartEdit(user)}
                                    title="Edit user"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  {isSuperadmin && (
                                    <>
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
                                        onClick={() => handleResetPassword(user.email)}
                                        title="Reset password"
                                      >
                                        <KeyRound className="h-4 w-4 text-blue-500" />
                                      </Button>
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
                                    </>
                                  )}
                                </>
                              )}
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
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently remove the user's role assignment. They will lose all access to
                the dashboard and cannot be restored automatically. Are you sure you want to continue?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setUserToDelete(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteUser}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Yes, Remove Role
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog open={addUserDialogOpen} onOpenChange={setAddUserDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new user account with the specified role and permissions.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleCreateUser)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="user@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="+44 123 456 7890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="company_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Company Ltd" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="postal_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal Code (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="SW1A 1AA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="superadmin">Superadmin</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setAddUserDialogOpen(false);
                      form.reset();
                    }}
                    disabled={isCreatingUser}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isCreatingUser}>
                    {isCreatingUser && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create User
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default UsersPage;

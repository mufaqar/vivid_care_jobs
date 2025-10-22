import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, Phone, Flame } from "lucide-react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Stats {
  totalLeads: number;
  newLeads: number;
  hotLeads: number;
  calledLeads: number;
}

const Dashboard = () => {
  const { user, loading, isSuperadmin, isAdmin, isManager } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({
    totalLeads: 0,
    newLeads: 0,
    hotLeads: 0,
    calledLeads: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      // Build base query with role-based filtering
      let totalLeadsQuery = supabase.from("leads").select("*", { count: "exact", head: true });
      let newLeadsQuery = supabase.from("leads").select("*", { count: "exact", head: true });
      
      // If user is a manager, filter by assigned leads
      if (isManager && !isSuperadmin && !isAdmin) {
        totalLeadsQuery = totalLeadsQuery.eq("assigned_manager_id", user?.id);
        newLeadsQuery = newLeadsQuery.eq("assigned_manager_id", user?.id);
      }

      // Get total leads
      const { count: totalCount } = await totalLeadsQuery;

      // Get new leads (created this month)
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const { count: newCount } = await newLeadsQuery.gte("created_at", startOfMonth.toISOString());

      // Get hot leads - need to join with leads table for manager filtering
      let hotLeadsQuery = supabase
        .from("lead_tags")
        .select("lead_id", { count: "exact", head: true })
        .eq("tag", "hot");

      if (isManager && !isSuperadmin && !isAdmin) {
        // For managers, get their lead IDs first
        const { data: managerLeads } = await supabase
          .from("leads")
          .select("id")
          .eq("assigned_manager_id", user?.id);
        
        const leadIds = managerLeads?.map(l => l.id) || [];
        hotLeadsQuery = hotLeadsQuery.in("lead_id", leadIds.length > 0 ? leadIds : ['00000000-0000-0000-0000-000000000000']);
      }

      const { count: hotCount } = await hotLeadsQuery;

      // Get called leads (this week)
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      
      let calledLeadsQuery = supabase
        .from("lead_tags")
        .select("lead_id", { count: "exact", head: true })
        .eq("tag", "called")
        .gte("created_at", startOfWeek.toISOString());

      if (isManager && !isSuperadmin && !isAdmin) {
        // For managers, get their lead IDs first
        const { data: managerLeads } = await supabase
          .from("leads")
          .select("id")
          .eq("assigned_manager_id", user?.id);
        
        const leadIds = managerLeads?.map(l => l.id) || [];
        calledLeadsQuery = calledLeadsQuery.in("lead_id", leadIds.length > 0 ? leadIds : ['00000000-0000-0000-0000-000000000000']);
      }

      const { count: calledCount } = await calledLeadsQuery;

      setStats({
        totalLeads: totalCount || 0,
        newLeads: newCount || 0,
        hotLeads: hotCount || 0,
        calledLeads: calledCount || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setStatsLoading(false);
    }
  };

  if (loading || statsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your leads.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLeads}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Leads</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.newLeads}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hot Leads</CardTitle>
              <Flame className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.hotLeads}</div>
              <p className="text-xs text-muted-foreground">Requires attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Called</CardTitle>
              <Phone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.calledLeads}</div>
              <p className="text-xs text-muted-foreground">This week</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;

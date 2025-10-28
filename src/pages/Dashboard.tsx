import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, Phone, Flame } from "lucide-react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface Stats {
  totalLeads: number;
  newLeads: number;
  hotLeads: number;
  calledLeads: number;
}

interface ChartData {
  date: string;
  leads: number;
  contacted: number;
  converted: number;
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
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchStats();
      fetchChartData();
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

  const fetchChartData = async () => {
    try {
      // Get leads from the last 7 days
      const days = 7;
      const chartDataArray: ChartData[] = [];

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        // Build base queries with role-based filtering
        let leadsQuery = supabase
          .from("leads")
          .select("*", { count: "exact", head: true })
          .gte("created_at", date.toISOString())
          .lt("created_at", nextDate.toISOString());

        let contactedQuery = supabase
          .from("leads")
          .select("*", { count: "exact", head: true })
          .eq("status", "contacted")
          .gte("created_at", date.toISOString())
          .lt("created_at", nextDate.toISOString());

        let convertedQuery = supabase
          .from("leads")
          .select("*", { count: "exact", head: true })
          .eq("status", "converted")
          .gte("created_at", date.toISOString())
          .lt("created_at", nextDate.toISOString());

        // If user is a manager, filter by assigned leads
        if (isManager && !isSuperadmin && !isAdmin) {
          leadsQuery = leadsQuery.eq("assigned_manager_id", user?.id);
          contactedQuery = contactedQuery.eq("assigned_manager_id", user?.id);
          convertedQuery = convertedQuery.eq("assigned_manager_id", user?.id);
        }

        const [{ count: leadsCount }, { count: contactedCount }, { count: convertedCount }] = await Promise.all([
          leadsQuery,
          contactedQuery,
          convertedQuery,
        ]);

        chartDataArray.push({
          date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          leads: leadsCount || 0,
          contacted: contactedCount || 0,
          converted: convertedCount || 0,
        });
      }

      setChartData(chartDataArray);
    } catch (error) {
      console.error("Error fetching chart data:", error);
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
          <Card className="bg-gradient-to-br from-blue-300 to-blue-400 text-blue-900 border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
              <Users className="h-4 w-4 opacity-70" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLeads}</div>
              <p className="text-xs opacity-70">All time</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-300 to-cyan-400 text-cyan-900 border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Leads</CardTitle>
              <UserCheck className="h-4 w-4 opacity-70" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.newLeads}</div>
              <p className="text-xs opacity-70">This month</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-300 to-red-400 text-orange-900 border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hot Leads</CardTitle>
              <Flame className="h-4 w-4 opacity-70" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.hotLeads}</div>
              <p className="text-xs opacity-70">Requires attention</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-300 to-emerald-400 text-green-900 border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Called</CardTitle>
              <Phone className="h-4 w-4 opacity-70" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.calledLeads}</div>
              <p className="text-xs opacity-70">This week</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Leads Overview - Last 7 Days</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs"
                  tick={{ fill: "currentColor" }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: "currentColor" }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px"
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="leads" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  name="New Leads"
                  dot={{ fill: "#3b82f6", r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="contacted" 
                  stroke="#06b6d4" 
                  strokeWidth={3}
                  name="Contacted"
                  dot={{ fill: "#06b6d4", r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="converted" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  name="Converted"
                  dot={{ fill: "#10b981", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;

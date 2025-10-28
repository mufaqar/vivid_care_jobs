import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, Phone, Flame } from "lucide-react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const [timeFilter, setTimeFilter] = useState("last_7_days");

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
  }, [user, timeFilter]);

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const now = new Date();
      let startDate = new Date();
      let endDate = new Date();

      // Calculate start date and end date based on filter
      switch (timeFilter) {
        case "today":
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
          break;
        case "yesterday":
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
          endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case "last_7_days":
          startDate.setDate(now.getDate() - 6);
          endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
          break;
        case "last_2_weeks":
          startDate.setDate(now.getDate() - 13);
          endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
          break;
        case "last_30_days":
          startDate.setDate(now.getDate() - 29);
          endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
          break;
        case "last_month":
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          endDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case "this_month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
          break;
        case "last_6_months":
          startDate.setMonth(now.getMonth() - 5);
          startDate.setDate(1);
          endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
          break;
        case "year":
          startDate = new Date(now.getFullYear(), 0, 1);
          endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
          break;
        case "last_year":
          startDate = new Date(now.getFullYear() - 1, 0, 1);
          endDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate.setDate(now.getDate() - 6);
          endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      }

      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);

      // Build base query with role-based filtering
      let totalLeadsQuery = supabase.from("leads").select("*", { count: "exact", head: true });
      let newLeadsQuery = supabase.from("leads").select("*", { count: "exact", head: true });
      
      // If user is a manager, filter by assigned leads
      if (isManager && !isSuperadmin && !isAdmin) {
        totalLeadsQuery = totalLeadsQuery.eq("assigned_manager_id", user?.id);
        newLeadsQuery = newLeadsQuery.eq("assigned_manager_id", user?.id);
      }

      // Apply date filter to both queries
      totalLeadsQuery = totalLeadsQuery.gte("created_at", startDate.toISOString()).lt("created_at", endDate.toISOString());
      newLeadsQuery = newLeadsQuery.gte("created_at", startDate.toISOString()).lt("created_at", endDate.toISOString()).eq("status", "new");

      // Get total leads in time period
      const { count: totalCount } = await totalLeadsQuery;

      // Get new leads in time period
      const { count: newCount } = await newLeadsQuery;

      // Get hot leads - need to join with leads table for manager filtering
      let hotLeadsQuery = supabase
        .from("lead_tags")
        .select("lead_id, created_at", { count: "exact", head: true })
        .eq("tag", "hot")
        .gte("created_at", startDate.toISOString())
        .lt("created_at", endDate.toISOString());

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

      // Get called leads in time period
      let calledLeadsQuery = supabase
        .from("lead_tags")
        .select("lead_id, created_at", { count: "exact", head: true })
        .eq("tag", "called")
        .gte("created_at", startDate.toISOString())
        .lt("created_at", endDate.toISOString());

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
      const chartDataArray: ChartData[] = [];
      const now = new Date();
      let startDate = new Date();
      let days = 7;
      let dateFormat: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };

      // Calculate start date and number of days based on filter
      switch (timeFilter) {
        case "today":
          days = 1;
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          dateFormat = { hour: "2-digit", minute: "2-digit" };
          break;
        case "yesterday":
          days = 1;
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
          dateFormat = { hour: "2-digit", minute: "2-digit" };
          break;
        case "last_7_days":
          days = 7;
          startDate.setDate(now.getDate() - 6);
          break;
        case "last_2_weeks":
          days = 14;
          startDate.setDate(now.getDate() - 13);
          break;
        case "last_30_days":
          days = 30;
          startDate.setDate(now.getDate() - 29);
          break;
        case "last_month":
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const lastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
          days = lastMonth.getDate();
          break;
        case "this_month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          days = now.getDate();
          break;
        case "last_6_months":
          days = 6;
          startDate.setMonth(now.getMonth() - 5);
          dateFormat = { month: "short", year: "numeric" };
          break;
        case "year":
          days = 12;
          startDate = new Date(now.getFullYear(), 0, 1);
          dateFormat = { month: "short" };
          break;
        case "last_year":
          days = 12;
          startDate = new Date(now.getFullYear() - 1, 0, 1);
          dateFormat = { month: "short", year: "numeric" };
          break;
        default:
          days = 7;
          startDate.setDate(now.getDate() - 6);
      }

      startDate.setHours(0, 0, 0, 0);

      // For hourly data (today/yesterday)
      if (timeFilter === "today" || timeFilter === "yesterday") {
        for (let i = 0; i < 24; i++) {
          const date = new Date(startDate);
          date.setHours(i);
          
          const nextHour = new Date(date);
          nextHour.setHours(i + 1);

          let leadsQuery = supabase
            .from("leads")
            .select("*", { count: "exact", head: true })
            .gte("created_at", date.toISOString())
            .lt("created_at", nextHour.toISOString());

          let contactedQuery = supabase
            .from("leads")
            .select("*", { count: "exact", head: true })
            .eq("status", "contacted")
            .gte("created_at", date.toISOString())
            .lt("created_at", nextHour.toISOString());

          let convertedQuery = supabase
            .from("leads")
            .select("*", { count: "exact", head: true })
            .eq("status", "converted")
            .gte("created_at", date.toISOString())
            .lt("created_at", nextHour.toISOString());

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
            date: `${i}:00`,
            leads: leadsCount || 0,
            contacted: contactedCount || 0,
            converted: convertedCount || 0,
          });
        }
      } 
      // For monthly data (last 6 months, year, last year)
      else if (timeFilter === "last_6_months" || timeFilter === "year" || timeFilter === "last_year") {
        const monthCount = timeFilter === "year" || timeFilter === "last_year" ? 12 : 6;
        for (let i = 0; i < monthCount; i++) {
          const date = new Date(startDate);
          date.setMonth(startDate.getMonth() + i);
          
          const nextMonth = new Date(date);
          nextMonth.setMonth(date.getMonth() + 1);

          let leadsQuery = supabase
            .from("leads")
            .select("*", { count: "exact", head: true })
            .gte("created_at", date.toISOString())
            .lt("created_at", nextMonth.toISOString());

          let contactedQuery = supabase
            .from("leads")
            .select("*", { count: "exact", head: true })
            .eq("status", "contacted")
            .gte("created_at", date.toISOString())
            .lt("created_at", nextMonth.toISOString());

          let convertedQuery = supabase
            .from("leads")
            .select("*", { count: "exact", head: true })
            .eq("status", "converted")
            .gte("created_at", date.toISOString())
            .lt("created_at", nextMonth.toISOString());

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
            date: date.toLocaleDateString("en-US", dateFormat),
            leads: leadsCount || 0,
            contacted: contactedCount || 0,
            converted: convertedCount || 0,
          });
        }
      }
      // For daily data (default)
      else {
        for (let i = 0; i < days; i++) {
          const date = new Date(startDate);
          date.setDate(startDate.getDate() + i);
          
          const nextDate = new Date(date);
          nextDate.setDate(nextDate.getDate() + 1);

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
            date: date.toLocaleDateString("en-US", dateFormat),
            leads: leadsCount || 0,
            contacted: contactedCount || 0,
            converted: convertedCount || 0,
          });
        }
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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <p className="text-muted-foreground">
              Welcome back! Here's an overview of your leads.
            </p>
          </div>
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="last_7_days">Last 7 Days</SelectItem>
              <SelectItem value="last_2_weeks">Last 2 Weeks</SelectItem>
              <SelectItem value="last_30_days">Last 30 Days</SelectItem>
              <SelectItem value="last_month">Last Month</SelectItem>
              <SelectItem value="this_month">This Month</SelectItem>
              <SelectItem value="last_6_months">Last 6 Months</SelectItem>
              <SelectItem value="year">Year</SelectItem>
              <SelectItem value="last_year">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-blue-300 to-blue-400 text-blue-900 border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
              <Users className="h-4 w-4 opacity-70" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLeads}</div>
              <p className="text-xs opacity-70">In selected period</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-300 to-cyan-400 text-cyan-900 border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Leads</CardTitle>
              <UserCheck className="h-4 w-4 opacity-70" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.newLeads}</div>
              <p className="text-xs opacity-70">In selected period</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-300 to-red-400 text-orange-900 border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hot Leads</CardTitle>
              <Flame className="h-4 w-4 opacity-70" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.hotLeads}</div>
              <p className="text-xs opacity-70">In selected period</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-300 to-emerald-400 text-green-900 border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Called</CardTitle>
              <Phone className="h-4 w-4 opacity-70" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.calledLeads}</div>
              <p className="text-xs opacity-70">In selected period</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Leads Overview</CardTitle>
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

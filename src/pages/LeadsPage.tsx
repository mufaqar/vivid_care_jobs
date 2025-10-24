import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { LeadsTable } from "@/components/dashboard/LeadsTable";
import { LeadsFilters } from "@/components/dashboard/LeadsFilters";
import { Loader2 } from "lucide-react";

export interface LeadFilters {
  status?: string;
  assignedManager?: string;
  tags?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

const LeadsPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<LeadFilters>({});
  const [leadsCount, setLeadsCount] = useState<number>(0);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
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
          <h2 className="text-3xl font-bold tracking-tight">
            Leads ({leadsCount})
          </h2>
          <p className="text-muted-foreground">
            Manage and track all your leads in one place.
          </p>
        </div>

        <LeadsFilters filters={filters} onFiltersChange={setFilters} />
        <LeadsTable filters={filters} onLeadsCountChange={setLeadsCount} />
      </div>
    </DashboardLayout>
  );
};

export default LeadsPage;

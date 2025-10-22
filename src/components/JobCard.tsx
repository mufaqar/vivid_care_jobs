import { Button } from "@/components/ui/button";
import { MapPin, Clock, Briefcase } from "lucide-react";

interface JobCardProps {
  title: string;
  location: string;
  type: string;
  salary: string;
}

const JobCard = ({ title, location, type, salary }: JobCardProps) => {
  return (
    <div className="bg-card rounded-2xl p-6 shadow-sm border border-border hover:shadow-lg transition-all hover:-translate-y-1 duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
          <Briefcase className="w-6 h-6 text-accent" />
        </div>
        <span className="px-3 py-1 bg-success/10 text-success text-xs font-medium rounded-full">
          Active
        </span>
      </div>
      
      <h3 className="text-xl font-semibold text-foreground mb-3">{title}</h3>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span>{location}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>{type}</span>
        </div>
      </div>
      
      <div className="pt-4 border-t border-border">
        <p className="text-lg font-semibold text-accent mb-4">{salary}</p>
        <Button variant="cyan" className="w-full">Apply Now</Button>
      </div>
    </div>
  );
};

export default JobCard;

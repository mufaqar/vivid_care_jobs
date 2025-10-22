import { Button } from "@/components/ui/button";
import { MapPin, Clock } from "lucide-react";
import justLogo from "@/assets/just-logo-2.png";

interface JobCardProps {
  title: string;
  location: string;
  type: string;
  salary: string;
  status?: string;
}

const JobCard = ({ title, location, type, salary, status = "Active" }: JobCardProps) => {
  const isGone = status === "Filled";
  return (
    <div className="bg-card rounded-2xl p-6 shadow-sm border border-border hover:shadow-lg transition-all hover:-translate-y-1 duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center p-2">
          <img src={justLogo} alt="Just Healthcare" className="w-full h-full object-contain" />
        </div>
        <span 
          className="px-3 py-1 text-xs font-medium rounded-full"
          style={isGone ? { backgroundColor: '#FEF3EB', color: '#8B4513' } : {}}
          {...(!isGone && { className: "px-3 py-1 bg-success/10 text-success text-xs font-medium rounded-full" })}
        >
          {status}
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

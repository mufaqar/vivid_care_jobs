import { useState } from "react";
import JobCard from "./JobCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const jobsData = [
  { title: "Registered Nurse", location: "London, UK", type: "Full-time", salary: "£30,000 - £40,000" },
  { title: "Support Worker", location: "Manchester, UK", type: "Part-time", salary: "£20,000 - £25,000" },
  { title: "Healthcare Assistant", location: "Birmingham, UK", type: "Full-time", salary: "£22,000 - £28,000" },
  { title: "Care Coordinator", location: "Leeds, UK", type: "Full-time", salary: "£28,000 - £35,000" },
  { title: "Senior Nurse", location: "Liverpool, UK", type: "Full-time", salary: "£35,000 - £45,000" },
  { title: "Night Support Worker", location: "Bristol, UK", type: "Night Shift", salary: "£23,000 - £28,000" },
  { title: "Dementia Care Worker", location: "Newcastle, UK", type: "Full-time", salary: "£24,000 - £30,000" },
  { title: "Learning Disability Nurse", location: "Sheffield, UK", type: "Full-time", salary: "£32,000 - £38,000" },
  { title: "Mental Health Support Worker", location: "Nottingham, UK", type: "Full-time", salary: "£25,000 - £30,000" },
  { title: "Complex Care Nurse", location: "Southampton, UK", type: "Full-time", salary: "£38,000 - £48,000" },
  { title: "Palliative Care Nurse", location: "Oxford, UK", type: "Part-time", salary: "£30,000 - £38,000" },
  { title: "Children's Support Worker", location: "Cambridge, UK", type: "Full-time", salary: "£24,000 - £29,000" },
];

const JobsGrid = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleJobs, setVisibleJobs] = useState(8);

  const filteredJobs = jobsData.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section id="jobs" className="py-16 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Find Your Perfect Healthcare Role
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Browse through our current opportunities and take the next step in your career
          </p>
          
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="Search jobs by title or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 rounded-full border-2"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {filteredJobs.slice(0, visibleJobs).map((job, index) => (
            <JobCard key={index} {...job} />
          ))}
        </div>

        {filteredJobs.length > visibleJobs && (
          <div className="text-center">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setVisibleJobs(prev => prev + 4)}
            >
              Load More Jobs
            </Button>
          </div>
        )}

        {filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">No jobs found. Try adjusting your search.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default JobsGrid;

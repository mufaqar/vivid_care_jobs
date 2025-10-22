import { useState } from "react";
import { Button } from "@/components/ui/button";
import LeadOnboardingDialog from "./LeadOnboardingDialog";

const CTABar = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <section className="w-full py-8" style={{ backgroundColor: '#ED1B7B' }}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
          <Button 
            variant="outline" 
            size="lg"
            className="bg-white text-[#ED1B7B] hover:bg-white/90 hover:text-[#0B1D41] border-white font-semibold px-12 py-6 text-lg transition-colors"
          >
            Find Care
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            className="bg-white text-[#ED1B7B] hover:bg-white/90 hover:text-[#0B1D41] border-white font-semibold px-12 py-6 text-lg transition-colors"
            onClick={() => setDialogOpen(true)}
          >
            Find Carers
          </Button>
        </div>
      </div>

      <LeadOnboardingDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </section>
  );
};

export default CTABar;

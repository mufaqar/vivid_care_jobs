import { Button } from "@/components/ui/button";

const CTABar = () => {
  return (
    <section className="w-full py-8" style={{ backgroundColor: '#ED1B7B' }}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
          <Button 
            variant="outline" 
            size="lg"
            className="bg-white text-[#ED1B7B] hover:bg-white/90 border-white font-semibold px-8"
          >
            Find Care
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            className="bg-white text-[#ED1B7B] hover:bg-white/90 border-white font-semibold px-8"
          >
            Find Carers
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTABar;

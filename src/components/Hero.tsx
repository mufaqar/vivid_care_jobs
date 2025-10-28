import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import heroImage from "@/assets/hero-healthcare.jpg";

const Hero = () => {
  return (
    <section className="min-h-screen bg-gradient-to-r from-[#EAF4FC] to-[#FDEAF3] flex items-center justify-center ">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              <span style={{ color: '#ED1B7B' }}>Available</span> Healthcare Jobs
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Join our team of dedicated healthcare professionals. We have exciting opportunities across various roles to help you grow your career in healthcare.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button variant="cyan" size="lg">Browse Jobs</Button>
              <Button variant="outline" size="lg">Upload Your CV</Button>
            </div>
          </div>
          
          <div className="relative">
            <div className="rounded-3xl overflow-hidden shadow-2xl">
              <img 
                src={heroImage} 
                alt="Healthcare professionals collaborating"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
              <button className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-card rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform">
                <Play className="w-8 h-8 text-accent fill-accent ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

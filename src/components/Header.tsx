import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-card/95">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
            <span className="text-accent-foreground font-bold text-xl">V</span>
          </div>
          <span className="text-xl font-bold text-foreground">Vivid Care</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-8">
          <a href="#" className="text-foreground hover:text-accent transition-colors">Home</a>
          <a href="#jobs" className="text-foreground hover:text-accent transition-colors">Jobs</a>
          <a href="#about" className="text-foreground hover:text-accent transition-colors">About Us</a>
          <a href="#contact" className="text-foreground hover:text-accent transition-colors">Contact</a>
        </nav>
        
        <div className="flex items-center gap-4">
          <a href="tel:03333589301" className="hidden sm:flex items-center gap-2 text-foreground hover:text-accent transition-colors">
            <Phone className="w-4 h-4" />
            <span className="font-medium">03333 589 301</span>
          </a>
          <Button variant="cyan" size="sm">Apply Now</Button>
        </div>
      </div>
    </header>
  );
};

export default Header;

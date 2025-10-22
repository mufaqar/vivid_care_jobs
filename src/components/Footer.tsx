import { Facebook, Twitter, Linkedin, Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                <span className="text-accent-foreground font-bold text-xl">V</span>
              </div>
              <span className="text-xl font-bold">Vivid Care</span>
            </div>
            <p className="opacity-80 text-sm">
              Connecting healthcare professionals with exceptional opportunities since 2008.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li><a href="#" className="hover:text-accent transition-colors">Home</a></li>
              <li><a href="#jobs" className="hover:text-accent transition-colors">Browse Jobs</a></li>
              <li><a href="#about" className="hover:text-accent transition-colors">About Us</a></li>
              <li><a href="#contact" className="hover:text-accent transition-colors">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">For Candidates</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li><a href="#" className="hover:text-accent transition-colors">Register</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Upload CV</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Career Advice</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">FAQs</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Contact Info</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li>Phone: 03333 589 301</li>
              <li>Email: info@vividcare.co.uk</li>
              <li>Address: London, UK</li>
            </ul>
            <div className="flex gap-4 mt-4">
              <a href="#" className="hover:text-accent transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-accent transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-accent transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-accent transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-primary-foreground/20 pt-8 text-center text-sm opacity-80">
          <p>&copy; 2024 Vivid Care Recruitment. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

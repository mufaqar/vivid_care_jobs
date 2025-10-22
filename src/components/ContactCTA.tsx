import { Button } from "@/components/ui/button";
import { Phone, Mail, MessageCircle } from "lucide-react";

const ContactCTA = () => {
  return (
    <section id="contact" className="py-16 bg-pink/5">
      <div className="container mx-auto px-4">
        <div className="bg-card rounded-3xl p-8 md:p-12 shadow-lg border border-border">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              You Have Questions, We Have Answers
            </h2>
            <p className="text-lg text-muted-foreground">
              Get in touch with our friendly team to discuss your career options
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-accent/10 rounded-2xl flex items-center justify-center">
                <Phone className="w-8 h-8 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Call Us</h3>
              <a href="tel:03333589301" className="text-accent hover:underline">
                03333 589 301
              </a>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-pink/10 rounded-2xl flex items-center justify-center">
                <Mail className="w-8 h-8 text-pink" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Email Us</h3>
              <a href="mailto:info@vividcare.co.uk" className="text-pink hover:underline">
                info@vividcare.co.uk
              </a>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-success/10 rounded-2xl flex items-center justify-center">
                <MessageCircle className="w-8 h-8 text-success" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Live Chat</h3>
              <Button variant="ghost" className="text-success hover:text-success">
                Start Chat
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactCTA;

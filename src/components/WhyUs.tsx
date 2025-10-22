import teamImage from "@/assets/team-healthcare.jpg";
import { CheckCircle } from "lucide-react";

const benefits = [
  "Competitive Salaries",
  "Flexible Working Hours",
  "Professional Development",
  "Comprehensive Training",
  "Career Progression",
  "Supportive Team Environment"
];

const WhyUs = () => {
  return (
    <section id="about" className="py-16 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              <span style={{ color: '#ED1B7B' }}>We Excel in</span> Healthcare Job Recruitment
            </h2>
            <p className="text-lg opacity-90 leading-relaxed">
              At Vivid Care Recruitment, we're passionate about connecting talented healthcare professionals with rewarding opportunities. Our dedicated team works tirelessly to match your skills with the perfect role.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 flex-shrink-0" color="#ED1B7B" />
                  <span className="opacity-90">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="rounded-3xl overflow-hidden shadow-2xl">
            <img 
              src={teamImage}
              alt="Healthcare team"
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyUs;

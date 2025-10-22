import { Upload, UserCheck, Repeat } from "lucide-react";

const features = [
  {
    icon: Upload,
    title: "Upload CV",
    description: "Quick and easy application process",
    color: "bg-success/10 text-success"
  },
  {
    icon: UserCheck,
    title: "In-Branch Register",
    description: "Visit us for personalized assistance",
    color: "bg-pink/10 text-pink"
  },
  {
    icon: Repeat,
    title: "Shortlisted Repeat",
    description: "We'll keep you updated on opportunities",
    color: "bg-warning/10 text-warning"
  }
];

const Features = () => {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index}
                className="bg-card rounded-2xl p-8 shadow-sm border border-border hover:shadow-md transition-shadow"
              >
                <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;

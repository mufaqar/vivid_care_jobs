import careLogo from "@/assets/care-logo.png";

const features = [
  {
    title: "Upload CV",
    description: "Quick and easy application process"
  },
  {
    title: "In-Branch Register",
    description: "Visit us for personalized assistance"
  },
  {
    title: "Shortlisted Repeat",
    description: "We'll keep you updated on opportunities"
  }
];

const Features = () => {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-card rounded-2xl p-8 shadow-sm border border-border hover:shadow-md transition-shadow"
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: '#FCEAF3' }}>
                <img src={careLogo} alt="Care icon" className="w-8 h-8 object-contain" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;

const stats = [
  { number: "500+", label: "Jobs Filled" },
  { number: "15", label: "Years Experience" },
  { number: "95%", label: "Client Satisfaction" }
];

const Stats = () => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Making a Difference Every Day
          </h2>
          <p className="text-lg text-muted-foreground">
            Our track record speaks for itself
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-5xl md:text-6xl font-bold text-accent mb-2">
                {stat.number}
              </div>
              <div className="text-lg text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;

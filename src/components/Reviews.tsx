import { Star } from "lucide-react";

const reviews = [
  {
    name: "Sarah Johnson",
    role: "Registered Nurse",
    rating: 5,
    comment: "Vivid Care helped me find the perfect role. The team was supportive throughout the entire process."
  },
  {
    name: "Michael Chen",
    role: "Healthcare Assistant",
    rating: 5,
    comment: "Professional service and great communication. I couldn't be happier with my new position."
  },
  {
    name: "Emma Williams",
    role: "Support Worker",
    rating: 5,
    comment: "They truly care about matching you with the right opportunity. Highly recommend their services."
  }
];

const Reviews = () => {
  return (
    <section className="py-16 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            What Our Candidates Say
          </h2>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {reviews.map((review, index) => (
            <div key={index} className="bg-card rounded-2xl p-6 shadow-sm border border-border">
              <div className="flex gap-1 mb-4">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-warning text-warning" />
                ))}
              </div>
              <p className="text-muted-foreground mb-4 italic">"{review.comment}"</p>
              <div>
                <p className="font-semibold text-foreground">{review.name}</p>
                <p className="text-sm text-muted-foreground">{review.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Reviews;

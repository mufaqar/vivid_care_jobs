import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import JobsGrid from "@/components/JobsGrid";
import WhyUs from "@/components/WhyUs";
import Stats from "@/components/Stats";
import Reviews from "@/components/Reviews";
import ContactCTA from "@/components/ContactCTA";
import CTABar from "@/components/CTABar";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <Features />
      <JobsGrid />
      <WhyUs />
      <Stats />
      <Reviews />
      <ContactCTA />
      <CTABar />
      <Footer />
    </div>
  );
};

export default Index;

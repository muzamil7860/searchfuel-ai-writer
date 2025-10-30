import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Martinez",
    title: "SEO Manager",
    company: "Growth Digital",
    quote: "Our organic traffic tripled in 6 months. The AI-generated content ranks better than what our writers were producing manually.",
    initials: "SM"
  },
  {
    name: "David Chen",
    title: "CEO",
    company: "ContentScale",
    quote: "SearchFuel's automated content pipeline was more than enough to get our clients ranking on page one in just 90 days.",
    initials: "DC"
  },
  {
    name: "Jessica Williams",
    title: "Director of Marketing",
    company: "TechCorp",
    quote: "We went from publishing 10 articles a month to 200+ with SearchFuel. Our domain authority jumped from 35 to 58 in a year.",
    initials: "JW"
  },
  {
    name: "Marcus Thompson",
    title: "Founder",
    company: "RankMountain",
    quote: "The keyword optimization is incredible. Every article hits our target keywords naturally, and Google loves it.",
    initials: "MT"
  },
  {
    name: "Dr. Emily Rodriguez",
    title: "Content Director",
    company: "HealthRank Pro",
    quote: "With SearchFuel's automation, we're ranking for thousands of long-tail keywords and driving qualified traffic consistently.",
    initials: "ER"
  },
  {
    name: "James Patterson",
    title: "Head of SEO & Strategy",
    company: "ConversionLabs",
    quote: "We generate thousands of articles through SearchFuel, and the rankings speak for themselves. Our organic conversions have skyrocketed. The CMS integration is seamless, support is excellent, and the ROI is undeniable.",
    initials: "JP"
  }
];

export const SEOTestimonials = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
          Don't Take Our Word, Hear From <span className="text-accent">Actual SEO Professionals</span>...
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-accent/10 text-accent font-semibold">
                    {testimonial.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold">{testimonial.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.title} at {testimonial.company}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                ))}
              </div>
              
              <p className="text-base leading-relaxed text-foreground">
                "{testimonial.quote}"
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

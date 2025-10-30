import { FileText, Target, Send } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const SEOContentFeatures = () => {
  const features = [
    {
      icon: FileText,
      title: "AI-Powered Article Generation",
      description: "Generate SEO-optimized articles in minutes, not hours",
      color: "text-primary"
    },
    {
      icon: Target,
      title: "Keyword-Optimized Content",
      description: "Automatically optimize content for your target keywords",
      color: "text-accent"
    },
    {
      icon: Send,
      title: "Multi-Platform Publishing",
      description: "Publish directly to your CMS with one click",
      color: "text-primary"
    }
  ];

  return (
    <section className="py-24 px-4 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
          Content That <span className="text-accent">Ranks</span> and{" "}
          <span className="text-accent">Resonates</span>
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index}
                className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50"
              >
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Icon className={`w-8 h-8 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SEOContentFeatures;

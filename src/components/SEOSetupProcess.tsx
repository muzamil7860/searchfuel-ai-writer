import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Calendar, Settings, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SEOSetupProcess = () => {
  const navigate = useNavigate();

  const steps = [
    {
      icon: Calendar,
      title: "Book a Demo",
      description: "Initial consultation to understand your SEO goals"
    },
    {
      icon: Check,
      title: "User signs up",
      description: "Create your account and access the platform"
    },
    {
      icon: Globe,
      title: "CMS Integration",
      description: "Connect WordPress, Ghost, or other platforms"
    },
    {
      icon: Settings,
      title: "Onboarding call",
      description: "Strategy session and content planning"
    }
  ];

  return (
    <section className="py-24 px-4 bg-muted/30">
      <div className="container mx-auto max-w-4xl">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-6">
          White Glove Setup. Built for{" "}
          <span className="text-accent">High-Volume Content</span> Funnels.
        </h2>
        
        <p className="text-lg text-muted-foreground text-center mb-10 max-w-3xl mx-auto">
          We help you integrate, onboard, and launch quickly with the right SEO and content 
          workflows—perfect for content teams, SEO agencies, and marketing departments.
        </p>

        <div className="flex justify-center mb-12">
          <Button
            size="lg"
            onClick={() => navigate("/auth?mode=signup")}
            className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-8 h-14"
          >
            Book a Demo
          </Button>
        </div>

        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="space-y-6">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={index} className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-accent" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{step.title}</h3>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                    {index < steps.length - 1 && (
                      <div className="absolute left-[60px] mt-12 h-6 w-0.5 bg-border" 
                           style={{ marginLeft: '1.5rem' }} />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default SEOSetupProcess;

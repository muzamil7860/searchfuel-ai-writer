import { Card } from "@/components/ui/card";
import { Check, X } from "lucide-react";

export const SEOComparison = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-background to-accent/5 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            No Complex SEO Tools. Just AI-Powered Content Growth.
          </h2>
          <p className="text-lg text-muted-foreground">
            Traditional SEO requires expensive tools, manual keyword research, and months of work. 
            We simplify that. Just plug in your website and start generating content that ranks.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Traditional SEO Workflow */}
          <Card className="p-8 bg-muted/50 backdrop-blur-sm border-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-foreground">Traditional SEO Workflow</h3>
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <span className="text-3xl font-bold text-destructive">5</span>
              </div>
            </div>
            <div className="space-y-4">
              {[
                "Manual keyword research with expensive tools",
                "Competitor analysis and content gap identification",
                "Content briefs must be written manually",
                "Lengthy review and editing process",
                "Manual publishing and tracking rankings"
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <X className="w-4 h-4 text-destructive" />
                  </div>
                  <p className="text-muted-foreground">{item}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* SearchFuel Workflow */}
          <Card className="p-8 bg-card backdrop-blur-sm border-2 border-accent/30 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-foreground">SearchFuel Workflow</h3>
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
                <Check className="w-8 h-8 text-accent" />
              </div>
            </div>
            <div className="space-y-4">
              {[
                "AI scans your website automatically",
                "Instantly identifies ranking opportunities",
                "Generates optimized content in minutes",
                "One-click publish to your CMS",
                "Track rankings in real-time"
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-accent" />
                  </div>
                  <p className="text-foreground font-medium">{item}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

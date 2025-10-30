import { Card } from "@/components/ui/card";
import { Sparkles, TrendingUp, Zap, Target, Globe, BarChart3 } from "lucide-react";

export const SEOComparison = () => {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Forget <span className="text-primary">expensive SEO tools</span> and{" "}
            <span className="text-primary">complex workflows</span>.
          </h2>
          <p className="text-lg text-muted-foreground">
            We scan your website in seconds - no expensive subscriptions, no manual research, 
            and a 99.9% success rate generating content that actually ranks.
          </p>
        </div>

        {/* Top Two Feature Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto mb-8">
          {/* AI-Powered Analysis */}
          <Card className="p-8 bg-card border-2 hover:shadow-lg transition-shadow">
            <div className="mb-6">
              <div className="w-full h-32 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center mb-4">
                <div className="text-center">
                  <Sparkles className="w-12 h-12 text-primary mx-auto mb-2" />
                  <div className="text-sm text-muted-foreground">Your URL</div>
                  <div className="flex items-center gap-2 justify-center mt-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-100" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-200" />
                  </div>
                  <div className="text-xs text-accent font-semibold mt-2">✓ 100+ Keywords Found</div>
                </div>
              </div>
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">🚀 AI-Powered Keyword Discovery</h3>
            <p className="text-muted-foreground">
              Our AI analyzes your entire website. Instantly finds ranking opportunities.
            </p>
          </Card>

          {/* One-Click Publishing */}
          <Card className="p-8 bg-card border-2 hover:shadow-lg transition-shadow">
            <div className="mb-6">
              <div className="w-full h-32 bg-gradient-to-br from-accent/10 to-primary/10 rounded-lg flex items-center justify-center mb-4">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mb-1">
                      <Zap className="w-6 h-6 text-accent" />
                    </div>
                    <div className="text-xs text-muted-foreground">SearchFuel</div>
                  </div>
                  <div className="text-2xl text-primary">→</div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-1">
                      <Globe className="w-6 h-6 text-primary" />
                    </div>
                    <div className="text-xs text-muted-foreground">Your CMS</div>
                  </div>
                </div>
              </div>
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">⚡ One-Click Publishing</h3>
            <p className="text-muted-foreground">
              Generate content and publish directly to WordPress, Webflow, or Framer. No copying and pasting.
            </p>
          </Card>
        </div>

        {/* Bottom Four Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <Card className="p-6 bg-card hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">📈 Real-Time Ranking</h3>
            <p className="text-sm text-muted-foreground">
              Track your keyword positions and see estimated traffic value as you climb search results.
            </p>
          </Card>

          <Card className="p-6 bg-card hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">🎯 Intent Optimization</h3>
            <p className="text-sm text-muted-foreground">
              AI matches search intent perfectly - informational, commercial, or transactional content on demand.
            </p>
          </Card>

          <Card className="p-6 bg-card hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">✨ Auto-Optimization</h3>
            <p className="text-sm text-muted-foreground">
              Every article is automatically optimized for featured snippets, schema markup, and meta tags.
            </p>
          </Card>

          <Card className="p-6 bg-card hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">📊 Competitor Analysis</h3>
            <p className="text-sm text-muted-foreground">
              See exactly what your competitors rank for and identify content gaps you can exploit.
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
};

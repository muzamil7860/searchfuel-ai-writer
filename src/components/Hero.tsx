import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, TrendingUp, Zap } from "lucide-react";
import { useState } from "react";
import heroBackground from "@/assets/hero-background.jpg";

interface HeroProps {
  onScanStart: (url: string) => void;
}

export const Hero = ({ onScanStart }: HeroProps) => {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onScanStart(url);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with gradient overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: `url(${heroBackground})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-primary/90" />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-semibold">AI-Powered SEO Assistant</span>
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-7xl font-bold text-primary-foreground mb-6 animate-fade-in leading-tight">
            Boost Your Search
            <br />
            <span className="bg-gradient-to-r from-accent to-accent/80 bg-clip-text text-transparent">
              Rankings on Autopilot
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-primary-foreground/80 mb-12 max-w-2xl mx-auto animate-fade-in">
            SearchFuel analyzes your website and creates SEO-optimized content that drives traffic and converts visitors into customers.
          </p>

          {/* URL Input Form */}
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-12 animate-fade-in">
            <div className="flex flex-col sm:flex-row gap-4 p-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl">
              <Input
                type="url"
                placeholder="Enter your website URL (e.g., https://example.com)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1 bg-white text-foreground border-0 h-14 text-lg px-6 rounded-xl focus-visible:ring-2 focus-visible:ring-accent"
                required
              />
              <Button
                type="submit"
                variant="hero"
                size="lg"
                className="shrink-0"
              >
                <Zap className="w-5 h-5" />
                Scan Your Site
              </Button>
            </div>
          </form>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto animate-fade-in">
            <div className="flex items-center justify-center gap-3 text-primary-foreground/90">
              <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-accent" />
              </div>
              <span className="font-medium">Instant Analysis</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-primary-foreground/90">
              <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-accent" />
              </div>
              <span className="font-medium">AI-Generated Content</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-primary-foreground/90">
              <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-accent" />
              </div>
              <span className="font-medium">One-Click Publishing</span>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
    </div>
  );
};

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
      // Add https:// if no protocol is specified
      const formattedUrl = url.trim().match(/^https?:\/\//) 
        ? url.trim() 
        : `https://${url.trim()}`;
      onScanStart(formattedUrl);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-left max-w-2xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-emerald-50 border border-emerald-200 mb-8 animate-fade-in">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-sm font-semibold text-gray-700">Built for HighLevel</span>
              <span className="px-2 py-0.5 bg-emerald-500 text-white text-xs font-bold rounded">LIVE</span>
              <span className="text-sm text-gray-600">Installed in <span className="font-semibold text-emerald-600">3,800+</span> Accounts</span>
            </div>

            {/* Heading */}
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-6 animate-fade-in leading-tight">
              Enhance your
              <br />
              <span className="text-gray-900">visibility by using AI.</span> 🤩
            </h1>

            {/* Subheading */}
            <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-xl animate-fade-in leading-relaxed">
              Effortlessly boost your website's presence with AI — blending intelligent technology and easy-to-use SEO solutions.
            </p>

            {/* URL Input Form */}
            <form onSubmit={handleSubmit} className="max-w-xl mb-8 animate-fade-in">
              <div className="flex flex-col sm:flex-row gap-3 p-1.5 bg-white rounded-xl border border-gray-200 shadow-lg">
                <Input
                  type="text"
                  placeholder="yourwebsite.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1 bg-transparent text-foreground border-0 h-14 text-base px-5 rounded-lg focus-visible:ring-2 focus-visible:ring-blue-500 font-medium"
                  required
                />
                <Button
                  type="submit"
                  className="shrink-0 h-14 px-8 text-base font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all"
                  size="lg"
                >
                  Get Started Free
                </Button>
              </div>
            </form>

            {/* Social Proof */}
            <div className="flex items-center gap-3 animate-fade-in">
              <div className="flex -space-x-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white" />
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 border-2 border-white" />
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 border-2 border-white" />
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 border-2 border-white" />
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 border-2 border-white" />
              </div>
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">3,000+</span> Trusted us to generate <span className="font-semibold text-gray-900">2M+</span> Revenue
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative gradient blobs */}
      <div className="absolute top-20 right-10 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl" />
    </div>
  );
};

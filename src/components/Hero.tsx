import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Globe, Search, FileText, CheckCircle, TrendingUp, Edit3, ShoppingBag, Layout, Boxes } from "lucide-react";
import { useState, useEffect } from "react";
import heroBackground from "@/assets/hero-background.jpg";

interface HeroProps {
  onScanStart: (url: string) => void;
}

export const Hero = ({ onScanStart }: HeroProps) => {
  const [url, setUrl] = useState("");
  const [currentPlatform, setCurrentPlatform] = useState(0);

  const platforms = [
    { 
      name: "WordPress", 
      icon: Boxes,
      color: "rgb(33, 117, 155)",
      bgColor: "rgba(33, 117, 155, 0.1)",
      borderColor: "rgba(33, 117, 155, 0.2)"
    },
    { 
      name: "Shopify", 
      icon: ShoppingBag,
      color: "rgb(150, 191, 72)",
      bgColor: "rgba(150, 191, 72, 0.1)",
      borderColor: "rgba(150, 191, 72, 0.2)"
    },
    { 
      name: "Wix", 
      icon: Layout,
      color: "rgb(12, 110, 252)",
      bgColor: "rgba(12, 110, 252, 0.1)",
      borderColor: "rgba(12, 110, 252, 0.2)"
    }
  ];

  const currentPlatformData = platforms[currentPlatform];
  const PlatformIcon = currentPlatformData.icon;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlatform((prev) => (prev + 1) % platforms.length);
    }, 3500);
    
    return () => clearInterval(interval);
  }, []);

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
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Column - Existing Content */}
            <div className="text-left">
              {/* Badge */}
              <div 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md mb-8 transition-all duration-500 ease-in-out"
                style={{
                  backgroundColor: currentPlatformData.bgColor,
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: currentPlatformData.borderColor
                }}
              >
                <div 
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: currentPlatformData.color }}
                />
                <PlatformIcon className="w-4 h-4" style={{ color: currentPlatformData.color }} />
                <span className="text-sm font-semibold text-gray-700">Built for {currentPlatformData.name}</span>
                <span 
                  className="px-2 py-0.5 text-white text-xs font-bold rounded"
                  style={{ backgroundColor: currentPlatformData.color }}
                >
                  LIVE
                </span>
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

            {/* Right Column - SEO Flowchart */}
            <div className="relative animate-fade-in">
              <div className="flex flex-col items-center space-y-4">
                {/* Step 1: Enter URL */}
                <div className="flex items-center gap-3 px-6 py-3 bg-blue-600 text-white rounded-full shadow-lg">
                  <Globe className="w-5 h-5" />
                  <span className="font-semibold">Enter Website URL</span>
                </div>

                {/* Arrow */}
                <div className="w-0.5 h-8 border-l-2 border-dashed border-gray-300" />

                {/* Step 2: AI Scans */}
                <div className="w-full max-w-sm p-6 bg-white rounded-xl border-2 border-gray-200 shadow-md">
                  <div className="flex items-center gap-3 mb-2">
                    <Search className="w-6 h-6 text-blue-600" />
                    <h3 className="font-bold text-gray-900">AI Scans Website</h3>
                  </div>
                  <p className="text-sm text-gray-600">& Analyzes SEO</p>
                </div>

                {/* Arrow */}
                <div className="w-0.5 h-8 border-l-2 border-dashed border-gray-300" />

                {/* Step 3: Generate Content */}
                <div className="w-full max-w-sm p-6 bg-white rounded-xl border-2 border-gray-200 shadow-md">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="w-6 h-6 text-blue-600" />
                    <h3 className="font-bold text-gray-900">Generate Keywords</h3>
                  </div>
                  <p className="text-sm text-gray-600">& Content Ideas</p>
                </div>

                {/* Arrow */}
                <div className="w-0.5 h-8 border-l-2 border-dashed border-gray-300" />

                {/* Decision Point */}
                <div className="text-center text-sm font-semibold text-gray-500 mb-2">
                  Ready to Publish?
                </div>

                {/* Split Branches */}
                <div className="flex gap-4 w-full max-w-sm">
                  <div className="flex-1 p-4 bg-white rounded-lg border-2 border-blue-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-sm text-gray-900">Auto-Publish</span>
                    </div>
                    <p className="text-xs text-gray-600">to CMS</p>
                  </div>
                  <div className="flex-1 p-4 bg-white rounded-lg border-2 border-blue-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <Edit3 className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-sm text-gray-900">Review</span>
                    </div>
                    <p className="text-xs text-gray-600">& Edit Content</p>
                  </div>
                </div>

                {/* Arrow */}
                <div className="w-0.5 h-8 border-l-2 border-dashed border-gray-300" />

                {/* Final Step */}
                <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl shadow-lg">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-6 h-6" />
                    <span className="font-bold text-lg">Rank Higher on Google 📈</span>
                  </div>
                </div>
              </div>
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

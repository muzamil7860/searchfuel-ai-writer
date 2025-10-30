import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface StickyURLInputProps {
  onSubmit: (url: string) => void;
}

export const StickyURLInput = ({ onSubmit }: StickyURLInputProps) => {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      const formattedUrl = url.includes("://") ? url : `https://${url}`;
      onSubmit(formattedUrl);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t shadow-lg animate-slide-in-right">
      <div className="container mx-auto px-6 py-4">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
          <Input
            type="text"
            placeholder="Enter your website URL (e.g., example.com)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 h-12 text-base"
          />
          <Button 
            type="submit" 
            size="lg"
            className="h-12 px-8 gap-2"
          >
            <Sparkles className="w-5 h-5" />
            Start Free Scan
          </Button>
        </form>
      </div>
    </div>
  );
};

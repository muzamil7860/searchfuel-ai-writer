import { useState } from "react";
import { Hero } from "@/components/Hero";
import { ScanResults } from "@/components/ScanResults";
import { ArticleViewer } from "@/components/ArticleViewer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BlogIdea {
  id: string;
  title: string;
  keyword: string;
  intent: "informational" | "commercial" | "transactional";
  reason: string;
}

interface InternalLink {
  anchorText: string;
  targetUrl: string;
}

interface ExternalLink {
  anchorText: string;
  targetUrl: string;
  reason: string;
}

interface GeneratedArticle {
  title: string;
  metaDescription: string;
  content: string;
  keyword: string;
  internalLinks: InternalLink[];
  externalLinks: ExternalLink[];
  socialCaption: string;
}

type AppState = "hero" | "results" | "article";

const Index = () => {
  const [state, setState] = useState<AppState>("hero");
  const [currentUrl, setCurrentUrl] = useState("");
  const [blogIdeas, setBlogIdeas] = useState<BlogIdea[]>([]);
  const [generatedArticle, setGeneratedArticle] = useState<GeneratedArticle | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleScanStart = async (url: string) => {
    setIsLoading(true);
    setCurrentUrl(url);
    
    try {
      const { data, error } = await supabase.functions.invoke('scan-website', {
        body: { url }
      });

      if (error) {
        console.error('Error scanning website:', error);
        toast.error('Failed to scan website. Please try again.');
        return;
      }

      if (data?.blogIdeas && data.blogIdeas.length > 0) {
        setBlogIdeas(data.blogIdeas);
        setState("results");
        toast.success(`Found ${data.blogIdeas.length} blog opportunities!`);
      } else {
        toast.error('No blog ideas found. Please try a different URL.');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (idea: BlogIdea) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-article', {
        body: {
          title: idea.title,
          keyword: idea.keyword,
          intent: idea.intent,
          websiteUrl: currentUrl
        }
      });

      if (error) {
        console.error('Error generating article:', error);
        toast.error('Failed to generate article. Please try again.');
        return;
      }

      if (data?.article) {
        setGeneratedArticle(data.article);
        setState("article");
        toast.success('Article generated successfully!');
      } else {
        toast.error('No article generated. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setState("results");
    setGeneratedArticle(null);
  };

  return (
    <div className="min-h-screen">
      {state === "hero" && <Hero onScanStart={handleScanStart} />}
      
      {state === "results" && (
        <ScanResults
          url={currentUrl}
          blogIdeas={blogIdeas}
          onApprove={handleApprove}
          isLoading={isLoading}
        />
      )}
      
      {state === "article" && generatedArticle && (
        <ArticleViewer article={generatedArticle} onBack={handleBack} />
      )}
    </div>
  );
};

export default Index;

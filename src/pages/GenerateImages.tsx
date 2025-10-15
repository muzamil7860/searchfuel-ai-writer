import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, ImagePlus, CheckCircle, XCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function GenerateImages() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setResults(null);
    
    try {
      console.log("Calling generate-missing-images function...");
      
      const { data, error } = await supabase.functions.invoke('generate-missing-images', {
        body: {}
      });

      if (error) {
        console.error("Function error:", error);
        throw error;
      }

      console.log("Function response:", data);
      setResults(data);
      
      if (data.successful > 0) {
        toast.success(`Successfully generated ${data.successful} images!`);
      } else {
        toast.error("No images were generated. Check the results for details.");
      }
    } catch (error: any) {
      console.error("Error generating images:", error);
      toast.error(error.message || "Failed to generate images");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImagePlus className="h-6 w-6" />
              Generate Missing Blog Images
            </CardTitle>
            <CardDescription>
              This will generate AI-powered featured images for all blog posts that don't have one yet.
              This is a one-time operation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <AlertDescription>
                This process will:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Find all blog posts without featured images</li>
                  <li>Generate unique AI images based on article titles</li>
                  <li>Update each post with the generated image</li>
                  <li>Take approximately 1-2 minutes per image</li>
                </ul>
              </AlertDescription>
            </Alert>

            <Button 
              onClick={handleGenerate} 
              disabled={loading}
              size="lg"
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating Images...
                </>
              ) : (
                <>
                  <ImagePlus className="mr-2 h-5 w-5" />
                  Start Image Generation
                </>
              )}
            </Button>

            {results && (
              <div className="space-y-4 mt-6">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <span className="font-semibold">Total Posts Found:</span>
                  <span className="text-2xl">{results.total}</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-green-500/10 rounded-lg">
                  <span className="font-semibold text-green-700 dark:text-green-400">Successful:</span>
                  <span className="text-2xl text-green-700 dark:text-green-400">{results.successful}</span>
                </div>

                {results.results && results.results.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-semibold">Details:</h3>
                    {results.results.map((result: any, index: number) => (
                      <div 
                        key={index}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          result.success 
                            ? 'bg-green-500/10' 
                            : 'bg-red-500/10'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {result.success ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                          <span className="text-sm">{result.title}</span>
                        </div>
                        {!result.success && result.error && (
                          <span className="text-xs text-muted-foreground">{result.error}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

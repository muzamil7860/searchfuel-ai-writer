import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Search,
  TrendingUp,
  Users,
  FileText,
  Globe,
  Check,
  X,
  Loader2,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface BlogIdea {
  id: string;
  title: string;
  keyword: string;
  intent: "informational" | "commercial" | "transactional";
  reason: string;
  status?: "pending" | "approved" | "rejected" | "generating" | "completed";
}

interface ScanData {
  url: string;
  blogIdeas: BlogIdea[];
  scannedAt: Date;
}

export default function Dashboard() {
  const [url, setUrl] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanData, setScanData] = useState<ScanData | null>(null);
  const [generatingIds, setGeneratingIds] = useState<Set<string>>(new Set());

  const handleScan = async () => {
    if (!url.trim()) {
      toast.error("Please enter a valid URL");
      return;
    }

    setIsScanning(true);

    try {
      const { data, error } = await supabase.functions.invoke("scan-website", {
        body: { url },
      });

      if (error) throw error;

      const blogIdeas = data.blogIdeas.map((idea: any) => ({
        ...idea,
        status: "pending",
      }));

      setScanData({
        url,
        blogIdeas,
        scannedAt: new Date(),
      });

      toast.success("Website scanned successfully!");
    } catch (error) {
      console.error("Scan error:", error);
      toast.error("Failed to scan website. Please try again.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleApprove = async (idea: BlogIdea) => {
    if (!scanData) return;

    setGeneratingIds((prev) => new Set(prev).add(idea.id));

    // Update status to generating
    setScanData({
      ...scanData,
      blogIdeas: scanData.blogIdeas.map((item) =>
        item.id === idea.id ? { ...item, status: "generating" } : item
      ),
    });

    try {
      const { data, error } = await supabase.functions.invoke(
        "generate-article",
        {
          body: {
            title: idea.title,
            keyword: idea.keyword,
            intent: idea.intent,
            websiteUrl: scanData.url,
          },
        }
      );

      if (error) throw error;

      // Update status to completed
      setScanData({
        ...scanData,
        blogIdeas: scanData.blogIdeas.map((item) =>
          item.id === idea.id ? { ...item, status: "completed" } : item
        ),
      });

      toast.success("Article generated and saved successfully!");
    } catch (error) {
      console.error("Generation error:", error);
      toast.error("Failed to generate article. Please try again.");

      // Revert status back to pending on error
      setScanData({
        ...scanData,
        blogIdeas: scanData.blogIdeas.map((item) =>
          item.id === idea.id ? { ...item, status: "pending" } : item
        ),
      });
    } finally {
      setGeneratingIds((prev) => {
        const next = new Set(prev);
        next.delete(idea.id);
        return next;
      });
    }
  };

  const handleReject = (idea: BlogIdea) => {
    if (!scanData) return;

    setScanData({
      ...scanData,
      blogIdeas: scanData.blogIdeas.map((item) =>
        item.id === idea.id ? { ...item, status: "rejected" } : item
      ),
    });

    toast.info("Article idea rejected");
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500/10 text-green-600">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-500/10 text-red-600">Rejected</Badge>;
      case "generating":
        return <Badge className="bg-yellow-500/10 text-yellow-600">Generating...</Badge>;
      case "completed":
        return <Badge className="bg-blue-500/10 text-blue-600">Completed</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <div className="p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">
            Content Research
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Scan websites and generate SEO-optimized content
          </p>
        </div>

        {/* URL Scanner */}
        <Card className="p-4 mb-6 bg-card">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="url"
                placeholder="Enter website URL to scan..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleScan()}
                className="pl-10 h-10"
              />
            </div>
            <Button
              onClick={handleScan}
              disabled={isScanning}
              variant="hero"
              className="h-10"
            >
              {isScanning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Scanning...
                </>
              ) : (
                "Scan Website"
              )}
            </Button>
          </div>
        </Card>

        {/* Stats Overview */}
        {scanData && (
          <div className="grid grid-cols-4 gap-4 mb-6">
            <Card className="p-4 bg-card">
              <div className="text-xs text-muted-foreground mb-1">Total Ideas</div>
              <div className="text-2xl font-bold">{scanData.blogIdeas.length}</div>
            </Card>

            <Card className="p-4 bg-card">
              <div className="text-xs text-muted-foreground mb-1">Completed</div>
              <div className="text-2xl font-bold">
                {scanData.blogIdeas.filter((i) => i.status === "completed").length}
              </div>
            </Card>

            <Card className="p-4 bg-card">
              <div className="text-xs text-muted-foreground mb-1">Generating</div>
              <div className="text-2xl font-bold">
                {scanData.blogIdeas.filter((i) => i.status === "generating").length}
              </div>
            </Card>

            <Card className="p-4 bg-card">
              <div className="text-xs text-muted-foreground mb-1">Pending</div>
              <div className="text-2xl font-bold">
                {scanData.blogIdeas.filter((i) => i.status === "pending").length}
              </div>
            </Card>
          </div>
        )}

        {/* Articles Table */}
        {scanData && (
          <Card className="bg-card">
            <div className="border-b px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">
                    Blog Article Ideas
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {scanData.url.replace(/^https?:\/\//, '')}
                  </p>
                </div>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow className="border-b hover:bg-transparent">
                  <TableHead className="w-12"></TableHead>
                  <TableHead className="font-medium">Article Title</TableHead>
                  <TableHead className="font-medium w-48">Keyword</TableHead>
                  <TableHead className="font-medium w-32 text-center">Intent</TableHead>
                  <TableHead className="font-medium w-32 text-center">Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scanData.blogIdeas.map((idea) => (
                  <TableRow 
                    key={idea.id}
                    className="border-b last:border-0"
                  >
                    <TableCell className="py-3">
                      <div className="w-4 h-4 rounded-full border-2 border-border"></div>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="max-w-xl">
                        <p className="font-medium text-sm text-foreground">
                          {idea.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                          {idea.reason}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className="font-normal text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        >
                          T
                        </Badge>
                        <span className="text-sm">{idea.keyword}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 text-center">
                      <span className="text-sm capitalize">
                        {idea.intent}
                      </span>
                    </TableCell>
                    <TableCell className="py-3 text-center">
                      {idea.status === "pending" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleApprove(idea)}
                          disabled={generatingIds.has(idea.id)}
                          className="h-7 text-xs"
                        >
                          <Check className="w-3 h-3 mr-1" />
                          Approve
                        </Button>
                      )}
                      {idea.status === "generating" && (
                        <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Writing...</span>
                        </div>
                      )}
                      {idea.status === "completed" && (
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                          ✓ Ready
                        </Badge>
                      )}
                      {idea.status === "rejected" && (
                        <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">
                          Rejected
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="py-3">
                      {idea.status === "pending" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleReject(idea)}
                          className="h-7 w-7 p-0"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}

        {/* Empty State */}
        {!scanData && (
          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                No Data Yet
              </h3>
              <p className="text-muted-foreground">
                Enter a website URL above to scan for SEO opportunities and
                generate article ideas.
              </p>
            </div>
          </Card>
        )}
    </div>
  );
}

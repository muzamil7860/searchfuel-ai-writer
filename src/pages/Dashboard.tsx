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

      toast.success("Article generated successfully!");
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
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />

      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            SEO Dashboard
          </h1>
          <p className="text-muted-foreground">
            Scan websites and generate SEO-optimized content
          </p>
        </div>

        {/* URL Scanner */}
        <Card className="p-6 mb-8">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="url"
                placeholder="Enter website URL to scan..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleScan()}
                className="pl-10"
              />
            </div>
            <Button
              onClick={handleScan}
              disabled={isScanning}
              variant="hero"
              size="lg"
            >
              {isScanning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4" />
                  Scan Website
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Stats Overview */}
        {scanData && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Ideas</p>
                    <p className="text-2xl font-bold">
                      {scanData.blogIdeas.length}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <Check className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold">
                      {
                        scanData.blogIdeas.filter(
                          (i) => i.status === "completed"
                        ).length
                      }
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Generating</p>
                    <p className="text-2xl font-bold">
                      {
                        scanData.blogIdeas.filter(
                          (i) => i.status === "generating"
                        ).length
                      }
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold">
                      {
                        scanData.blogIdeas.filter((i) => i.status === "pending")
                          .length
                      }
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Articles Table */}
            <Card className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-foreground mb-2">
                  Blog Article Ideas
                </h2>
                <p className="text-sm text-muted-foreground">
                  Scanned from: {new URL(scanData.url).hostname}
                </p>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Keyword</TableHead>
                    <TableHead>Intent</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scanData.blogIdeas.map((idea) => (
                    <TableRow key={idea.id}>
                      <TableCell className="font-medium max-w-md">
                        <div>
                          <p className="font-semibold">{idea.title}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {idea.reason}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">
                          {idea.keyword}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            idea.intent === "informational"
                              ? "bg-blue-500/10 text-blue-600"
                              : idea.intent === "commercial"
                              ? "bg-green-500/10 text-green-600"
                              : "bg-accent/10 text-accent"
                          }
                        >
                          {idea.intent}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(idea.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          {idea.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                variant="hero"
                                onClick={() => handleApprove(idea)}
                                disabled={generatingIds.has(idea.id)}
                              >
                                <Check className="w-4 h-4" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReject(idea)}
                              >
                                <X className="w-4 h-4" />
                                Reject
                              </Button>
                            </>
                          )}
                          {idea.status === "generating" && (
                            <Button size="sm" variant="outline" disabled>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Generating...
                            </Button>
                          )}
                          {idea.status === "completed" && (
                            <Badge className="bg-green-500/10 text-green-600">
                              ✓ Ready
                            </Badge>
                          )}
                          {idea.status === "rejected" && (
                            <Badge className="bg-red-500/10 text-red-600">
                              Rejected
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </>
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
      </main>
    </div>
  );
}

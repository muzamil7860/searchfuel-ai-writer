import { useState, useEffect } from "react";
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
  ExternalLink,
  Settings,
  ArrowLeft,
  Eye,
  Clock,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { BlogOnboarding } from "@/components/onboarding/BlogOnboarding";
import { PublishDialog } from "@/components/PublishDialog";
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

interface Blog {
  id: string;
  subdomain: string;
  custom_domain: string | null;
  title: string;
  description: string | null;
  is_published: boolean;
  company_name: string | null;
  website_homepage: string | null;
}

interface AnalyticsData {
  total_views: number;
  total_visitors: number;
  avg_time: number;
}

export default function Dashboard() {
  const [url, setUrl] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanData, setScanData] = useState<ScanData | null>(null);
  const [generatingIds, setGeneratingIds] = useState<Set<string>>(new Set());
  
  // Blog management state
  const [blog, setBlog] = useState<Blog | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [blogForm, setBlogForm] = useState({
    subdomain: "",
    title: "",
    description: "",
    customDomain: "",
  });

  useEffect(() => {
    fetchUserBlog();
  }, []);

  const fetchUserBlog = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("blogs")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      setBlog(data);
      fetchAnalytics(data.id);
    }
  };

  const fetchAnalytics = async (blogId: string) => {
    const { data, error } = await supabase
      .from("blog_analytics")
      .select("page_views, unique_visitors, avg_time_on_page")
      .eq("blog_id", blogId);

    if (error) {
      console.error("Error fetching analytics:", error);
      return;
    }

    if (data && data.length > 0) {
      const totalViews = data.reduce((sum, row) => sum + (row.page_views || 0), 0);
      const totalVisitors = data.reduce((sum, row) => sum + (row.unique_visitors || 0), 0);
      const avgTime = data.reduce((sum, row) => sum + (row.avg_time_on_page || 0), 0) / data.length;

      setAnalytics({
        total_views: totalViews,
        total_visitors: totalVisitors,
        avg_time: Math.round(avgTime),
      });
    } else {
      setAnalytics({
        total_views: 0,
        total_visitors: 0,
        avg_time: 0,
      });
    }
  };

  const handleCreateBlog = async () => {
    if (!blogForm.subdomain || !blogForm.title) {
      toast.error("Please fill in subdomain and title");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("blogs")
      .insert({
        user_id: user.id,
        subdomain: blogForm.subdomain.toLowerCase(),
        title: blogForm.title,
        description: blogForm.description || null,
        custom_domain: blogForm.customDomain || null,
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to create blog: " + error.message);
      return;
    }

    setBlog(data);
    setShowSettings(false);
    toast.success("Blog created successfully!");
  };

  const handleUpdateBlog = async () => {
    if (!blog) return;

    const { error } = await supabase
      .from("blogs")
      .update({
        title: blogForm.title,
        description: blogForm.description || null,
        custom_domain: blogForm.customDomain || null,
      })
      .eq("id", blog.id);

    if (error) {
      toast.error("Failed to update blog: " + error.message);
      return;
    }

    await fetchUserBlog();
    setShowSettings(false);
    toast.success("Blog updated successfully!");
  };

  const handleTogglePublish = () => {
    if (!blog) return;
    
    if (blog.is_published) {
      // Unpublish directly
      handleUnpublish();
    } else {
      // Show customize link dialog
      setShowPublishDialog(true);
    }
  };

  const handleUnpublish = async () => {
    if (!blog) return;

    const { error } = await supabase
      .from("blogs")
      .update({ is_published: false })
      .eq("id", blog.id);

    if (error) {
      toast.error("Failed to unpublish blog");
      return;
    }

    await fetchUserBlog();
    toast.success("Blog unpublished!");
  };

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

  if (showSettings && blog) {
    return (
      <div className="p-8">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => setShowSettings(false)}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-foreground mb-6">Blog Settings</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="subdomain">Subdomain *</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    id="subdomain"
                    value={blogForm.subdomain}
                    disabled
                  />
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    .searchfuel.app
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Subdomain cannot be changed
                </p>
              </div>

              <div>
                <Label htmlFor="title">Blog Title *</Label>
                <Input
                  id="title"
                  placeholder="My Awesome Blog"
                  value={blogForm.title}
                  onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="A brief description of your blog"
                  value={blogForm.description}
                  onChange={(e) => setBlogForm({ ...blogForm, description: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="customDomain">Custom Domain</Label>
                <Input
                  id="customDomain"
                  placeholder="blog.yourdomain.com"
                  value={blogForm.customDomain}
                  onChange={(e) => setBlogForm({ ...blogForm, customDomain: e.target.value })}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Optional: Connect your own domain
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline"
                  onClick={() => setShowSettings(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpdateBlog}
                  className="flex-1"
                >
                  Update Blog
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (showOnboarding) {
    return (
      <div className="p-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-sm text-muted-foreground mb-2">SEARCHFUEL SETUP</p>
            <h1 className="text-4xl font-bold text-foreground">Create your AI SEO engine</h1>
          </div>
          <BlogOnboarding
            open={true}
            onComplete={() => {
              setShowOnboarding(false);
              fetchUserBlog();
            }}
            onCancel={() => setShowOnboarding(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor your content performance
        </p>
      </div>

      {/* Blog Management Card */}
      <Card className="p-6 mb-6 bg-card">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Globe className="w-5 h-5 text-accent" />
                <h2 className="text-lg font-semibold text-foreground">Your Blog</h2>
              </div>
              
              {blog ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{blog.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <a 
                        href={`https://${blog.subdomain}.searchfuel.app`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-accent hover:underline flex items-center gap-1"
                      >
                        {blog.subdomain}.searchfuel.app
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <Badge variant={blog.is_published ? "default" : "outline"}>
                        {blog.is_published ? "Published" : "Draft"}
                      </Badge>
                    </div>
                  </div>
                  
                  {blog.custom_domain && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground mb-1">Custom Domain</p>
                      <a 
                        href={`https://${blog.custom_domain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-accent hover:underline flex items-center gap-1"
                      >
                        {blog.custom_domain}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Create your blog to start publishing SEO-optimized content
                </p>
              )}
            </div>

            <div className="flex gap-2">
              {blog && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleTogglePublish}
                >
                  {blog.is_published ? "Unpublish" : "Publish"}
                </Button>
              )}
              
              {blog ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setBlogForm({
                      subdomain: blog.subdomain,
                      title: blog.title,
                      description: blog.description || "",
                      customDomain: blog.custom_domain || "",
                    });
                    setShowSettings(true);
                  }}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => setShowOnboarding(true)}
                >
                  Create Blog
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Analytics / No Site Connected */}
        {!blog ? (
          <Card className="p-12 text-center bg-card">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                No Site Connected
              </h3>
              <p className="text-muted-foreground mb-6">
                Connect your website to start generating SEO-optimized content and tracking performance.
              </p>
              <Button onClick={() => setShowOnboarding(true)}>
                Connect Site
              </Button>
            </div>
          </Card>
        ) : analytics ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="p-6 bg-card">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <Eye className="w-5 h-5 text-accent" />
                </div>
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">
                {analytics.total_views.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                Total Page Views
              </div>
            </Card>

            <Card className="p-6 bg-card">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-accent" />
                </div>
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">
                {analytics.total_visitors.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                Unique Visitors
              </div>
            </Card>

            <Card className="p-6 bg-card">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-accent" />
                </div>
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">
                {analytics.avg_time}s
              </div>
              <div className="text-sm text-muted-foreground">
                Avg. Time on Page
              </div>
            </Card>
          </div>
        ) : null}

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

        {showPublishDialog && blog && (
          <PublishDialog
            blog={blog}
            onComplete={() => {
              setShowPublishDialog(false);
              fetchUserBlog();
            }}
            onCancel={() => setShowPublishDialog(false)}
          />
        )}
      </div>
    );
  }

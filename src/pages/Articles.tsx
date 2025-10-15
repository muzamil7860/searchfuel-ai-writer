import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, FileText, Eye, Clock, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const ARTICLE_TYPE_LABELS: Record<string, { name: string; emoji: string }> = {
  how_to: { name: "How-To Guides", emoji: "📚" },
  listicle: { name: "Listicles", emoji: "📝" },
  qa: { name: "Q&A Articles", emoji: "❓" },
  news: { name: "News & Updates", emoji: "📰" },
  roundup: { name: "Product Roundups", emoji: "🔍" },
  versus: { name: "Comparison Articles", emoji: "⚖️" },
  checklist: { name: "Checklists", emoji: "✅" },
  advertorial: { name: "Advertorials", emoji: "📢" },
  interactive_tool: { name: "Interactive Tools", emoji: "🛠️" },
};

interface BlogPost {
  id: string;
  blog_id: string;
  title: string;
  slug: string;
  status: string;
  publishing_status: string;
  external_post_id: string | null;
  article_type: string;
  created_at: string;
  published_at: string;
}

export default function Articles() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [blogId, setBlogId] = useState<string | null>(null);
  const [isGeneratingArticle, setIsGeneratingArticle] = useState(false);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get user's blog
      const { data: blogData } = await supabase
        .from("blogs")
        .select("id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!blogData) {
        setArticles([]);
        setIsLoading(false);
        return;
      }

      setBlogId(blogData.id);

      // Fetch all blog posts for this blog
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("blog_id", blogData.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setArticles((data || []) as unknown as BlogPost[]);
    } catch (error) {
      console.error("Error fetching articles:", error);
      toast.error("Failed to load articles");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from("blog_posts")
        .delete()
        .eq("id", deleteId);

      if (error) throw error;

      setArticles(articles.filter((a) => a.id !== deleteId));
      toast.success("Article deleted successfully");
    } catch (error: any) {
      console.error("Error deleting article:", error);
      toast.error("Failed to delete article: " + error.message);
    } finally {
      setDeleteId(null);
    }
  };

  const handlePublishNow = async (postId: string) => {
    if (!blogId) return;

    try {
      toast.info("Publishing post...");
      
      const { error } = await supabase.functions.invoke("publish-to-cms", {
        body: {
          blogId,
          postId,
        },
      });

      if (error) throw error;

      toast.success("Post published successfully!");
      await fetchArticles();
    } catch (error: any) {
      console.error("Error publishing post:", error);
      toast.error("Failed to publish post: " + error.message);
    }
  };

  const handleGenerateArticle = async () => {
    if (!blogId) {
      toast.error("No blog found. Please connect your CMS first.");
      return;
    }
    
    setIsGeneratingArticle(true);
    toast.info("Generating article... This may take a minute.");
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-blog-post', {
        body: { blogId }
      });
      
      if (error) throw error;
      
      toast.success("Article generated successfully!");
      await fetchArticles();
    } catch (error: any) {
      console.error('Article generation error:', error);
      toast.error(error.message || "Failed to generate article");
    } finally {
      setIsGeneratingArticle(false);
    }
  };

  const getPublishingStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge variant="default" className="bg-green-600">Published</Badge>;
      case "pending":
        return <Badge variant="secondary" className="bg-blue-600 text-white">Pending</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="container max-w-6xl mx-auto py-12 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Articles</h1>
            <p className="text-muted-foreground">Manage your generated blog posts</p>
          </div>
        </div>

        <Card className="p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-accent" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              No Posts Generated Yet
            </h3>
            <p className="text-muted-foreground mb-6">
              Your AI engine is ready! Posts will be generated automatically based on your settings.
            </p>
            <Button onClick={() => navigate("/")}>
              Go to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Separate posts by status
  const pendingPosts = articles.filter(a => a.publishing_status === 'pending');
  const publishedPosts = articles.filter(a => a.publishing_status === 'published');
  const failedPosts = articles.filter(a => a.publishing_status === 'failed');

  return (
    <div className="container max-w-6xl mx-auto py-12 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Articles</h1>
          <p className="text-muted-foreground">
            {pendingPosts.length} pending · {publishedPosts.length} published · {failedPosts.length} failed
          </p>
        </div>
        <Button 
          onClick={handleGenerateArticle}
          disabled={isGeneratingArticle || !blogId}
        >
          {isGeneratingArticle && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          <FileText className="w-4 h-4 mr-2" />
          Generate New Article
        </Button>
      </div>

      {/* Pending Posts */}
      {pendingPosts.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Clock className="w-6 h-6 text-blue-600" />
            Pending Posts
            <Badge variant="secondary" className="bg-blue-600 text-white">
              {pendingPosts.length}
            </Badge>
          </h2>
          <div className="grid gap-4">
            {pendingPosts.map((post, index) => {
              const estimatedDate = new Date();
              estimatedDate.setDate(estimatedDate.getDate() + index);
              
              return (
                <Card key={post.id} className="p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getPublishingStatusBadge(post.publishing_status)}
                        {post.article_type && (
                          <Badge variant="outline">
                            {ARTICLE_TYPE_LABELS[post.article_type]?.emoji} {ARTICLE_TYPE_LABELS[post.article_type]?.name || post.article_type}
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        {post.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>Scheduled for {format(estimatedDate, 'MMM d, yyyy')}</span>
                        </div>
                        <span>Created {format(new Date(post.created_at), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handlePublishNow(post.id)}
                      >
                        Publish Now
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/blog/${post.slug}`)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Published Posts */}
      {publishedPosts.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <FileText className="w-6 h-6 text-green-600" />
            Published Posts
            <Badge variant="default" className="bg-green-600">
              {publishedPosts.length}
            </Badge>
          </h2>
          <div className="grid gap-4">
            {publishedPosts.map((post) => (
              <Card key={post.id} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getPublishingStatusBadge(post.publishing_status)}
                      {post.article_type && (
                        <Badge variant="outline">
                          {ARTICLE_TYPE_LABELS[post.article_type]?.emoji} {ARTICLE_TYPE_LABELS[post.article_type]?.name || post.article_type}
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {post.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Published {format(new Date(post.published_at || post.created_at), 'MMM d, yyyy')}</span>
                      {post.external_post_id && (
                        <Badge variant="outline" className="text-xs">
                          External ID: {post.external_post_id}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/blog/${post.slug}`)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Failed Posts */}
      {failedPosts.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-red-600" />
            Failed Posts
            <Badge variant="destructive">
              {failedPosts.length}
            </Badge>
          </h2>
          <div className="grid gap-4">
            {failedPosts.map((post) => (
              <Card key={post.id} className="p-6 border-red-200 dark:border-red-900 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getPublishingStatusBadge(post.publishing_status)}
                      {post.article_type && (
                        <Badge variant="outline">
                          {ARTICLE_TYPE_LABELS[post.article_type]?.emoji} {ARTICLE_TYPE_LABELS[post.article_type]?.name || post.article_type}
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {post.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Created {format(new Date(post.created_at), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handlePublishNow(post.id)}
                    >
                      Retry Publish
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/blog/${post.slug}`)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Article</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this article? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

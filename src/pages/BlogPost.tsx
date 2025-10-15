import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  published_at: string;
  featured_image: string | null;
  article_type: string | null;
}

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;

      try {
        const { data, error } = await supabase
          .from("blog_posts")
          .select("*")
          .eq("slug", slug)
          .eq("status", "published")
          .single();

        if (error) {
          console.error("Error fetching post:", error);
          return;
        }

        setPost(data);
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold text-foreground">Post Not Found</h1>
        <Link to="/blog">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <Link to="/blog" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <span className="font-semibold">SearchFuel Blog</span>
          </Link>
        </div>
      </header>

      {/* Blog Post Content */}
      <main className="container mx-auto px-4 py-12">
        <article className="max-w-4xl mx-auto">
          {post.featured_image && (
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full h-[400px] object-cover rounded-lg mb-8"
            />
          )}

          <h1 className="text-4xl font-bold text-foreground mb-4">
            {post.title}
          </h1>

          <p className="text-muted-foreground mb-8">
            Published on {format(new Date(post.published_at), "MMMM d, yyyy")}
          </p>

          <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-foreground/90 prose-strong:text-foreground prose-ul:text-foreground/90 prose-ol:text-foreground/90 prose-li:text-foreground/90 prose-a:text-primary hover:prose-a:text-primary/80">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.content}
            </ReactMarkdown>
          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <Link to="/blog">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to all posts
              </Button>
            </Link>
          </div>
        </article>
      </main>
    </div>
  );
};

export default BlogPost;

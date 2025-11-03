import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

export function useArticles() {
  const [articles, setArticles] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [blogId, setBlogId] = useState<string | null>(null);

  const fetchArticles = useCallback(async () => {
    try {
      // Get user data first since we need it for authorization
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("Not authenticated");

      // Get blog and its posts in a single query
      const { data: blog, error: blogError } = await supabase
        .from("blogs")
        .select(`
          id,
          blog_posts!inner (
            id,
            blog_id,
            title,
            slug,
            status,
            publishing_status,
            external_post_id,
            article_type,
            created_at,
            published_at
          )
        `)
        .eq("user_id", user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (blogError) throw blogError;

      // Handle no blog case
      if (!blog) {
        setArticles([]);
        setBlogId(null);
        return;
      }

      // Update state with sorted articles
      setBlogId(blog.id);
      const sortedPosts = (blog.blog_posts || []).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setArticles(sortedPosts);

    } catch (error: any) {
      console.error("Error loading articles:", error);
      const message = error.message || "Failed to load articles";
      if (message.includes("JWT")) {
        toast.error("Session expired. Please log in again.");
      } else {
        toast.error(message);
      }
    } finally {
      setIsLoading(false);
    }
  }, []); // No dependencies needed since we use state setters

  return {
    articles,
    isLoading,
    blogId,
    fetchArticles,
    setArticles,
    setBlogId
  };
}
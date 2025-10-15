import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { blog_post_id } = await req.json();

    if (!blog_post_id) {
      throw new Error("blog_post_id is required");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch the blog post
    const { data: post, error: postError } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("id", blog_post_id)
      .single();

    if (postError) throw postError;
    if (!post) throw new Error("Post not found");

    // Fetch the blog with CMS credentials
    const { data: blog, error: blogError } = await supabase
      .from("blogs")
      .select("*")
      .eq("id", post.blog_id)
      .single();

    if (blogError) throw blogError;
    if (!blog) throw new Error("Blog not found");

    if (!blog.cms_platform || !blog.cms_credentials) {
      throw new Error("CMS platform or credentials not configured");
    }

    console.log(`Publishing to ${blog.cms_platform}: ${post.title}`);

    let externalPostId: string | null = null;
    let publishSuccess = false;

    // Route to appropriate CMS publisher
    switch (blog.cms_platform) {
      case "wordpress":
        externalPostId = await publishToWordPress(blog, post);
        publishSuccess = true;
        break;

      case "ghost":
        externalPostId = await publishToGhost(blog, post);
        publishSuccess = true;
        break;

      case "webflow":
        externalPostId = await publishToWebflow(blog, post);
        publishSuccess = true;
        break;

      case "shopify":
        externalPostId = await publishToShopify(blog, post);
        publishSuccess = true;
        break;

      case "hubspot":
        externalPostId = await publishToHubSpot(blog, post);
        publishSuccess = true;
        break;

      case "rest_api":
        externalPostId = await publishToRestAPI(blog, post);
        publishSuccess = true;
        break;

      default:
        throw new Error(`Unsupported CMS platform: ${blog.cms_platform}`);
    }

    // Update blog post with external ID and status
    const { error: updateError } = await supabase
      .from("blog_posts")
      .update({
        external_post_id: externalPostId,
        publishing_status: publishSuccess ? "published" : "failed",
        last_published_at: new Date().toISOString(),
      })
      .eq("id", blog_post_id);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({
        success: true,
        external_post_id: externalPostId,
        platform: blog.cms_platform,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error publishing to CMS:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function publishToWordPress(blog: any, post: any): Promise<string> {
  const credentials = blog.cms_credentials;
  const apiUrl = `${blog.cms_site_url}/wp-json/wp/v2/posts`;

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${btoa(`${credentials.username}:${credentials.password}`)}`,
    },
    body: JSON.stringify({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt || "",
      status: "publish",
      featured_media: post.featured_image ? await uploadWordPressMedia(blog, post.featured_image) : undefined,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`WordPress API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log(`Published to WordPress: ${data.link}`);
  return data.id.toString();
}

async function uploadWordPressMedia(blog: any, imageUrl: string): Promise<number | undefined> {
  // For now, we'll skip media upload and use the URL directly in content
  // WordPress can handle external images in content
  return undefined;
}

async function publishToGhost(blog: any, post: any): Promise<string> {
  const credentials = blog.cms_credentials;
  const apiUrl = `${blog.cms_site_url}/ghost/api/v3/admin/posts/`;

  // Ghost requires JWT authentication
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Ghost ${credentials.admin_api_key}`,
    },
    body: JSON.stringify({
      posts: [
        {
          title: post.title,
          html: post.content,
          custom_excerpt: post.excerpt || "",
          status: "published",
          feature_image: post.featured_image || undefined,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ghost API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log(`Published to Ghost: ${data.posts[0].url}`);
  return data.posts[0].id;
}

async function publishToWebflow(blog: any, post: any): Promise<string> {
  const credentials = blog.cms_credentials;
  const apiUrl = `https://api.webflow.com/collections/${credentials.collection_id}/items`;

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${credentials.api_token}`,
      "accept-version": "1.0.0",
    },
    body: JSON.stringify({
      fields: {
        name: post.title,
        slug: post.slug,
        "post-body": post.content,
        "post-summary": post.excerpt || "",
        _archived: false,
        _draft: false,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Webflow API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log(`Published to Webflow: ${data._id}`);
  return data._id;
}

async function publishToShopify(blog: any, post: any): Promise<string> {
  const credentials = blog.cms_credentials;
  const apiUrl = `${blog.cms_site_url}/admin/api/2024-01/blogs/${credentials.blog_id}/articles.json`;

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": credentials.access_token,
    },
    body: JSON.stringify({
      article: {
        title: post.title,
        body_html: post.content,
        summary_html: post.excerpt || "",
        published: true,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Shopify API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log(`Published to Shopify: ${data.article.id}`);
  return data.article.id.toString();
}

async function publishToHubSpot(blog: any, post: any): Promise<string> {
  const credentials = blog.cms_credentials;
  const apiUrl = `https://api.hubapi.com/content/api/v2/blog-posts`;

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${credentials.access_token}`,
    },
    body: JSON.stringify({
      name: post.title,
      post_body: post.content,
      post_summary: post.excerpt || "",
      content_group_id: credentials.blog_id,
      state: "PUBLISHED",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HubSpot API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log(`Published to HubSpot: ${data.id}`);
  return data.id;
}

async function publishToRestAPI(blog: any, post: any): Promise<string> {
  const credentials = blog.cms_credentials;
  
  const response = await fetch(credentials.endpoint_url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(credentials.auth_header && { [credentials.auth_header_name || "Authorization"]: credentials.auth_header }),
    },
    body: JSON.stringify({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt || "",
      slug: post.slug,
      featured_image: post.featured_image || "",
      status: "published",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`REST API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log(`Published to REST API: ${credentials.endpoint_url}`);
  return data.id || data._id || "published";
}

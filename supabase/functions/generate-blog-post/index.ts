import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing required environment variables");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get blog ID from request or find blogs that need posts
    const { blogId } = await req.json().catch(() => ({}));

    let blogsToProcess = [];

    if (blogId) {
      const { data } = await supabase
        .from("blogs")
        .select("*")
        .eq("id", blogId)
        .eq("onboarding_completed", true)
        .single();
      
      if (data) blogsToProcess = [data];
    } else {
      // Find all blogs that need posts (auto-generation enabled)
      const { data } = await supabase
        .from("blogs")
        .select("*")
        .eq("onboarding_completed", true)
        .eq("auto_post_enabled", true)
        .or(`last_post_generated_at.is.null,last_post_generated_at.lt.${new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()}`);
      
      blogsToProcess = data || [];
    }

    console.log(`Processing ${blogsToProcess.length} blogs`);

    const results = [];

    for (const blog of blogsToProcess) {
      try {
        // Prepare backlink context
        const targetPages = blog.target_pages || [];
        const backlinkKeywords = targetPages
          .flatMap((page: any) => page.keywords || [])
          .join(", ");
        
        const backlinkContext = targetPages.length > 0
          ? `\n\nNatural Linking Opportunities:
- Naturally mention these topics where relevant: ${backlinkKeywords}
- Write flowing content where references to these topics feel organic
- Include these mentions 2-3 times throughout the post if contextually appropriate`
          : "";

        // Generate blog post using Lovable AI
        const systemPrompt = `You are an expert SEO content writer. Create a comprehensive, engaging blog post for ${blog.company_name}.

Company Details:
- Industry: ${blog.industry}
- Description: ${blog.company_description}
- Target Audience: ${blog.target_audience}
- Website: ${blog.website_homepage}
${blog.competitors?.length > 0 ? `- Competitors: ${blog.competitors.map((c: any) => c.name).join(", ")}` : ""}

Requirements:
- Write a 1500-2000 word blog post
- Include an engaging title optimized for SEO
- Write a compelling excerpt (150-200 characters)
- Use natural keyword integration
- Include actionable insights and examples
- Make it valuable for the target audience
- Use markdown formatting for structure${backlinkContext}

Focus on topics related to their industry that would help their target audience.`;

        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: "Generate a blog post with title, excerpt, and content. Format as JSON with keys: title, excerpt, content" },
            ],
          }),
        });

        if (!aiResponse.ok) {
          throw new Error(`AI API error: ${aiResponse.status}`);
        }

        const aiData = await aiResponse.json();
        const generatedText = aiData.choices[0].message.content;

        // Try to parse JSON from the response
        let postData;
        try {
          postData = JSON.parse(generatedText);
        } catch {
          // If not JSON, extract manually
          const lines = generatedText.split("\n");
          postData = {
            title: lines.find((l: string) => l.includes("title"))?.split(":")[1]?.trim() || "New Blog Post",
            excerpt: lines.find((l: string) => l.includes("excerpt"))?.split(":")[1]?.trim() || "",
            content: generatedText,
          };
        }

        // Create slug from title
        const slug = postData.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");

        // Insert backlinks into content
        let processedContent = postData.content;
        let linksInserted = 0;
        const maxLinks = blog.max_links_per_post || 5;
        const insertedLinks: any[] = [];

        if (targetPages.length > 0 && blog.backlink_strategy !== 'disabled') {
          // Sort pages by priority
          const priorityOrder: any = { high: 3, medium: 2, low: 1 };
          const sortedPages = [...targetPages].sort(
            (a: any, b: any) => (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0)
          );

          for (const page of sortedPages) {
            if (linksInserted >= maxLinks) break;

            for (const keyword of page.keywords || []) {
              if (linksInserted >= maxLinks) break;

              // Find first occurrence of keyword that's not already linked
              const regex = new RegExp(`\\b${keyword}\\b(?![^\\[]*\\])`, 'i');
              const match = processedContent.match(regex);

              if (match) {
                const matchText = match[0];
                const link = `[${matchText}](${page.url})`;
                processedContent = processedContent.replace(regex, link);
                linksInserted++;
                insertedLinks.push({
                  keyword: matchText,
                  url: page.url,
                  priority: page.priority,
                });
                break; // Move to next page after inserting one link
              }
            }
          }
        }

        console.log(`Inserted ${linksInserted} backlinks into post: ${insertedLinks.map(l => l.keyword).join(", ")}`);

        // Insert blog post
        const { data: post, error: insertError } = await supabase
          .from("blog_posts")
          .insert({
            blog_id: blog.id,
            title: postData.title,
            slug,
            excerpt: postData.excerpt,
            content: processedContent,
            status: "published",
            published_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (insertError) throw insertError;

        // Update blog's last_post_generated_at
        await supabase
          .from("blogs")
          .update({ last_post_generated_at: new Date().toISOString() })
          .eq("id", blog.id);

        // Insert analytics entry for today
        const today = new Date().toISOString().split("T")[0];
        await supabase
          .from("blog_analytics")
          .upsert({
            blog_id: blog.id,
            date: today,
            page_views: 0,
            unique_visitors: 0,
          }, { onConflict: "blog_id,date" });

        results.push({
          blogId: blog.id,
          postId: post.id,
          title: postData.title,
          backlinksInserted: linksInserted,
          links: insertedLinks,
          success: true,
        });

        console.log(`Generated post for blog ${blog.id}: ${postData.title}`);
      } catch (error) {
        console.error(`Error generating post for blog ${blog.id}:`, error);
        results.push({
          blogId: blog.id,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: blogsToProcess.length,
        results,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in generate-blog-post function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
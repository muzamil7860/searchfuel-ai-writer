import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Extract text content from HTML
function extractTextFromHTML(html: string): string {
  // Remove script and style tags
  let text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  
  // Extract title
  const titleMatch = text.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1] : '';
  
  // Extract meta description
  const descMatch = text.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
  const description = descMatch ? descMatch[1] : '';
  
  // Extract headings
  const h1Matches = text.match(/<h1[^>]*>([^<]+)<\/h1>/gi) || [];
  const h2Matches = text.match(/<h2[^>]*>([^<]+)<\/h2>/gi) || [];
  const headings = [...h1Matches, ...h2Matches].map(h => h.replace(/<[^>]+>/g, ''));
  
  // Extract paragraph content
  const pMatches = text.match(/<p[^>]*>([^<]+)<\/p>/gi) || [];
  const paragraphs = pMatches.slice(0, 10).map(p => p.replace(/<[^>]+>/g, ''));
  
  return JSON.stringify({
    title,
    description,
    headings: headings.slice(0, 10),
    content: paragraphs.slice(0, 5).join(' ').slice(0, 1000)
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Scanning website:', url);

    // Fetch the actual website content
    let websiteContent = '';
    let websiteData: any = {};
    
    try {
      const websiteResponse = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SearchFuel/1.0; +https://searchfuel.app)'
        }
      });
      
      if (websiteResponse.ok) {
        const html = await websiteResponse.text();
        websiteContent = extractTextFromHTML(html);
        websiteData = JSON.parse(websiteContent);
        console.log('Successfully fetched website content:', websiteData.title);
      }
    } catch (fetchError) {
      console.error('Error fetching website:', fetchError);
      // Continue without website content if fetch fails
    }

    const systemPrompt = `You are an expert SEO analyst. Analyze the given website information and identify 5-10 high-potential blog post ideas that could:
1. Help the site rank higher in search engines
2. Target keywords with high buyer intent
3. Drive conversions and traffic

Website Information:
${websiteContent || 'URL: ' + url}

For each blog idea, provide:
- title: A compelling blog post title that targets a specific keyword
- keyword: The primary target keyword (2-4 words)
- intent: Either "informational", "commercial", or "transactional"
- reason: A short explanation (1-2 sentences) of why this topic is valuable for SEO and conversions

Return ONLY a valid JSON array of blog ideas. No markdown, no explanation, just the JSON array.`;

    const userPrompt = websiteData.title 
      ? `Based on the website "${websiteData.title}" with description "${websiteData.description}", suggest 5-10 SEO-optimized blog topics that complement the existing content: ${websiteData.headings.join(', ')}`
      : `Analyze this website and suggest 5-10 SEO-optimized blog topics: ${url}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('Failed to analyze website');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse the JSON response
    let blogIdeas;
    try {
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      blogIdeas = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Invalid response format from AI');
    }

    // Add unique IDs to each idea
    const ideasWithIds = blogIdeas.map((idea: any, index: number) => ({
      ...idea,
      id: `idea-${Date.now()}-${index}`
    }));

    console.log('Successfully generated blog ideas:', ideasWithIds.length);

    return new Response(
      JSON.stringify({ blogIdeas: ideasWithIds }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in scan-website function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

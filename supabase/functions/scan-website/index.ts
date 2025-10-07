import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    const systemPrompt = `You are an expert SEO analyst. Analyze the given website URL and identify 5-10 high-potential blog post ideas that could:
1. Help the site rank higher in search engines
2. Target keywords with high buyer intent
3. Drive conversions and traffic

For each blog idea, provide:
- title: A compelling blog post title
- keyword: The primary target keyword
- intent: Either "informational", "commercial", or "transactional"
- reason: A short explanation of why this topic is valuable for conversions

Return ONLY a valid JSON array of blog ideas. No markdown, no explanation, just the JSON array.`;

    const userPrompt = `Analyze this website and suggest 5-10 SEO-optimized blog topics: ${url}

Important: Consider the website's niche, existing content gaps, and keywords that indicate buying intent. Focus on topics that will drive actual business results.`;

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

import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { topic } = await req.json();
    console.log('Generating roadmap for:', topic);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `You are an expert learning path designer. Generate a comprehensive, well-structured learning roadmap as a hierarchical graph.

CRITICAL REQUIREMENTS:
1. Create a hierarchical structure with clear progression from fundamentals to advanced
2. Group related topics into clusters
3. Include micro-topics and sub-micro-topics for depth
4. Each node must be unique and specific
5. Create logical dependencies between topics

Return ONLY valid JSON (no markdown, no explanations) with this exact structure:
{
  "title": "Brief catchy title",
  "description": "One-sentence overview",
  "nodes": [
    {
      "id": "unique-id",
      "label": "Topic Name",
      "type": "core|advanced|bonus",
      "level": 1-5,
      "position": { "x": number, "y": number },
      "description": "What you'll learn"
    }
  ],
  "edges": [
    {
      "id": "edge-unique-id",
      "source": "source-node-id",
      "target": "target-node-id",
      "animated": true
    }
  ]
}

POSITIONING RULES:
- Use x: 0-1200, y: 0-800 range
- Level 1 (fundamentals): y: 0-150
- Level 2: y: 200-350
- Level 3: y: 400-550
- Level 4+: y: 600-800
- Spread nodes horizontally to avoid overlap
- Similar topics should be close together

Generate 15-25 nodes with clear learning progression.`;

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
          { role: 'user', content: `Create a comprehensive learning roadmap for: ${topic}` }
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits depleted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI Gateway responded with status ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content in AI response');
    }

    console.log('Raw AI response:', content);

    // Parse the JSON response
    let roadmapData;
    try {
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      roadmapData = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('Invalid roadmap format from AI');
    }

    // Validate the structure
    if (!roadmapData.nodes || !roadmapData.edges || !roadmapData.title) {
      console.error('Invalid roadmap structure:', roadmapData);
      throw new Error('Roadmap missing required fields');
    }

    console.log('Successfully generated roadmap with', roadmapData.nodes.length, 'nodes');

    return new Response(
      JSON.stringify(roadmapData),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in generate-roadmap function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to generate roadmap' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
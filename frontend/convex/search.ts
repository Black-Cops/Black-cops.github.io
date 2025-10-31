import { action } from "./_generated/server";
import { v } from "convex/values";

export const search = action({
  args: {
    query: v.string(),
  },
  handler: async (ctx, args) => {
    const { query } = args;
    
    // For now, we'll use a simple web search API
    // In a real implementation, you might use a service like SerpAPI, Google Custom Search, etc.
    // For this demo, we'll simulate search results using OpenRouter with a search persona
    
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    
    if (!OPENROUTER_API_KEY) {
      // Return mock results when API key is not configured
      return {
        results: [
          {
            title: "Search Demo Mode",
            url: "https://example.com",
            snippet: "This is a demo search result. In production, configure OPENROUTER_API_KEY to get real search results."
          },
          {
            title: "Query: " + query,
            url: "https://example.com",
            snippet: "You searched for: " + query + ". This demonstrates that the search functionality is working, but using mock data."
          }
        ]
      };
    }
    
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Search Assistant'
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-r1:free',
          messages: [
            {
              role: 'system',
              content: 'You are a search assistant. Provide search results in JSON format with the following structure: {"results": [{"title": "string", "url": "string", "snippet": "string"}]}. Be concise and provide relevant, factual information.'
            },
            {
              role: 'user',
              content: `Search for: ${query}`
            }
          ],
          stream: false
        })
      });
      
      if (!response.ok) {
        throw new Error(`Search API error: ${response.status}`);
      }
      
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content received from search API');
      }
      
      // Try to parse the response as JSON
      let searchResults;
      try {
        searchResults = JSON.parse(content);
      } catch (parseError) {
        // If parsing fails, create a simple result structure
        searchResults = {
          results: [
            {
              title: "Search Results",
              url: "#",
              snippet: content
            }
          ]
        };
      }
      
      return searchResults;
      
    } catch (error) {
      console.error('Search action error:', error);
      throw new Error(`Search failed: ${error.message}`);
    }
  },
});
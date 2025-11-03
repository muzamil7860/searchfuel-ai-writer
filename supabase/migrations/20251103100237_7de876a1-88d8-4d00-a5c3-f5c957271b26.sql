-- Add JSONB columns to blog_posts and articles tables for keyword extraction and topic recommendations
ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS extracted_keywords JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS recommended_topics JSONB DEFAULT '[]'::jsonb;

ALTER TABLE articles
  ADD COLUMN IF NOT EXISTS extracted_keywords JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS recommended_topics JSONB DEFAULT '[]'::jsonb;
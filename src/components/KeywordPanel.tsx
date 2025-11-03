import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface KeywordItem {
  keyword: string;
  score: number;
  source?: string;
}

interface TopicItem {
  topic: string;
  score: number;
  reason?: string;
}

export default function KeywordPanel({ id, kind = 'blog_post' }: { id: string; kind?: 'blog_post' | 'article' }) {
  const [loading, setLoading] = useState(true);
  const [keywords, setKeywords] = useState<KeywordItem[]>([]);
  const [topics, setTopics] = useState<TopicItem[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isReExtracting, setIsReExtracting] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const table = kind === 'article' ? 'articles' : 'blog_posts';
      // also fetch title/content so we can run a client-side fallback extractor if functions are unreachable
      const { data, error } = await supabase
        .from(table)
        .select('extracted_keywords, recommended_topics, title, content')
        .eq('id', id)
        .single();

      if (error) throw error;

  // Cast to any because DB type definitions may not include the new JSONB columns yet
  const row: any = data as any;
  setKeywords((row?.extracted_keywords || []) as KeywordItem[]);
  setTopics((row?.recommended_topics || []) as TopicItem[]);
    } catch (err) {
      // capture and show a clearer error message
      // eslint-disable-next-line no-console
      console.error('Error loading keywords:', err);
      // If the error indicates missing columns (Postgres 42703), try a safe fallback select '*' to still show the row
      const msg = (err && (err.message || err.error || String(err))) || '';
      const isMissingColumn = msg.includes('does not exist') || (err && (err.code === '42703' || err?.name === 'PostgresError'));
      if (isMissingColumn) {
        try {
          const table = kind === 'article' ? 'articles' : 'blog_posts';
          const { data: fallbackRow, error: fallbackErr } = await supabase.from(table).select('*').eq('id', id).single();
          if (!fallbackErr && fallbackRow) {
            const r: any = fallbackRow as any;
            setKeywords((r?.extracted_keywords || []) as KeywordItem[]);
            setTopics((r?.recommended_topics || []) as TopicItem[]);
            setErrorMsg(null);
            return;
          }
        } catch (inner) {
          // fall through to showing the original error
          // eslint-disable-next-line no-console
          console.warn('Fallback select failed:', inner);
        }
      }

      const message = msg || 'Failed to load extracted keywords';
      setErrorMsg(message);
      toast.error('Failed to load extracted keywords');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4"><Loader2 className="w-5 h-5 animate-spin" /></div>;

  return (
    <Card className="p-4 bg-card">
      <h4 className="text-sm font-semibold text-foreground mb-2">Extracted Keywords</h4>
      {errorMsg ? (
        <div className="mb-3">
          <p className="text-sm text-destructive mb-2">Failed to load extracted keywords</p>
          <p className="text-xs text-muted-foreground break-words mb-2">{errorMsg}</p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={fetchData} disabled={isReExtracting}>
              {isReExtracting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Retry
            </Button>
            <Button size="sm" onClick={async () => await handleReExtract()}>
              {isReExtracting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Re-extract
            </Button>
          </div>
        </div>
      ) : keywords.length === 0 ? (
        <div className="mb-3">
          <p className="text-sm text-muted-foreground mb-2">No keywords extracted yet.</p>
          <Button size="sm" onClick={async () => await handleReExtract()}>
            {isReExtracting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Extract Keywords
          </Button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 mb-3">
          {keywords.map((k) => (
            <Badge key={k.keyword} variant="outline" className="px-2 py-1 text-sm">
              {k.keyword} <span className="ml-2 text-xs opacity-80">{k.score}</span>
            </Badge>
          ))}
        </div>
      )}

      <h4 className="text-sm font-semibold text-foreground mb-2">Recommended Topics</h4>
      {topics.length === 0 ? (
        <p className="text-sm text-muted-foreground">No topic suggestions available.</p>
      ) : (
        <div className="space-y-2">
          {topics.map((t, i) => (
            <div key={i} className="p-2 bg-secondary/50 rounded-md flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">{t.topic}</p>
                <p className="text-xs text-muted-foreground">{t.reason}</p>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-sm text-foreground mb-2">{Math.round(t.score * 100)}%</span>
                <Button size="sm" variant="outline" onClick={() => createDraft(t.topic)}>
                  Create Draft
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );

  async function createDraft(topic: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create a draft article in articles table using topic as title
      const slug = topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const { data, error } = await supabase
        .from('articles')
        .insert({
          user_id: user.id,
          title: topic,
          keyword: topic,
          intent: 'informational',
          content: { title: topic, content: '' },
          status: 'draft',
          // some DB schemas require website_url; provide empty string as safe default
          website_url: ''
        })
        .select()
        .single();

      if (error) throw error;
      toast.success('Draft created');
      // navigate to edit page if exists - left as manual step
    } catch (err: any) {
      console.error('Failed to create draft from topic:', err);
      toast.error(err?.message || 'Failed to create draft');
    }
  }

  // ----- Helper functions -----
  async function handleReExtract() {
    setIsReExtracting(true);
    setErrorMsg(null);
    const table = kind === 'article' ? 'articles' : 'blog_posts';

    try {
      // First try to call the server-side proxy function with a short timeout
      const body: any = {};
      if (kind === 'article') body.article_id = id; else body.blog_post_id = id;

      // Try invoking the function with retries
      const maxRetries = 3;
      let lastError;
      
      for (let i = 0; i < maxRetries; i++) {
        try {
          const res = await supabase.functions.invoke('proxy-extract', { 
            body,
            headers: {
              'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
              'Content-Type': 'application/json',
            }
          });
          
          if (!res.error) {
            // Success - break out of retry loop
            return res;
          }
          
          lastError = res.error;
          console.warn(`Retry ${i + 1}/${maxRetries} failed:`, lastError);
          
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
          
        } catch (e) {
          lastError = e;
          console.warn(`Retry ${i + 1}/${maxRetries} failed:`, e);
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
      }
      
      const res: any = { error: lastError };

      if (res && res.error) {
        // Check for specific error types
        const errorStr = String(res.error);
        if (errorStr.includes('CORS') || errorStr.includes('NetworkError')) {
          console.error('CORS or Network error:', res.error);
          toast.error('Network error - please try again');
          setIsReExtracting(false);
          return;
        }
        
        if (errorStr.includes('JWT') || errorStr.includes('auth')) {
          console.error('Authentication error:', res.error);
          toast.error('Session expired - please log in again');
          setIsReExtracting(false);
          return;
        }
        
        // For other errors, fallback to client-side extraction
        console.warn('proxy-extract failed, falling back to client-side extraction:', res.error);
        toast.warning('Server extraction failed — using local fallback');

        // fetch content/title so we can run local extractor
        const { data: rowData, error: rowErr } = await supabase
          .from(table)
          .select('title, content')
          .eq('id', id)
          .single();

        if (rowErr) throw rowErr;

        const title = (rowData as any)?.title || '';
        const content = (rowData as any)?.content || '';
        const extracted = clientExtract(`${title}\n\n${extractContentText(content)}`.trim(), title);

        setKeywords(extracted.keywords);
        setTopics(extracted.topics);

        // attempt to persist to DB (best-effort)
        try {
          // cast to any because DB types may not include the new JSONB columns yet
          await (supabase as any).from(table).update({ extracted_keywords: extracted.keywords, recommended_topics: extracted.topics }).eq('id', id);
          toast.success('Local extraction saved to DB (best-effort)');
        } catch (saveErr: any) {
          console.warn('Failed to save local extraction to DB:', saveErr);
        }
      } else {
        // invocation succeeded — refresh data after a short wait for the function to complete DB writes
        toast.success('Extraction started on server — refreshing shortly');
        setTimeout(() => fetchData(), 1400);
      }
    } catch (err: any) {
      console.error('Re-extract failed:', err);
      setErrorMsg(err?.message || 'Re-extract failed');
      toast.error(err?.message || 'Re-extract failed');
    } finally {
      setIsReExtracting(false);
    }
  }

  // Lightweight client-side extractor fallback (rule-based: unigrams + bigrams, stopwords, title boost)
  function clientExtract(text: string, title = '') {
    const stopwords = new Set([
      'the','and','is','in','at','of','a','an','to','for','on','with','as','by','that','this','it','from','be','are','or','was','were','will','can','has','have'
    ]);

    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
    const ntext = normalize(text);
    const words = ntext.split(' ').filter(Boolean).filter(w => !stopwords.has(w));

    const counts = new Map<string, number>();
    for (const w of words) counts.set(w, (counts.get(w) || 0) + 1);

    // bigrams
    for (let i = 0; i + 1 < words.length; i++) {
      const big = `${words[i]} ${words[i+1]}`;
      counts.set(big, (counts.get(big) || 0) + 1);
    }

    const titleNorm = normalize(title);

    const entries = Array.from(counts.entries()).map(([keyword, cnt]) => {
      let score = cnt;
      if (titleNorm && titleNorm.includes(keyword)) score += 2; // title boost
      return { keyword, score };
    });

    entries.sort((a,b) => b.score - a.score);

    const top = entries.slice(0, 20);
    const maxScore = top[0]?.score || 1;

    const keywords = top.map(k => ({ keyword: k.keyword, score: +(k.score / maxScore).toFixed(3), source: 'local' }));

    // Recommended topics are just the top 5 keywords with reasons
    const topics = keywords.slice(0,5).map(k => ({ topic: k.keyword, score: k.score, reason: 'Top occurrence' }));

    return { keywords, topics };
  }

  // extract plain text from content field which may be JSON or markdown
  function extractContentText(content: any) {
    if (!content) return '';
    if (typeof content === 'string') return content;
    try {
      // some content is stored as { title, content }
      if (content?.content && typeof content.content === 'string') return content.content;
      return JSON.stringify(content);
    } catch {
      return String(content);
    }
  }
}

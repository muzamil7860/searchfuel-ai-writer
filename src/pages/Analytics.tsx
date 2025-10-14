import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, Users, Eye, Clock } from "lucide-react";
import { subDays, format, startOfDay } from "date-fns";

type DateRange = "7D" | "2W" | "1M" | "3M" | "6M" | "1YR";

interface AnalyticsData {
  date: string;
  page_views: number;
  unique_visitors: number;
  bounce_rate: number;
  avg_time_on_page: number;
}

export default function Analytics() {
  const [selectedRange, setSelectedRange] = useState<DateRange>("7D");
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [blogId, setBlogId] = useState<string | null>(null);

  const dateRanges: { label: DateRange; days: number }[] = [
    { label: "7D", days: 7 },
    { label: "2W", days: 14 },
    { label: "1M", days: 30 },
    { label: "3M", days: 90 },
    { label: "6M", days: 180 },
    { label: "1YR", days: 365 },
  ];

  useEffect(() => {
    fetchBlogAndAnalytics();
  }, [selectedRange]);

  const fetchBlogAndAnalytics = async () => {
    setLoading(true);
    
    // Get user's blog
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data: blogs } = await supabase
      .from("blogs")
      .select("id")
      .eq("user_id", user.id)
      .limit(1)
      .single();

    if (!blogs) {
      setLoading(false);
      return;
    }

    setBlogId(blogs.id);

    // Fetch analytics data
    const days = dateRanges.find((r) => r.label === selectedRange)?.days || 7;
    const startDate = startOfDay(subDays(new Date(), days));

    const { data: analytics } = await supabase
      .from("blog_analytics")
      .select("*")
      .eq("blog_id", blogs.id)
      .gte("date", startDate.toISOString())
      .order("date", { ascending: true });

    if (analytics) {
      setAnalyticsData(analytics.map(a => ({
        date: format(new Date(a.date), "MMM dd"),
        page_views: a.page_views,
        unique_visitors: a.unique_visitors,
        bounce_rate: a.bounce_rate || 0,
        avg_time_on_page: a.avg_time_on_page || 0,
      })));
    }

    setLoading(false);
  };

  const totalPageViews = analyticsData.reduce((sum, d) => sum + d.page_views, 0);
  const totalVisitors = analyticsData.reduce((sum, d) => sum + d.unique_visitors, 0);
  const avgBounceRate = analyticsData.length > 0
    ? analyticsData.reduce((sum, d) => sum + d.bounce_rate, 0) / analyticsData.length
    : 0;
  const avgTimeOnPage = analyticsData.length > 0
    ? analyticsData.reduce((sum, d) => sum + d.avg_time_on_page, 0) / analyticsData.length
    : 0;

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track your blog performance and insights
          </p>
        </div>
        
        <div className="flex gap-2">
          {dateRanges.map((range) => (
            <Button
              key={range.label}
              variant={selectedRange === range.label ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedRange(range.label)}
            >
              {range.label}
            </Button>
          ))}
        </div>
      </div>

      {!blogId ? (
        <Card className="p-12 text-center bg-card">
          <div className="max-w-md mx-auto">
            <h3 className="text-xl font-bold text-foreground mb-2">
              No Blog Found
            </h3>
            <p className="text-muted-foreground">
              Create a blog to start tracking analytics.
            </p>
          </div>
        </Card>
      ) : (
        <>
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Total Views</span>
                <Eye className="w-4 h-4 text-accent" />
              </div>
              <div className="text-3xl font-bold text-foreground">{totalPageViews.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Page views in selected period</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Unique Visitors</span>
                <Users className="w-4 h-4 text-accent" />
              </div>
              <div className="text-3xl font-bold text-foreground">{totalVisitors.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Unique visitors tracked</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Bounce Rate</span>
                <TrendingUp className="w-4 h-4 text-accent" />
              </div>
              <div className="text-3xl font-bold text-foreground">{avgBounceRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground mt-1">Average bounce rate</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Avg. Time</span>
                <Clock className="w-4 h-4 text-accent" />
              </div>
              <div className="text-3xl font-bold text-foreground">{Math.floor(avgTimeOnPage / 60)}m {avgTimeOnPage % 60}s</div>
              <p className="text-xs text-muted-foreground mt-1">Time on page</p>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Page Views</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analyticsData}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="page_views" 
                    stroke="hsl(var(--accent))" 
                    fillOpacity={1} 
                    fill="url(#colorViews)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Unique Visitors</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analyticsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="unique_visitors" 
                    stroke="hsl(var(--accent))" 
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--accent))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

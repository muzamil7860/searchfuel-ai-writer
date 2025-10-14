import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, TrendingDown, Minus, Search, Loader2, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Keyword {
  keyword: string;
  searchVolume: number;
  difficulty: number;
  intent: "Informational" | "Commercial" | "Transactional" | "Navigational";
  trend: "up" | "down" | "stable";
  cpc: number;
}


export default function Keywords() {
  const [searchQuery, setSearchQuery] = useState("");
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState("");

  // Fetch keywords from database
  const fetchKeywords = async () => {
    try {
      setIsFetching(true);
      const { data, error } = await supabase
        .from("keywords")
        .select("*")
        .order("search_volume", { ascending: false });

      if (error) throw error;

      // Transform database data to match Keyword interface
      const transformedKeywords: Keyword[] = (data || []).map((kw) => ({
        keyword: kw.keyword,
        searchVolume: kw.search_volume,
        difficulty: kw.difficulty || 0,
        intent: (kw.intent as Keyword["intent"]) || "Informational",
        trend: (kw.trend as Keyword["trend"]) || "stable",
        cpc: parseFloat(kw.cpc?.toString() || "0"),
      }));

      setKeywords(transformedKeywords);
    } catch (error) {
      console.error("Error fetching keywords:", error);
      toast.error("Failed to fetch keywords from database");
    } finally {
      setIsFetching(false);
    }
  };

  // Scan website for keywords
  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!websiteUrl.trim()) {
      toast.error("Please enter a website URL");
      return;
    }

    setIsScanning(true);
    try {
      // Format URL: add https:// if no protocol is specified, remove www
      let url = websiteUrl.trim().toLowerCase();
      url = url.replace(/^(https?:\/\/)?(www\.)?/, '');
      url = `https://${url}`;

      const { data, error } = await supabase.functions.invoke("scan-website", {
        body: { url },
      });

      if (error) throw error;

      toast.success("Keywords discovered and saved!");
      setWebsiteUrl("");
      
      // Immediate refresh to show keywords
      fetchKeywords();
    } catch (error) {
      console.error("Error scanning website:", error);
      toast.error("Failed to scan website");
    } finally {
      setIsScanning(false);
    }
  };

  // Delete a keyword
  const deleteKeyword = async (keyword: string) => {
    try {
      const { error } = await supabase
        .from("keywords")
        .delete()
        .eq("keyword", keyword);

      if (error) throw error;

      toast.success("Keyword removed successfully");
      await fetchKeywords();
    } catch (error) {
      console.error("Error deleting keyword:", error);
      toast.error("Failed to delete keyword");
    }
  };

  // Load keywords on mount
  useEffect(() => {
    fetchKeywords();

    // Set up realtime subscription
    const channel = supabase
      .channel("keywords-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "keywords",
        },
        () => {
          console.log("Keywords changed, refreshing...");
          fetchKeywords();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredKeywords = keywords.filter((kw) =>
    kw.keyword.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty < 40) return "bg-green-500/10 text-green-600 border-green-500/20";
    if (difficulty < 60) return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
    return "bg-red-500/10 text-red-600 border-red-500/20";
  };

  const getIntentColor = (intent: string) => {
    switch (intent) {
      case "Informational": return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "Commercial": return "bg-purple-500/10 text-purple-600 border-purple-500/20";
      case "Transactional": return "bg-green-500/10 text-green-600 border-green-500/20";
      case "Navigational": return "bg-orange-500/10 text-orange-600 border-orange-500/20";
      default: return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <TrendingUp className="w-4 h-4 text-green-600" />;
      case "down": return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Keywords</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Keywords discovered from your website analysis
        </p>
      </div>

      {isFetching ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : keywords.length === 0 ? (
        <Card className="p-12 bg-card">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">
                Analyze Your Site to Discover Keywords
              </h3>
              <p className="text-muted-foreground">
                Enter your website URL to scan for SEO opportunities and keyword insights.
              </p>
            </div>
            <form onSubmit={handleScan} className="max-w-xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="text"
                  placeholder="example.com"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="flex-1 h-12 text-base"
                  required
                />
                <Button
                  type="submit"
                  disabled={isScanning || !websiteUrl.trim()}
                  className="h-12 px-6 shrink-0"
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Analyze Website
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </Card>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 bg-card">
          <p className="text-sm text-muted-foreground mb-1">Total Keywords</p>
          <p className="text-2xl font-bold text-foreground">
            {isFetching ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              keywords.length
            )}
          </p>
        </Card>
        <Card className="p-4 bg-card">
          <p className="text-sm text-muted-foreground mb-1">Avg. Search Volume</p>
          <p className="text-2xl font-bold text-foreground">
            {isFetching ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : keywords.length > 0 ? (
              Math.round(
                keywords.reduce((acc, kw) => acc + kw.searchVolume, 0) / keywords.length
              ).toLocaleString()
            ) : (
              "0"
            )}
          </p>
        </Card>
        <Card className="p-4 bg-card">
          <p className="text-sm text-muted-foreground mb-1">Avg. Difficulty</p>
          <p className="text-2xl font-bold text-foreground">
            {isFetching ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : keywords.length > 0 ? (
              Math.round(
                keywords.reduce((acc, kw) => acc + kw.difficulty, 0) / keywords.length
              )
            ) : (
              "0"
            )}
          </p>
        </Card>
        <Card className="p-4 bg-card">
          <p className="text-sm text-muted-foreground mb-1">Avg. CPC</p>
          <p className="text-2xl font-bold text-foreground">
            {isFetching ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : keywords.length > 0 ? (
              `$${(keywords.reduce((acc, kw) => acc + kw.cpc, 0) / keywords.length).toFixed(2)}`
            ) : (
              "$0.00"
            )}
            </p>
          </Card>
        </div>

        {/* Search Bar */}
        <Card className="p-4 mb-6 bg-card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          </div>
          </Card>

          {/* Keywords Table */}
          <Card className="bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Keyword</TableHead>
              <TableHead>Search Volume</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead>Intent</TableHead>
              <TableHead>Trend</TableHead>
              <TableHead className="text-right">CPC</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isFetching ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                  <p className="text-sm text-muted-foreground mt-2">Loading keywords...</p>
                </TableCell>
              </TableRow>
            ) : filteredKeywords.length > 0 ? (
              filteredKeywords.map((keyword, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium text-foreground">{keyword.keyword}</TableCell>
                  <TableCell className="text-foreground">{keyword.searchVolume.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getDifficultyColor(keyword.difficulty)}>
                      {keyword.difficulty}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getIntentColor(keyword.intent)}>
                      {keyword.intent}
                    </Badge>
                  </TableCell>
                  <TableCell>{getTrendIcon(keyword.trend)}</TableCell>
                  <TableCell className="text-right text-foreground">${keyword.cpc.toFixed(2)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteKeyword(keyword.keyword)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  {searchQuery ? (
                    `No keywords found matching "${searchQuery}"`
                  ) : (
                    <div>
                      <p className="mb-2">No keywords yet</p>
                      <p className="text-sm">Use the research form above to add keywords</p>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            )}
            </TableBody>
          </Table>
          </Card>
        </>
      )}
    </div>
  );
}

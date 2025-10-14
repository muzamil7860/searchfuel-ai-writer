import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, TrendingDown, Minus, Search, Loader2, Trash2, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [keywordInput, setKeywordInput] = useState("");
  const { toast } = useToast();

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
      toast({
        title: "Error",
        description: "Failed to fetch keywords from database",
        variant: "destructive",
      });
    } finally {
      setIsFetching(false);
    }
  };

  // Research keywords using DataForSEO
  const researchKeywords = async () => {
    if (!keywordInput.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter keywords to research",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      // Parse keywords (split by newline or comma)
      const keywordList = keywordInput
        .split(/[\n,]+/)
        .map((k) => k.trim())
        .filter((k) => k.length > 0);

      if (keywordList.length === 0) {
        throw new Error("No valid keywords found");
      }

      console.log("Researching keywords:", keywordList);

      const { data, error } = await supabase.functions.invoke("fetch-keywords", {
        body: {
          keywords: keywordList,
          location_code: 2840, // USA
          language_code: "en",
        },
      });

      if (error) throw error;

      console.log("Research complete:", data);

      toast({
        title: "Success!",
        description: `Added ${data.count} keywords to your research`,
      });

      // Clear input and refresh list
      setKeywordInput("");
      await fetchKeywords();
    } catch (error) {
      console.error("Error researching keywords:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to research keywords",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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

      toast({
        title: "Deleted",
        description: "Keyword removed successfully",
      });

      await fetchKeywords();
    } catch (error) {
      console.error("Error deleting keyword:", error);
      toast({
        title: "Error",
        description: "Failed to delete keyword",
        variant: "destructive",
      });
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
        <h1 className="text-2xl font-bold text-foreground">Keywords Research</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Research keywords with real search volume, CPC, and competition data from Google Ads
        </p>
      </div>

      {/* Keyword Research Form */}
      <Card className="p-6 mb-6 bg-card">
        <h2 className="text-lg font-semibold mb-4 text-foreground">Research New Keywords</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Enter Keywords (one per line or comma-separated)
            </label>
            <Textarea
              placeholder="energy efficient windows&#10;replacement windows cost&#10;double hung windows"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              rows={5}
              className="resize-none"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={researchKeywords}
              disabled={isLoading || !keywordInput.trim()}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Researching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Research Keywords
                </>
              )}
            </Button>
            <Button
              onClick={fetchKeywords}
              variant="outline"
              disabled={isFetching}
            >
              {isFetching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </Card>

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
    </div>
  );
}

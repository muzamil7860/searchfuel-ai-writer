import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, TrendingDown, Minus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface Keyword {
  keyword: string;
  searchVolume: number;
  difficulty: number;
  intent: "Informational" | "Commercial" | "Transactional" | "Navigational";
  trend: "up" | "down" | "stable";
  cpc: number;
}

const sampleKeywords: Keyword[] = [
  { keyword: "energy efficient windows", searchVolume: 18100, difficulty: 62, intent: "Informational", trend: "up", cpc: 12.45 },
  { keyword: "replacement windows cost", searchVolume: 14800, difficulty: 58, intent: "Commercial", trend: "up", cpc: 15.32 },
  { keyword: "double hung windows", searchVolume: 12100, difficulty: 54, intent: "Commercial", trend: "stable", cpc: 11.20 },
  { keyword: "casement windows", searchVolume: 9900, difficulty: 52, intent: "Commercial", trend: "stable", cpc: 10.85 },
  { keyword: "patio door replacement", searchVolume: 8100, difficulty: 60, intent: "Commercial", trend: "up", cpc: 14.67 },
  { keyword: "sliding glass door", searchVolume: 7400, difficulty: 48, intent: "Commercial", trend: "down", cpc: 9.12 },
  { keyword: "french doors exterior", searchVolume: 6600, difficulty: 55, intent: "Commercial", trend: "stable", cpc: 13.24 },
  { keyword: "bay windows", searchVolume: 6100, difficulty: 50, intent: "Informational", trend: "stable", cpc: 11.45 },
  { keyword: "window installation near me", searchVolume: 5900, difficulty: 72, intent: "Transactional", trend: "up", cpc: 18.90 },
  { keyword: "best replacement windows", searchVolume: 4800, difficulty: 65, intent: "Commercial", trend: "up", cpc: 16.78 },
  { keyword: "vinyl windows", searchVolume: 4400, difficulty: 46, intent: "Informational", trend: "down", cpc: 8.95 },
  { keyword: "how to measure for replacement windows", searchVolume: 3900, difficulty: 42, intent: "Informational", trend: "stable", cpc: 5.60 },
  { keyword: "window replacement cost calculator", searchVolume: 3600, difficulty: 50, intent: "Commercial", trend: "up", cpc: 12.15 },
  { keyword: "fiberglass windows", searchVolume: 3200, difficulty: 48, intent: "Informational", trend: "stable", cpc: 10.20 },
  { keyword: "sliding patio door", searchVolume: 2900, difficulty: 44, intent: "Commercial", trend: "stable", cpc: 8.85 },
  { keyword: "window u-factor", searchVolume: 2400, difficulty: 38, intent: "Informational", trend: "up", cpc: 4.25 },
  { keyword: "low-e glass windows", searchVolume: 2100, difficulty: 40, intent: "Informational", trend: "up", cpc: 6.80 },
  { keyword: "bifold patio doors", searchVolume: 1800, difficulty: 52, intent: "Commercial", trend: "up", cpc: 15.40 },
];

export default function Keywords() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredKeywords = sampleKeywords.filter(kw =>
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
          Track high-value keyword opportunities for your content strategy
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 bg-card">
          <p className="text-sm text-muted-foreground mb-1">Total Keywords</p>
          <p className="text-2xl font-bold text-foreground">{sampleKeywords.length}</p>
        </Card>
        <Card className="p-4 bg-card">
          <p className="text-sm text-muted-foreground mb-1">Avg. Search Volume</p>
          <p className="text-2xl font-bold text-foreground">
            {Math.round(sampleKeywords.reduce((acc, kw) => acc + kw.searchVolume, 0) / sampleKeywords.length).toLocaleString()}
          </p>
        </Card>
        <Card className="p-4 bg-card">
          <p className="text-sm text-muted-foreground mb-1">Avg. Difficulty</p>
          <p className="text-2xl font-bold text-foreground">
            {Math.round(sampleKeywords.reduce((acc, kw) => acc + kw.difficulty, 0) / sampleKeywords.length)}
          </p>
        </Card>
        <Card className="p-4 bg-card">
          <p className="text-sm text-muted-foreground mb-1">Avg. CPC</p>
          <p className="text-2xl font-bold text-foreground">
            ${(sampleKeywords.reduce((acc, kw) => acc + kw.cpc, 0) / sampleKeywords.length).toFixed(2)}
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredKeywords.length > 0 ? (
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
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No keywords found matching "{searchQuery}"
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

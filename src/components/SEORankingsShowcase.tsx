import { CheckCircle2, TrendingUp, Search, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const SEORankingsShowcase = () => {
  const features = [
    "Real-time keyword performance tracking",
    "Built-in SEO health monitoring dashboard",
    "Search volume and competition metrics",
    "Content optimization recommendations",
    "Track rankings without spreadsheets"
  ];

  const chartData = [
    { month: "Jan", rankings: 12 },
    { month: "Feb", rankings: 19 },
    { month: "Mar", rankings: 28 },
    { month: "Apr", rankings: 45 },
    { month: "May", rankings: 67 },
    { month: "Jun", rankings: 89 }
  ];

  return (
    <section className="py-24 px-4 bg-background">
      <div className="container mx-auto max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Features */}
          <div className="space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              Start Creating <span className="text-accent">Content</span>,<br />
              Watch Your <span className="text-emerald-500">Rankings</span> 📈 Soar
            </h2>
            
            <ul className="space-y-4">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className="text-lg text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Column - Dashboard Mockup */}
          <div className="space-y-4">
            {/* Traffic Card */}
            <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium text-foreground/80">
                    Organic Traffic
                  </CardTitle>
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-emerald-500">+847%</span>
                  <span className="text-sm text-muted-foreground">this quarter</span>
                </div>
              </CardContent>
            </Card>

            {/* Rankings Chart Card */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium">Keywords Ranking</CardTitle>
                  <BarChart3 className="w-5 h-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="month" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="rankings" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Search Volume Card */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium">Search Volume</CardTitle>
                  <Search className="w-5 h-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">127.5K</span>
                  <span className="text-sm text-muted-foreground">monthly searches</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SEORankingsShowcase;

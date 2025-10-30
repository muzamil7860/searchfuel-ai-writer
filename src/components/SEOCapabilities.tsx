import { DollarSign, BarChart3, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SEOCapabilities = () => {
  const chartData = [
    { month: 'Jan', rankings: 45 },
    { month: 'Feb', rankings: 62 },
    { month: 'Mar', rankings: 78 },
    { month: 'Apr', rankings: 85 },
    { month: 'May', rankings: 93 },
  ];

  return (
    <section className="py-24 px-4 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
          Built for <span className="text-accent">Scale</span>. Trusted by the Best.{" "}
          Fully <span className="text-accent">Integrated</span>.
        </h2>
        
        {/* Three Column Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* Left Card - Transparent Pricing */}
          <Card className="border-border/50">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                <DollarSign className="w-6 h-6 text-accent" />
              </div>
              <CardTitle className="text-xl">Transparent Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                No hidden fees, predictable costs for high-volume content generation
              </p>
            </CardContent>
          </Card>

          {/* Center Card - Featured Dashboard */}
          <Card className="bg-gradient-to-br from-[#1a2332] via-[#1e2838] to-[#151d29] border-accent/20 text-white">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <BarChart3 className="w-6 h-6 text-accent" />
                <span className="text-3xl font-bold text-accent">93%</span>
              </div>
              <CardTitle className="text-xl text-white">SEO Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                  <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1a2332', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="rankings" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-white/70 text-sm mt-4">
                Rankings up with proper indexing
              </p>
            </CardContent>
          </Card>

          {/* Right Card - Deep Integrations */}
          <Card className="border-border/50">
            <CardHeader>
              <div className="flex gap-2 mb-4">
                <div className="w-10 h-10 rounded bg-accent/10 flex items-center justify-center">
                  <span className="text-accent font-bold text-xs">WP</span>
                </div>
                <div className="w-10 h-10 rounded bg-accent/10 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-accent" />
                </div>
                <div className="w-10 h-10 rounded bg-accent/10 flex items-center justify-center">
                  <span className="text-accent font-bold text-xs">HB</span>
                </div>
              </div>
              <CardTitle className="text-xl">Deep CMS Integrations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Optimized for WordPress, Ghost, HubSpot, Shopify, and more
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Testimonial Card */}
        <Card className="mb-8 border-border/50">
          <CardContent className="pt-6">
            <p className="text-lg text-foreground mb-4 italic">
              "We run thousands of articles through this platform, and the results speak for themselves. 
              Our organic traffic has skyrocketed. The integration with our CMS is clean, the support 
              is responsive, and the ROI is undeniable."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                <span className="text-accent font-bold">SS</span>
              </div>
              <div>
                <p className="font-semibold text-foreground">Sean Sathoth</p>
                <p className="text-sm text-muted-foreground">Head of SEO & Strategy at SearchOptimize</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Companies Count */}
        <Card className="bg-gradient-to-br from-[#1a2332] via-[#1e2838] to-[#151d29] border-accent/20">
          <CardContent className="pt-6 text-center">
            <p className="text-5xl font-bold text-accent mb-2">100+</p>
            <p className="text-white/80">Companies generating content with us</p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default SEOCapabilities;

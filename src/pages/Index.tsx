import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { LogOut } from "lucide-react";

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Header with Auth Menu */}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <span className="text-white font-bold text-sm">SF</span>
            </div>
            <h1 className="text-xl font-bold text-foreground">SearchFuel</h1>
          </div>
          
          <nav className="flex items-center gap-3">
            {user ? (
              <>
                <Button onClick={() => navigate("/dashboard")}>
                  Dashboard
                </Button>
                <Button variant="outline" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => navigate("/auth?mode=signin")}>
                  Sign In
                </Button>
                <Button onClick={() => navigate("/auth?mode=signup")}>
                  Sign Up
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            AI-Powered SEO Content
            <br />
            <span className="bg-gradient-to-r from-accent via-accent/80 to-accent/60 bg-clip-text text-transparent">
              That Ranks & Converts
            </span>
          </h2>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Connect your CMS and let AI automatically generate and publish SEO-optimized articles that drive traffic and conversions.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            {user ? (
              <Button size="lg" onClick={() => navigate("/dashboard")} className="text-lg px-8">
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button size="lg" onClick={() => navigate("/auth?mode=signup")} className="text-lg px-8">
                  Get Started Free
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate("/auth?mode=signin")} className="text-lg px-8">
                  Sign In
                </Button>
              </>
            )}
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mt-20">
            <div className="p-6 rounded-lg border border-border/40 bg-card/50 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔌</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">CMS Integration</h3>
              <p className="text-sm text-muted-foreground">
                Seamlessly connect with WordPress, Webflow, Ghost, Shopify, and more
              </p>
            </div>

            <div className="p-6 rounded-lg border border-border/40 bg-card/50 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">AI Content Generation</h3>
              <p className="text-sm text-muted-foreground">
                Generate high-quality, SEO-optimized articles automatically
              </p>
            </div>

            <div className="p-6 rounded-lg border border-border/40 bg-card/50 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Performance Tracking</h3>
              <p className="text-sm text-muted-foreground">
                Monitor views, engagement, and content performance
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;

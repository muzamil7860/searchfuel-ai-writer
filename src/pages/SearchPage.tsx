import { Card } from "@/components/ui/card";

export default function SearchPage() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Search</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Search through your content and keywords
        </p>
      </div>

      <Card className="p-12 text-center bg-card">
        <div className="max-w-md mx-auto">
          <h3 className="text-xl font-bold text-foreground mb-2">
            Search Coming Soon
          </h3>
          <p className="text-muted-foreground">
            Search and filter your SEO content library.
          </p>
        </div>
      </Card>
    </div>
  );
}

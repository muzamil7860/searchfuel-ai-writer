import { Card } from "@/components/ui/card";

export default function Keywords() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Keywords</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Research and track keyword opportunities
        </p>
      </div>

      <Card className="p-12 text-center bg-card">
        <div className="max-w-md mx-auto">
          <h3 className="text-xl font-bold text-foreground mb-2">
            Keyword Research Coming Soon
          </h3>
          <p className="text-muted-foreground">
            Discover and track keyword opportunities for your content.
          </p>
        </div>
      </Card>
    </div>
  );
}

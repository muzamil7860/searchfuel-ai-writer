import { Card } from "@/components/ui/card";

export default function Articles() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Articles</h1>
        <p className="text-sm text-muted-foreground mt-1">
          View and manage your generated articles
        </p>
      </div>

      <Card className="p-12 text-center bg-card">
        <div className="max-w-md mx-auto">
          <h3 className="text-xl font-bold text-foreground mb-2">
            No Articles Yet
          </h3>
          <p className="text-muted-foreground">
            Articles you generate will appear here.
          </p>
        </div>
      </Card>
    </div>
  );
}

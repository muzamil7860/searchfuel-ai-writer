import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Check, X } from "lucide-react";

interface OnboardingData {
  companyName: string;
  websiteHomepage: string;
  websiteCta: string;
  industry: string;
  companyDescription: string;
  targetAudience: string;
  competitors: Array<{ name: string; website: string }>;
  theme: string;
  subdomain: string;
}

interface BlogOnboardingProps {
  open: boolean;
  onComplete: () => void;
  onCancel: () => void;
}

const THEMES = [
  { id: "bold-gradient", name: "Bold Gradient", preview: "Linear gradient from blue to red" },
  { id: "clean-geometric", name: "Clean Geometric", preview: "Teal to orange with geometric shapes" },
  { id: "minimal-modern", name: "Minimal Modern", preview: "Beige with line art illustrations" },
  { id: "vibrant-objects", name: "Vibrant Objects", preview: "Purple with 3D rendered objects" },
];

const INDUSTRIES = [
  "SaaS / Software",
  "E-commerce",
  "Fintech",
  "Healthcare",
  "Education",
  "Marketplace",
  "Legal",
  "Other",
];

export function BlogOnboarding({ open, onComplete, onCancel }: BlogOnboardingProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<OnboardingData>({
    companyName: "",
    websiteHomepage: "",
    websiteCta: "",
    industry: "",
    companyDescription: "",
    targetAudience: "",
    competitors: [{ name: "", website: "" }],
    theme: "bold-gradient",
    subdomain: "",
  });

  const totalSteps = 5;

  const updateField = (field: keyof OnboardingData, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const addCompetitor = () => {
    updateField("competitors", [...formData.competitors, { name: "", website: "" }]);
  };

  const updateCompetitor = (index: number, field: "name" | "website", value: string) => {
    const newCompetitors = [...formData.competitors];
    newCompetitors[index][field] = value;
    updateField("competitors", newCompetitors);
  };

  const removeCompetitor = (index: number) => {
    const newCompetitors = formData.competitors.filter((_, i) => i !== index);
    updateField("competitors", newCompetitors);
  };

  const canContinue = () => {
    switch (step) {
      case 1:
        return formData.companyName && formData.websiteHomepage && formData.industry;
      case 2:
        return formData.companyDescription.length >= 50 && formData.targetAudience;
      case 3:
        return formData.competitors.some(c => c.name);
      case 4:
        return formData.theme;
      case 5:
        return formData.subdomain.match(/^[a-z0-9-]+$/);
      default:
        return false;
    }
  };

  const handleComplete = async () => {
    if (!canContinue()) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("blogs").insert({
        user_id: user.id,
        subdomain: formData.subdomain.toLowerCase(),
        title: formData.companyName,
        description: formData.companyDescription,
        company_name: formData.companyName,
        website_homepage: formData.websiteHomepage,
        website_cta: formData.websiteCta || null,
        industry: formData.industry,
        company_description: formData.companyDescription,
        target_audience: formData.targetAudience,
        competitors: formData.competitors.filter(c => c.name),
        theme: formData.theme,
        onboarding_completed: true,
        is_published: false,
      });

      if (error) throw error;

      toast.success("Blog created successfully!");
      onComplete();
    } catch (error: any) {
      toast.error("Failed to create blog: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: totalSteps }, (_, i) => {
        const stepNum = i + 1;
        const isActive = stepNum === step;
        const isCompleted = stepNum < step;

        return (
          <div key={stepNum} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors
                ${isCompleted ? "bg-accent text-white" : ""}
                ${isActive ? "bg-accent text-white ring-2 ring-accent ring-offset-2" : ""}
                ${!isActive && !isCompleted ? "bg-muted text-muted-foreground" : ""}
              `}
            >
              {isCompleted ? <Check className="w-4 h-4" /> : stepNum}
            </div>
            {stepNum < totalSteps && (
              <div className={`w-12 h-0.5 ${isCompleted ? "bg-accent" : "bg-muted"}`} />
            )}
          </div>
        );
      })}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Tell us about your company</h2>
        <p className="text-muted-foreground">This helps us understand your business and target audience</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="companyName">Company Name *</Label>
          <Input
            id="companyName"
            placeholder="Acme Corp"
            value={formData.companyName}
            onChange={(e) => updateField("companyName", e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="websiteHomepage">Website Homepage *</Label>
          <Input
            id="websiteHomepage"
            placeholder="https://acme.com"
            value={formData.websiteHomepage}
            onChange={(e) => updateField("websiteHomepage", e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="websiteCta">Website CTA (Optional)</Label>
          <Input
            id="websiteCta"
            placeholder="https://yourdomain.com/get-demo (optional)"
            value={formData.websiteCta}
            onChange={(e) => updateField("websiteCta", e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="industry">Industry *</Label>
          <Select value={formData.industry} onValueChange={(value) => updateField("industry", value)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select industry..." />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              {INDUSTRIES.map((industry) => (
                <SelectItem key={industry} value={industry}>
                  {industry}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Tell us about your company</h2>
        <p className="text-muted-foreground">Help us generate relevant content for your audience</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="companyDescription">Company Description *</Label>
          <Textarea
            id="companyDescription"
            placeholder="We help SaaS companies understand user behavior and optimize their funnels with AI-powered analytics"
            value={formData.companyDescription}
            onChange={(e) => updateField("companyDescription", e.target.value)}
            className="mt-1 min-h-32"
          />
          <p className={`text-xs mt-1 ${formData.companyDescription.length < 50 ? "text-red-500" : "text-muted-foreground"}`}>
            {formData.companyDescription.length}/500 characters (minimum 50)
          </p>
        </div>

        <div>
          <Label htmlFor="targetAudience">Target Audience *</Label>
          <Input
            id="targetAudience"
            placeholder="Startup founders"
            value={formData.targetAudience}
            onChange={(e) => updateField("targetAudience", e.target.value)}
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Who are your competitors?</h2>
        <p className="text-muted-foreground">We'll discover winnable keywords related to these companies</p>
      </div>

      <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
        <p className="text-sm font-medium text-foreground mb-2">Why we ask this:</p>
        <p className="text-sm text-muted-foreground mb-2">Our AI will generate long-tail keyword variants like:</p>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>"[Competitor] alternative for [your niche]"</li>
          <li>"[Competitor] vs [Your Product] for [use case]"</li>
          <li>"Best [category] tools like [Competitor]"</li>
        </ul>
      </Card>

      <div className="space-y-3">
        {formData.competitors.map((competitor, index) => (
          <div key={index} className="space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder={`Competitor ${index + 1}`}
                value={competitor.name}
                onChange={(e) => updateCompetitor(index, "name", e.target.value)}
              />
              {formData.competitors.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeCompetitor(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            <Input
              placeholder="Website (optional)"
              value={competitor.website}
              onChange={(e) => updateCompetitor(index, "website", e.target.value)}
            />
          </div>
        ))}

        <Button variant="outline" onClick={addCompetitor} className="w-full">
          + Add another competitor
        </Button>
        <p className="text-xs text-muted-foreground">Add 3-5 competitors for best results</p>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Choose Your Blog Theme</h2>
        <p className="text-muted-foreground">Pick a design style for your blog</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {THEMES.map((theme) => (
          <Card
            key={theme.id}
            className={`cursor-pointer transition-all ${
              formData.theme === theme.id ? "ring-2 ring-accent" : ""
            }`}
            onClick={() => updateField("theme", theme.id)}
          >
            <div className={`h-40 rounded-t-lg ${getThemeGradient(theme.id)}`} />
            <div className="p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium text-foreground">{theme.name}</p>
                {formData.theme === theme.id && (
                  <Check className="w-5 h-5 text-accent" />
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Choose your blog URL</h2>
        <p className="text-muted-foreground">This is where your AI-generated blog will live</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="subdomain">Your Blog URL *</Label>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              searchfuel.app/
            </span>
            <Input
              id="subdomain"
              placeholder="your-company"
              value={formData.subdomain}
              onChange={(e) => updateField("subdomain", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Only lowercase letters, numbers, and hyphens. No spaces.
          </p>
        </div>
      </div>
    </div>
  );

  const getThemeGradient = (theme: string) => {
    switch (theme) {
      case "bold-gradient":
        return "bg-gradient-to-br from-blue-600 via-purple-600 to-red-500";
      case "clean-geometric":
        return "bg-gradient-to-br from-teal-600 to-orange-500";
      case "minimal-modern":
        return "bg-gradient-to-br from-amber-100 to-amber-50";
      case "vibrant-objects":
        return "bg-gradient-to-br from-purple-400 to-pink-400";
      default:
        return "bg-gradient-to-br from-gray-600 to-gray-400";
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="text-center mb-4">
            <p className="text-sm text-muted-foreground mb-2">SEARCHFUEL SETUP</p>
            <DialogTitle className="text-3xl font-bold">Create your AI SEO engine</DialogTitle>
          </div>
        </DialogHeader>

        {renderStepIndicator()}

        <div className="space-y-6">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
          {step === 5 && renderStep5()}

          <div className="flex gap-4 mt-6">
            {step > 1 ? (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                Back
              </Button>
            ) : (
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}

            {step < totalSteps ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canContinue()}
                className="flex-1"
              >
                Continue
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={!canContinue() || loading}
                className="flex-1"
              >
                {loading ? "Creating..." : "Claim My Blog URL"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
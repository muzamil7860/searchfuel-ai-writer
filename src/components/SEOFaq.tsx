import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What happens if my content doesn't rank well?",
    answer: "SearchFuel uses proven SEO best practices including keyword optimization, proper heading structure, internal linking, and meta descriptions. While we can't guarantee specific rankings (no one can), our content is designed to perform well in search engines. We also provide analytics to track performance and suggest improvements."
  },
  {
    question: "What if I don't have WordPress, can I still use your service?",
    answer: "Absolutely! SearchFuel integrates with WordPress, Ghost, HubSpot, Shopify, Webflow, and more. You can also export content in various formats (HTML, Markdown, or plain text) to use with any CMS. Our API allows custom integrations for enterprise clients."
  },
  {
    question: "Can I edit the AI-generated content before publishing?",
    answer: "Yes! Every article can be reviewed and edited before publishing. Our built-in editor lets you refine content, adjust keywords, add your brand voice, and make any changes needed. You have complete control over what gets published to your site."
  },
  {
    question: "How many articles can I generate per month?",
    answer: "Plans range from 50 articles/month for small businesses to unlimited for enterprise clients. All plans include keyword research, SEO optimization, and direct CMS publishing. Check our pricing page for details on which plan fits your content needs."
  },
  {
    question: "Do you guarantee page one rankings?",
    answer: "While no one can ethically guarantee specific rankings (search algorithms are complex and constantly changing), our content follows all SEO best practices and is optimized for maximum ranking potential. Most clients see significant traffic increases within 3-6 months of consistent publishing."
  },
  {
    question: "Can I use SearchFuel for multiple websites?",
    answer: "Yes! Our Pro and Enterprise plans support multiple domains. You can manage content for multiple client sites from one dashboard, making it perfect for agencies, marketing teams, and businesses with multiple web properties."
  }
];

export const SEOFaq = () => {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-12">
          FAQ
        </h2>
        
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-base md:text-lg font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-base text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

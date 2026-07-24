import { createFileRoute, Link } from "@tanstack/react-router";
import { MarketingNavbar } from "@/components/MarketingNavbar";
import { MarketingFooter } from "@/components/MarketingFooter";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0b0e0c] text-foreground font-sans relative overflow-x-hidden">
      <MarketingNavbar />
      
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none z-0 flex items-start justify-center">
        <div className="w-[80vw] h-[40vh] bg-primary/5 blur-[120px] rounded-full mt-[-10vh]" />
      </div>

      <main className="max-w-4xl mx-auto px-6 pt-40 pb-24 relative z-10">
        <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-4 tracking-tight">Privacy Policy</h1>
        <p className="text-muted-foreground mb-12 font-medium">Effective Date: {new Date().toLocaleDateString()}</p>
        
        <div className="prose prose-invert prose-emerald max-w-none text-white/80 space-y-6">
          <p>
            Your privacy is important to us. It is Capient's policy to respect your privacy regarding any information we may collect from you across our website and application.
          </p>

          <h3 className="text-2xl font-display font-bold text-white mt-12 mb-4">1. Information We Collect</h3>
          <p>
            We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent. We also let you know why we're collecting it and how it will be used.
          </p>
          <ul className="list-disc pl-6 space-y-2 marker:text-[#3DDC97]">
            <li><strong>Account Information:</strong> Name, email address, and authentication credentials.</li>
            <li><strong>Financial Data:</strong> Any financial data, budgets, invoices, and planner configurations you enter into our system.</li>
            <li><strong>Usage Data:</strong> We may log standard analytical data such as browser type, operating system, and page visits to improve our platform.</li>
          </ul>

          <h3 className="text-2xl font-display font-bold text-white mt-12 mb-4">2. Use of Information</h3>
          <p>
            We use the information we collect in various ways, including to:
          </p>
          <ul className="list-disc pl-6 space-y-2 marker:text-[#3DDC97]">
            <li>Provide, operate, and maintain our application.</li>
            <li>Improve, personalize, and expand our services.</li>
            <li>Understand and analyze how you use our platform.</li>
            <li>Develop new products, services, features, and functionality.</li>
            <li>Communicate with you regarding updates, support, and administrative messages.</li>
          </ul>

          <h3 className="text-2xl font-display font-bold text-white mt-12 mb-4">3. Data Retention and Security</h3>
          <p>
            We only retain collected information for as long as necessary to provide you with your requested service. What data we store, we'll protect within commercially acceptable means to prevent loss and theft, as well as unauthorized access, disclosure, copying, use or modification. 
          </p>
          <p>
            For a detailed breakdown of our security practices, please visit our <Link to="/security" className="text-[#3DDC97] hover:underline">Security Policy</Link>.
          </p>

          <h3 className="text-2xl font-display font-bold text-white mt-12 mb-4">4. Third-Party Access</h3>
          <p>
            We don't share any personally identifying information publicly or with third-parties, except when required to by law or to trusted service providers who assist us in operating our application (such as our secure hosting and database infrastructure).
          </p>

          <h3 className="text-2xl font-display font-bold text-white mt-12 mb-4">5. Contact Us</h3>
          <p>
            If you have any questions about how we handle user data and personal information, feel free to contact us.
          </p>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}

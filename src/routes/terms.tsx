import { createFileRoute, Link } from "@tanstack/react-router";
import { MarketingNavbar } from "@/components/MarketingNavbar";
import { MarketingFooter } from "@/components/MarketingFooter";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0b0e0c] text-foreground font-sans relative overflow-x-hidden">
      <MarketingNavbar />
      
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none z-0 flex items-start justify-center">
        <div className="w-[80vw] h-[40vh] bg-primary/5 blur-[120px] rounded-full mt-[-10vh]" />
      </div>

      <main className="max-w-4xl mx-auto px-6 pt-40 pb-24 relative z-10">
        <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-4 tracking-tight">Terms and Conditions</h1>
        <p className="text-muted-foreground mb-12 font-medium">Effective Date: {new Date().toLocaleDateString()}</p>
        
        <div className="prose prose-invert prose-emerald max-w-none text-white/80 space-y-6">
          <p>
            Welcome to Capient. By accessing our website and using our application, you agree to be bound by these Terms and Conditions and agree that you are responsible for compliance with any applicable local laws.
          </p>

          <h3 className="text-2xl font-display font-bold text-white mt-12 mb-4">1. Use License</h3>
          <p>
            Permission is granted to temporarily download one copy of the materials (information or software) on Capient's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
          </p>
          <ul className="list-disc pl-6 space-y-2 marker:text-[#3DDC97]">
            <li>Modify or copy the materials;</li>
            <li>Use the materials for any commercial purpose, or for any public display;</li>
            <li>Attempt to decompile or reverse engineer any software contained on Capient's website;</li>
            <li>Remove any copyright or other proprietary notations from the materials; or</li>
            <li>Transfer the materials to another person or "mirror" the materials on any other server.</li>
          </ul>

          <h3 className="text-2xl font-display font-bold text-white mt-12 mb-4">2. Disclaimer</h3>
          <p>
            The materials on Capient's website are provided on an 'as is' basis. Capient makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
          </p>
          <p>
            Furthermore, Capient is a financial planning and organization tool. It is <strong>not</strong> financial or legal advice. Users are solely responsible for their financial decisions.
          </p>

          <h3 className="text-2xl font-display font-bold text-white mt-12 mb-4">3. Limitations</h3>
          <p>
            In no event shall Capient or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Capient's website, even if Capient or a Capient authorized representative has been notified orally or in writing of the possibility of such damage.
          </p>

          <h3 className="text-2xl font-display font-bold text-white mt-12 mb-4">4. Revisions and Errata</h3>
          <p>
            The materials appearing on Capient's website could include technical, typographical, or photographic errors. Capient does not warrant that any of the materials on its website are accurate, complete or current. Capient may make changes to the materials contained on its website at any time without notice.
          </p>

          <h3 className="text-2xl font-display font-bold text-white mt-12 mb-4">5. Governing Law</h3>
          <p>
            These terms and conditions are governed by and construed in accordance with the laws, and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
          </p>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}

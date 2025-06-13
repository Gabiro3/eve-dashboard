import { PublicHeader } from "@/components/public/public-header"
import { PublicFooter } from "@/components/public/public-footer"
import { TermsContent } from "@/components/public/terms-content"

export const metadata = {
  title: "Terms of Service | Eve Health",
  description: "Terms and conditions for using Eve Health services and platform.",
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />
      <TermsContent />
      <PublicFooter />
    </div>
  )
}

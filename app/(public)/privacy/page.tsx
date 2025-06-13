import { PublicHeader } from "@/components/public/public-header"
import { PublicFooter } from "@/components/public/public-footer"
import { PrivacyContent } from "@/components/public/privacy-content"

export const metadata = {
  title: "Privacy Policy | Eve Health",
  description: "Learn how Eve Health collects, uses, and protects your personal information.",
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />
      <PrivacyContent />
      <PublicFooter />
    </div>
  )
}

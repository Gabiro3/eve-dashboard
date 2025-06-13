import { PublicHeader } from "@/components/public/public-header"
import { PublicFooter } from "@/components/public/public-footer"
import { ContactContent } from "@/components/public/contact-content"

export const metadata = {
  title: "Contact Us | Eve Health - Get in Touch",
  description:
    "Contact Eve Health for questions, partnerships, or support. Find our contact information and links to our policies.",
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />
      <ContactContent />
      <PublicFooter />
    </div>
  )
}

import { PublicHeader } from "@/components/public/public-header"
import { PublicFooter } from "@/components/public/public-footer"
import { AboutContent } from "@/components/public/about-content"

export const metadata = {
  title: "About Us | Eve Health - Empowering Women's Health",
  description:
    "Learn about Eve Health's mission to empower women with trusted health information and expert guidance for every stage of life.",
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />
      <AboutContent />
      <PublicFooter />
    </div>
  )
}

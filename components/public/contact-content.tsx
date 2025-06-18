import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, MapPin, Clock, MessageCircle, FileText, Shield, Megaphone, ExternalLink } from "lucide-react"
import { AdvertiseDialog } from "@/components/public/advertise-dialog"

export function ContactContent() {
  const contactMethods = [
    {
      icon: <Mail className="h-6 w-6 text-pink-500" />,
      title: "Email Us",
      description: "General inquiries and support",
      contact: "hello@evehealth.app",
      action: "mailto:hello@evehealth.app",
    },
    {
      icon: <Phone className="h-6 w-6 text-blue-500" />,
      title: "Call Us",
      description: "Speak with our support team",
      contact: "+250 781 255 340",
      action: "tel:+250781255340",
    },
    {
      icon: <MessageCircle className="h-6 w-6 text-green-500" />,
      title: "Live Chat",
      description: "Available Monday-Friday, 9AM-5PM EST",
      contact: "Start Chat",
      action: "#",
    },
  ]

  const departments = [
    {
      title: "Editorial Team",
      email: "editorial@evehealth.app",
      description: "Content suggestions, expert contributions, medical reviews",
    },
    {
      title: "Partnerships",
      email: "partnerships@evehealth.app",
      description: "Business partnerships, collaborations, sponsorships",
    },
    {
      title: "Technical Support",
      email: "support@evehealth.app",
      description: "Website issues, app problems, account assistance",
    },
    {
      title: "Media Inquiries",
      email: "media@evehealth.app",
      description: "Press releases, interviews, media kits",
    },
  ]

  const legalPages = [
    {
      title: "Terms of Service",
      description: "Our terms and conditions for using Eve Health services",
      href: "/terms",
      icon: <FileText className="h-5 w-5 text-blue-500" />,
    },
    {
      title: "Privacy Policy",
      description: "How we collect, use, and protect your personal information",
      href: "/privacy",
      icon: <Shield className="h-5 w-5 text-green-500" />,
    },
    {
      title: "Cookie Policy",
      description: "Information about cookies and tracking technologies we use",
      href: "/cookies",
      icon: <FileText className="h-5 w-5 text-purple-500" />,
    },
  ]

  return (
    <main className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <Badge variant="secondary" className="mb-4">
          Contact Us
        </Badge>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Get in Touch</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Have questions, suggestions, or need support? We're here to help. Reach out to us through any of the channels
          below.
        </p>
      </div>

      {/* Contact Methods */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {contactMethods.map((method, index) => (
          <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-4">{method.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{method.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{method.description}</p>
              <Button asChild variant="outline" className="w-full">
                <a href={method.action}>{method.contact}</a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Office Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-pink-500" />
              Our Office
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Eve Health Headquarters</h4>
                <p className="text-gray-600">
                  1 KN 78 St, Kigali
                  <br />
                  Rwanda
                  <br />
                </p>
              </div>

              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="h-4 w-4" />
                <span className="text-sm">Monday - Friday: 9:00 AM - 6:00 PM EST</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <AdvertiseDialog>
              <Button variant="outline" className="w-full justify-start">
                <Megaphone className="h-4 w-4 mr-2" />
                Advertise With Us
              </Button>
            </AdvertiseDialog>

            <Button asChild variant="outline" className="w-full justify-start">
              <a href="/articles">
                <FileText className="h-4 w-4 mr-2" />
                Browse Articles
              </a>
            </Button>

            <Button asChild variant="outline" className="w-full justify-start">
              <a href="mailto:careers@evehealth.app">
                <Mail className="h-4 w-4 mr-2" />
                Career Opportunities
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Department Contacts */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Department Contacts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {departments.map((dept, index) => (
            <Card key={index} className="border-0 shadow-sm">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">{dept.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{dept.description}</p>
                <Button asChild variant="outline" size="sm">
                  <a href={`mailto:${dept.email}`} className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {dept.email}
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Legal Pages */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Legal & Policies</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {legalPages.map((page, index) => (
            <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  {page.icon}
                  <h3 className="font-semibold text-gray-900">{page.title}</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4">{page.description}</p>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href={page.href} className="flex items-center gap-2">
                    Read More
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-pink-50 to-purple-50">
        <CardContent className="p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          <p className="text-gray-600 mb-6">
            Looking for quick answers? Check out our FAQ section for common questions about Eve Health, our content, and
            how to use our platform.
          </p>
          <Button asChild>
            <Link href="/faq">View FAQ</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}

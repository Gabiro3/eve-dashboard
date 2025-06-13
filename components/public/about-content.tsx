import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { CheckCircle, Heart, Users, Globe, Stethoscope } from "lucide-react"

export function AboutContent() {
  const timeline = [
    {
      year: "2020",
      title: "The Beginning",
      description:
        "Eve Health was founded with a simple mission: to provide women with accessible, expert-reviewed health information.",
      icon: "🌱",
    },
    {
      year: "2021",
      title: "Expert Network",
      description:
        "We assembled a team of certified doctors, nutritionists, and health experts to ensure content accuracy.",
      icon: "👩‍⚕️",
    },
    {
      year: "2022",
      title: "Community Growth",
      description: "Reached 100,000 monthly readers and launched our mobile app for better accessibility.",
      icon: "📱",
    },
    {
      year: "2023",
      title: "Global Expansion",
      description: "Expanded our content to serve women in multiple countries with localized health information.",
      icon: "🌍",
    },
    {
      year: "2024",
      title: "Innovation & Impact",
      description: "Launched AI-powered health insights and reached over 1 million women worldwide.",
      icon: "🚀",
    },
  ]

  const values = [
    {
      icon: <Heart className="h-6 w-6 text-pink-500" />,
      title: "Compassionate Care",
      description: "We approach every topic with empathy and understanding of women's unique health journeys.",
    },
    {
      icon: <CheckCircle className="h-6 w-6 text-green-500" />,
      title: "Evidence-Based",
      description: "All our content is reviewed by medical professionals and backed by scientific research.",
    },
    {
      icon: <Users className="h-6 w-6 text-blue-500" />,
      title: "Community-Focused",
      description: "We believe in the power of community and shared experiences in health and wellness.",
    },
    {
      icon: <Globe className="h-6 w-6 text-purple-500" />,
      title: "Accessible to All",
      description: "Health information should be available to every woman, regardless of background or location.",
    },
  ]

  const stats = [
    { number: "1M+", label: "Women Served" },
    { number: "500+", label: "Expert Articles" },
    { number: "50+", label: "Health Experts" },
    { number: "25+", label: "Countries Reached" },
  ]

  return (
    <main className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <Badge variant="secondary" className="mb-4">
          About Eve Health
        </Badge>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Empowering Women Through
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
            {" "}
            Health Knowledge
          </span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          At Eve Health, we believe every woman deserves access to trusted, expert-reviewed health information. Our
          mission is to empower women with the knowledge they need to make informed decisions about their health and
          wellness.
        </p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
        {stats.map((stat, index) => (
          <div key={index} className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-pink-500 mb-2">{stat.number}</div>
            <div className="text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Mission Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            We're on a mission to bridge the gap in women's health information. Too often, women struggle to find
            reliable, comprehensive health resources that speak to their unique needs and experiences.
          </p>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Eve Health was created to change that. We provide evidence-based, expert-reviewed content covering
            everything from reproductive health to mental wellness, nutrition, and lifestyle topics that matter to
            women.
          </p>
          <div className="flex items-center gap-2 text-pink-600">
            <Stethoscope className="h-5 w-5" />
            <span className="font-semibold">Trusted by healthcare professionals worldwide</span>
          </div>
        </div>
        <div className="relative">
          <div className="aspect-square bg-gradient-to-br from-pink-100 to-purple-100 rounded-2xl flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="Eve Health"
              layout="fill"
              objectFit="cover"
              className="rounded-xl"
            />
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            These core values guide everything we do at Eve Health, from the content we create to the community we
            build.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {values.map((value, index) => (
            <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">{value.icon}</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{value.title}</h3>
                    <p className="text-gray-600">{value.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Timeline Section */}
      <div className="mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Journey</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            From a small startup to a trusted health resource for millions of women worldwide.
          </p>
        </div>

        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-pink-500 to-purple-600 transform md:-translate-x-1/2"></div>

          <div className="space-y-12">
            {timeline.map((item, index) => (
              <div
                key={index}
                className={`relative flex items-center ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
              >
                {/* Timeline Dot */}
                <div className="absolute left-8 md:left-1/2 w-4 h-4 bg-white border-4 border-pink-500 rounded-full transform md:-translate-x-1/2 z-10"></div>

                {/* Content */}
                <div className={`flex-1 ml-16 md:ml-0 ${index % 2 === 0 ? "md:pr-8" : "md:pl-8"}`}>
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">{item.icon}</span>
                        <Badge variant="outline">{item.year}</Badge>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                      <p className="text-gray-600">{item.description}</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Meet Our Expert Team</h2>
        <p className="text-gray-600 max-w-2xl mx-auto mb-8">
          Our content is created and reviewed by a diverse team of healthcare professionals, researchers, and wellness
          experts who are passionate about women's health.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: "Dr. Sarah Johnson",
              role: "Chief Medical Officer",
              specialty: "Women's Health & Reproductive Medicine",
              image: "/placeholder.svg?height=200&width=200",
            },
            {
              name: "Dr. Maria Rodriguez",
              role: "Nutrition Expert",
              specialty: "Clinical Nutrition & Wellness",
              image: "/placeholder.svg?height=200&width=200",
            },
            {
              name: "Dr. Emily Chen",
              role: "Mental Health Specialist",
              specialty: "Psychology & Women's Mental Health",
              image: "/placeholder.svg?height=200&width=200",
            },
          ].map((member, index) => (
            <Card key={index} className="border-0 shadow-sm">
              <CardContent className="p-6 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-3xl">👩‍⚕️</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-pink-600 text-sm mb-2">{member.role}</p>
                <p className="text-gray-600 text-sm">{member.specialty}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl p-12 text-white">
        <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
        <p className="text-xl mb-6 opacity-90">
          Be part of a community that's changing how women access and understand health information.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#"
            className="bg-white text-pink-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Download Our App
          </a>
          <a
            href="/articles"
            className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-pink-600 transition-colors"
          >
            Explore Articles
          </a>
        </div>
      </div>
    </main>
  )
}

"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, Users, TrendingUp, Target, Globe, ExternalLink } from "lucide-react"

interface AdvertiseDialogProps {
  children: React.ReactNode
}

export function AdvertiseDialog({ children }: AdvertiseDialogProps) {
  const [open, setOpen] = useState(false)

  const stats = [
    { icon: <Users className="h-5 w-5" />, label: "Monthly Visitors", value: "1M+" },
    { icon: <Globe className="h-5 w-5" />, label: "Countries", value: "25+" },
    { icon: <TrendingUp className="h-5 w-5" />, label: "Growth Rate", value: "40%" },
    { icon: <Target className="h-5 w-5" />, label: "Engagement", value: "85%" },
  ]

  const adFormats = [
    {
      title: "Banner Ads",
      description: "Display ads in header, sidebar, or content areas",
      sizes: ["728x90", "300x250", "320x50"],
      price: "Starting at $500/month",
    },
    {
      title: "Sponsored Content",
      description: "Native articles written by our editorial team",
      sizes: ["Full article", "Product reviews"],
      price: "Starting at $2,000/article",
    },
    {
      title: "Newsletter Sponsorship",
      description: "Featured placement in our weekly newsletter",
      sizes: ["Header banner", "Dedicated section"],
      price: "Starting at $1,000/edition",
    },
  ]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Advertise With Eve Health</DialogTitle>
          <DialogDescription>Reach over 1 million women interested in health and wellness content</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Audience Stats */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Our Audience</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <Card key={index} className="border-0 bg-gradient-to-br from-pink-50 to-purple-50">
                  <CardContent className="p-4 text-center">
                    <div className="flex justify-center mb-2 text-pink-500">{stat.icon}</div>
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Audience Demographics */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Audience Demographics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Age Groups</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>18-24: 15%</li>
                    <li>25-34: 35%</li>
                    <li>35-44: 30%</li>
                    <li>45+: 20%</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Interests</h4>
                  <div className="flex flex-wrap gap-1">
                    {["Health", "Wellness", "Nutrition", "Fitness", "Mental Health"].map((interest) => (
                      <Badge key={interest} variant="secondary" className="text-xs">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Education</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>College+: 75%</li>
                    <li>Graduate: 40%</li>
                    <li>Professional: 25%</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ad Formats */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Advertising Options</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {adFormats.map((format, index) => (
                <Card key={index} className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base">{format.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3">{format.description}</p>
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-gray-700 mb-1">Available Sizes:</p>
                      <div className="flex flex-wrap gap-1">
                        {format.sizes.map((size) => (
                          <Badge key={size} variant="outline" className="text-xs">
                            {size}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-pink-600">{format.price}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Contact Information */}
          <Card className="border-0 bg-gradient-to-r from-pink-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Ready to Get Started?</h3>
              <p className="mb-6 opacity-90">
                Contact our advertising team to discuss your campaign goals and get a custom quote.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5" />
                    <div>
                      <p className="font-semibold">Email</p>
                      <p className="text-sm opacity-90">advertising@evehealth.com</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5" />
                    <div>
                      <p className="font-semibold">Phone</p>
                      <p className="text-sm opacity-90">+1 (555) 123-4567</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button asChild variant="secondary" className="w-full bg-white text-pink-600 hover:bg-gray-100">
                    <a href="mailto:advertising@evehealth.com?subject=Advertising Inquiry">
                      <Mail className="h-4 w-4 mr-2" />
                      Send Email
                    </a>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    className="w-full border-white text-white hover:bg-white hover:text-pink-600"
                  >
                    <a href="/media-kit.pdf" target="_blank" rel="noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Download Media Kit
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <div className="text-center text-sm text-gray-600">
            <p>
              All advertising content must comply with our editorial guidelines and be relevant to our audience. We
              reserve the right to reject any advertising that doesn't meet our standards.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

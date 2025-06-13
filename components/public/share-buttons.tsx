"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Share2, Copy, Facebook, Twitter, Linkedin, MessageCircle, Instagram } from "lucide-react"

interface ShareButtonsProps {
  url: string
  title: string
}

export function ShareButtons({ url, title }: ShareButtonsProps) {
  const [isSharing, setIsSharing] = useState(false)
  const { toast } = useToast()

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url)
      toast({
        title: "Link copied!",
        description: "Article URL has been copied to your clipboard.",
      })
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please try again or copy the URL manually.",
        variant: "destructive",
      })
    }
  }

  const shareOnSocial = (platform: string) => {
    const encodedUrl = encodeURIComponent(url)
    const encodedTitle = encodeURIComponent(title)

    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      instagram: `https://www.instagram.com/yourProfileName`,
    }

    window.open(shareUrls[platform as keyof typeof shareUrls], "_blank", "width=600,height=400")
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      setIsSharing(true)
      try {
        await navigator.share({
          title,
          url,
        })
      } catch (error) {
        // User cancelled sharing
      } finally {
        setIsSharing(false)
      }
    }
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Share this article</h3>

      <div className="flex flex-wrap gap-3">
        {/* Native Share (if supported) */}

        {/* Copy Link */}
        <Button onClick={copyToClipboard} variant="outline" className="flex items-center gap-2">
          <Copy className="h-4 w-4" />
          Copy Link
        </Button>

        {/* Social Media Buttons */}
        <Button
          onClick={() => shareOnSocial("facebook")}
          variant="outline"
          className="flex items-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
        >
          <Facebook className="h-4 w-4" />
          Facebook
        </Button>

        <Button
          onClick={() => shareOnSocial("twitter")}
          variant="outline"
          className="flex items-center gap-2 text-sky-600 border-sky-200 hover:bg-sky-50"
        >
          <Twitter className="h-4 w-4" />
          Twitter
        </Button>

        <Button
          onClick={() => shareOnSocial("linkedin")}
          variant="outline"
          className="flex items-center gap-2 text-blue-700 border-blue-200 hover:bg-blue-50"
        >
          <Linkedin className="h-4 w-4" />
          LinkedIn
        </Button>

        <Button
          onClick={() => shareOnSocial("whatsapp")}
          variant="outline"
          className="flex items-center gap-2 text-green-600 border-green-200 hover:bg-green-50"
        >
          <MessageCircle className="h-4 w-4" />
          WhatsApp
        </Button>
        <Button
  onClick={() => shareOnSocial("instagram")}
  variant="outline"
  className="flex items-center gap-2 text-[#fc055c] border-[#fc055c] hover:bg-[#fc055c]/10"
>
  <Instagram className="h-4 w-4" />
  Instagram
</Button>

      </div>
    </div>
  )
}

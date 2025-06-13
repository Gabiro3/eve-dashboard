import { Button } from "@/components/ui/button"
import { Smartphone, ExternalLink } from "lucide-react"

export function AppPromoBanner() {
  return (
    <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl p-8 text-white">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
            <Smartphone className="h-8 w-8" />
            <h2 className="text-3xl font-bold">Try the Eve Health Mobile App</h2>
          </div>

          <p className="text-lg mb-6 opacity-90">
            Explore our new beta mobile experience with features focused on reproductive health and wellness.
            For the best experience, open this on your mobile device.
          </p>

          <div className="flex justify-center md:justify-start">
            <a
              href="https://eve-health-c003c.web.app"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="bg-white text-pink-600 hover:bg-gray-100 flex items-center gap-2 px-6 py-3 font-semibold">
                <ExternalLink className="h-5 w-5" />
                Open Mobile App
              </Button>
            </a>
          </div>
        </div>

        <div className="hidden lg:block">
          <div className="w-48 h-48 bg-white/10 rounded-2xl flex items-center justify-center">
            <Smartphone className="h-24 w-24 text-white/80" />
          </div>
        </div>
      </div>
    </div>
  )
}


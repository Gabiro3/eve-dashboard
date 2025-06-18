import { socialLinks } from "@/lib/constants"
import Link from "next/link"
import Image from "next/image"

export function PublicFooter() {
  const currentYear = new Date().getFullYear()
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-lg overflow-hidden relative">
                            <Image
                              src="/logo.png"
                              alt="Eve Health Logo"
                              fill
                              className="object-contain"
                              priority
                            />
                          </div>
              <span className="font-bold text-xl">Eve Health</span>
            </div>
            <p className="text-gray-400 text-sm">
              Empowering women with trusted health information and expert guidance for every stage of life.
            </p>
            <div className="hidden lg:flex items-center space-x-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-pink-600 transition-colors"
                  title={social.name}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/articles" className="text-gray-400 hover:text-white transition-colors">
                  Health Articles
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-gray-400 hover:text-white transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Health Topics */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Health Topics</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/?category=womens-health" className="text-gray-400 hover:text-white transition-colors">
                  Women's Health
                </Link>
              </li>
              <li>
                <Link href="/?category=nutrition" className="text-gray-400 hover:text-white transition-colors">
                  Nutrition
                </Link>
              </li>
              <li>
                <Link href="/?category=mental-health" className="text-gray-400 hover:text-white transition-colors">
                  Mental Health
                </Link>
              </li>
              <li>
                <Link href="/?category=fitness" className="text-gray-400 hover:text-white transition-colors">
                  Fitness
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Get in Touch</h3>
            <div className="space-y-2 text-sm text-gray-400">
              <p>📧 hello@evehealth.app</p>
              <p>📞 +250 781 255 340</p>
              <p>📍 1 KN 78 St, Kigali, Rwanda</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">© {currentYear} Eve Health. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
              Terms of Service
            </Link>
            <Link href="/cookies" className="text-gray-400 hover:text-white text-sm transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

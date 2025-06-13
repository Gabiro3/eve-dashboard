"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Menu, Search, X, User, Facebook, Twitter, Instagram, Linkedin } from "lucide-react"
import { socialLinks } from "@/lib/constants"

export function PublicHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-lg overflow-hidden relative">
              <Image
                src="/logo.png"
                alt="Eve Health Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="font-bold text-xl text-gray-900">Eve Health</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-pink-600 transition-colors">
              Home
            </Link>
            <Link href="/articles" className="text-gray-700 hover:text-pink-600 transition-colors">
              Articles
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-pink-600 transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-pink-600 transition-colors">
              Contact
            </Link>
          </nav>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Social Links - Desktop */}
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


            {/* Admin Login */}
            <Link href="/login">
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <User className="h-4 w-4 mr-2" />
                Admin
              </Button>
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        {isSearchOpen && (
          <div className="py-4 border-t">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input placeholder="Search articles..." className="pl-10" autoFocus />
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t py-4">
            <nav className="flex flex-col space-y-4">
              <Link href="/" className="text-gray-700 hover:text-pink-600 transition-colors">
                Home
              </Link>
              <Link href="/articles" className="text-gray-700 hover:text-pink-600 transition-colors">
                Articles
              </Link>
              <Link href="/categories" className="text-gray-700 hover:text-pink-600 transition-colors">
                Categories
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-pink-600 transition-colors">
                About
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-pink-600 transition-colors">
                Contact
              </Link>
              <Link href="/login" className="text-gray-700 hover:text-pink-600 transition-colors">
                Admin Login
              </Link>
            </nav>

            {/* Mobile Social Links */}
            <div className="flex items-center space-x-4 mt-4 pt-4 border-t">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-pink-600 transition-colors"
                  title={social.name}
                >
                  <span><social.icon /></span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

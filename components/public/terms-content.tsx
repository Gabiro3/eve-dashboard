import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

export function TermsContent() {
  const lastUpdated = "June 6, 2025"

  return (
    <main className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-8">
        <Badge variant="secondary" className="mb-4">
          Legal
        </Badge>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
        <p className="text-gray-600">Last updated: {lastUpdated}</p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-8 prose prose-gray max-w-none">
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-600 leading-relaxed">
                By accessing and using Eve Health's website, mobile application, and related services (collectively, the
                "Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not
                agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Eve Health provides health and wellness information, articles, and resources specifically focused on
                women's health. Our services include:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Access to health articles and educational content</li>
                <li>Expert-reviewed medical information</li>
                <li>Wellness tips and lifestyle guidance</li>
                <li>Community features and user interactions</li>
                <li>Mobile application access</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Medical Disclaimer</h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-yellow-800 font-semibold mb-2">Important Medical Disclaimer</p>
                <p className="text-yellow-700 text-sm">
                  The information provided on Eve Health is for educational and informational purposes only and is not
                  intended as medical advice, diagnosis, or treatment.
                </p>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Always seek the advice of your physician or other qualified health provider with any questions you may
                have regarding a medical condition. Never disregard professional medical advice or delay in seeking it
                because of something you have read on Eve Health. If you think you may have a medical emergency, call
                your doctor or emergency services immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. User Accounts and Registration</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                To access certain features of our Service, you may be required to create an account. When creating an
                account, you agree to:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and promptly update your account information</li>
                <li>Maintain the security of your password and account</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. User Conduct</h2>
              <p className="text-gray-600 leading-relaxed mb-4">You agree not to use the Service to:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Violate any applicable laws or regulations</li>
                <li>Transmit harmful, threatening, abusive, or defamatory content</li>
                <li>Impersonate any person or entity</li>
                <li>Distribute spam, viruses, or other malicious code</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with or disrupt the Service</li>
                <li>Collect personal information about other users</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Content and Intellectual Property</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                All content on Eve Health, including but not limited to text, graphics, logos, images, and software, is
                the property of Eve Health or its content suppliers and is protected by copyright and other intellectual
                property laws.
              </p>
              <p className="text-gray-600 leading-relaxed">
                You may not reproduce, distribute, modify, or create derivative works of our content without explicit
                written permission from Eve Health.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. User-Generated Content</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                By submitting content to our Service (comments, reviews, etc.), you grant Eve Health a non-exclusive,
                royalty-free, perpetual, and worldwide license to use, modify, publicly perform, publicly display,
                reproduce, and distribute such content.
              </p>
              <p className="text-gray-600 leading-relaxed">
                You represent and warrant that you own or have the necessary rights to grant this license and that your
                content does not violate any third-party rights or applicable laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Privacy Policy</h2>
              <p className="text-gray-600 leading-relaxed">
                Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the
                Service, to understand our practices regarding the collection and use of your personal information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Disclaimers and Limitation of Liability</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR
                IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
                PURPOSE, OR NON-INFRINGEMENT.
              </p>
              <p className="text-gray-600 leading-relaxed">
                IN NO EVENT SHALL EVE HEALTH BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE
                DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Indemnification</h2>
              <p className="text-gray-600 leading-relaxed">
                You agree to defend, indemnify, and hold harmless Eve Health and its officers, directors, employees, and
                agents from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or
                fees arising out of or relating to your violation of these Terms or your use of the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Termination</h2>
              <p className="text-gray-600 leading-relaxed">
                We may terminate or suspend your account and bar access to the Service immediately, without prior notice
                or liability, under our sole discretion, for any reason whatsoever, including without limitation if you
                breach the Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Governing Law</h2>
              <p className="text-gray-600 leading-relaxed">
                These Terms shall be interpreted and governed by the laws of the State of New York, without regard to
                conflict of law provisions. Any disputes arising under these Terms shall be subject to the exclusive
                jurisdiction of the courts located in New York, New York.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Changes to Terms</h2>
              <p className="text-gray-600 leading-relaxed">
                We reserve the right to modify or replace these Terms at any time. If a revision is material, we will
                provide at least 30 days notice prior to any new terms taking effect. What constitutes a material change
                will be determined at our sole discretion.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Contact Information</h2>
              <p className="text-gray-600 leading-relaxed">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mt-4">
                <p className="text-gray-700">
                  <strong>Eve Health</strong>
                  <br />
                  123 Health Street
                  <br />
                  New York, NY 10001
                  <br />
                  Email: legal@evehealth.com
                  <br />
                  Phone: +1 (555) 123-4567
                </p>
              </div>
            </section>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}

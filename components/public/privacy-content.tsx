import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

export function PrivacyContent() {
  const lastUpdated = "June 6, 2025"

  return (
    <main className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-8">
        <Badge variant="secondary" className="mb-4">
          Legal
        </Badge>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
        <p className="text-gray-600">Last updated: {lastUpdated}</p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-8 prose prose-gray max-w-none">
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-600 leading-relaxed">
                At Eve Health, we are committed to protecting your privacy and ensuring the security of your personal
                information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information
                when you visit our website, use our mobile application, or engage with our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">Personal Information</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                We may collect personal information that you voluntarily provide to us when you:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                <li>Create an account or register for our services</li>
                <li>Subscribe to our newsletter</li>
                <li>Contact us with questions or feedback</li>
                <li>Participate in surveys or promotions</li>
                <li>Comment on articles or engage with our content</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">Automatically Collected Information</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                When you visit our website or use our app, we automatically collect certain information, including:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>IP address and location data</li>
                <li>Browser type and version</li>
                <li>Device information and operating system</li>
                <li>Pages visited and time spent on our site</li>
                <li>Referring website or source</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We use the information we collect for various purposes, including:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Providing and maintaining our services</li>
                <li>Personalizing your experience and content recommendations</li>
                <li>Sending you newsletters and updates (with your consent)</li>
                <li>Responding to your comments, questions, and requests</li>
                <li>Analyzing usage patterns to improve our services</li>
                <li>Detecting and preventing fraud or security issues</li>
                <li>Complying with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Information Sharing and Disclosure</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We do not sell, trade, or rent your personal information to third parties. We may share your information
                in the following circumstances:
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">Service Providers</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                We may share your information with trusted third-party service providers who assist us in operating our
                website, conducting our business, or serving our users, provided they agree to keep this information
                confidential.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">Legal Requirements</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                We may disclose your information if required to do so by law or in response to valid requests by public
                authorities.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">Business Transfers</h3>
              <p className="text-gray-600 leading-relaxed">
                In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of
                that transaction.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Cookies and Tracking Technologies</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We use cookies and similar tracking technologies to enhance your experience on our website. Cookies are
                small data files stored on your device that help us:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                <li>Remember your preferences and settings</li>
                <li>Analyze website traffic and usage patterns</li>
                <li>Provide personalized content and advertisements</li>
                <li>Improve our website functionality</li>
              </ul>
              <p className="text-gray-600 leading-relaxed">
                You can control cookie settings through your browser preferences. However, disabling cookies may affect
                the functionality of our website.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Security</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We implement appropriate technical and organizational security measures to protect your personal
                information against unauthorized access, alteration, disclosure, or destruction. These measures include:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security assessments and updates</li>
                <li>Access controls and authentication measures</li>
                <li>Employee training on data protection</li>
                <li>Secure hosting and infrastructure</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Your Rights and Choices</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Depending on your location, you may have certain rights regarding your personal information:
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">Access and Portability</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                You have the right to request access to the personal information we hold about you and to receive a copy
                of this information.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">Correction and Updates</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                You can update your account information at any time or request that we correct inaccurate information.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">Deletion</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                You may request that we delete your personal information, subject to certain legal obligations.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">Marketing Communications</h3>
              <p className="text-gray-600 leading-relaxed">
                You can opt out of receiving marketing communications from us at any time by clicking the unsubscribe
                link in our emails or contacting us directly.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Children's Privacy</h2>
              <p className="text-gray-600 leading-relaxed">
                Our services are not intended for children under the age of 13. We do not knowingly collect personal
                information from children under 13. If you are a parent or guardian and believe your child has provided
                us with personal information, please contact us so we can delete such information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. International Data Transfers</h2>
              <p className="text-gray-600 leading-relaxed">
                Your information may be transferred to and processed in countries other than your own. We ensure that
                such transfers are conducted in accordance with applicable data protection laws and that appropriate
                safeguards are in place to protect your information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Changes to This Privacy Policy</h2>
              <p className="text-gray-600 leading-relaxed">
                We may update this Privacy Policy from time to time to reflect changes in our practices or applicable
                laws. We will notify you of any material changes by posting the new Privacy Policy on our website and
                updating the "Last Updated" date. We encourage you to review this Privacy Policy periodically.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Contact Us</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                If you have any questions about this Privacy Policy or our privacy practices, please contact us:
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700">
                  <strong>Eve Health Privacy Team</strong>
                  <br />
                  123 Health Street
                  <br />
                  New York, NY 10001
                  <br />
                  Email: privacy@evehealth.com
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

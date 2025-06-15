import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

export function TermsContent() {
  const lastUpdated = "June 15, 2025"

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
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Our Commitment</h2>
              <p className="text-gray-600 leading-relaxed">
                Eve Health is dedicated to improving the health and well-being of women and girls in Rwanda. Our
                platform provides access to vital health information and resources. By using our services, you agree to
                these terms, which are designed to protect you and ensure a safe and respectful community.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We collect limited personal information to provide and improve our services. This includes:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>
                  <b>Anonymous Usernames:</b> To protect your privacy, we use anonymous usernames and unique ID numbers.
                </li>
                <li>
                  <b>Usage Data:</b> We collect data on how you use the platform to understand what content is most
                  helpful and how we can improve.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Community Guidelines</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We are committed to maintaining a respectful and supportive community. You agree not to:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Post harmful, threatening, or abusive content.</li>
                <li>Impersonate others.</li>
                <li>Distribute spam or malicious code.</li>
                <li>Violate any applicable laws or regulations.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Sharing</h2>
              <p className="text-gray-600 leading-relaxed">
                To support public health initiatives, we may share anonymized, aggregated data with:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Ministry of Health Rwanda</li>
                <li>Reputable NGOs working to improve women's health in Rwanda</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-4">
                We will never share your personal information without your explicit consent.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Your Rights</h2>
              <p className="text-gray-600 leading-relaxed mb-4">You have the right to:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Use the platform anonymously.</li>
                <li>Request deletion of your data.</li>
                <li>Contact us with any questions or concerns.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Age Restrictions</h2>
              <p className="text-gray-600 leading-relaxed">
                You must be at least <strong>13 years old</strong> to use Eve Health. If you are under 18, please get permission from a
                parent or guardian before using our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Contact Information</h2>
              <p className="text-gray-600 leading-relaxed">If you have any questions or concerns, please contact us:</p>
              <div className="bg-gray-50 rounded-lg p-4 mt-4">
                <p className="text-gray-700">
                  <strong>Eve Health Support</strong>
                  <br />
                  Email: support@evehealth.app
                  <br />
                  Phone: +250-790-706-492
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Legal Basis</h2>
              <p className="text-gray-600 leading-relaxed">
                These terms are governed by the data protection principles of Rwanda. We are committed to protecting
                your privacy and complying with all applicable laws and regulations.
              </p>
            </section>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

export function PrivacyContent() {
  const lastUpdated = "June 15, 2025"

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
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Commitment</h2>
              <p className="text-gray-600 leading-relaxed">
                At Eve Health, we are dedicated to protecting the privacy of our users in Rwanda. This Privacy Policy
                explains how we handle your data when you use our platform, ensuring transparency and security in
                accordance with Rwanda's data protection principles.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Information We Collect</h2>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">Anonymous Information</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                To improve our services and user experience, we collect the following anonymous information:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                <li>Usernames</li>
                <li>Age range</li>
                <li>Chat messages (anonymized)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">Optional Personal Information</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                You may choose to provide the following personal information for enhanced support and communication:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Email address</li>
                <li>Phone number</li>
                <li>Feedback and support requests</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">Health-Related Inputs</h3>
              <p className="text-gray-600 leading-relaxed mb-4">To provide personalized health insights, we collect:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Menstrual cycle data</li>
                <li>Wellness check-in information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Use Your Information</h2>
              <p className="text-gray-600 leading-relaxed mb-4">We use the collected information to:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Personalize your experience and provide relevant health insights</li>
                <li>Improve our platform and services</li>
                <li>Respond to your inquiries and support requests</li>
                <li>Conduct research to enhance women's health in Rwanda</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Sharing Your Data</h2>
              <p className="text-gray-600 leading-relaxed mb-4">We may share anonymized and aggregated data with:</p>

              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Ministry of Health Rwanda for public health initiatives</li>
                <li>Partner NGOs to support women's health programs</li>
              </ul>

              <p className="text-gray-600 leading-relaxed mb-4">
                We ensure that any shared data is anonymized and does not identify individual users.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Rights</h2>
              <p className="text-gray-600 leading-relaxed mb-4">You have the right to:</p>

              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Use our platform anonymously</li>
                <li>Request deletion of your data, subject to legal requirements</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Protection & Storage</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We implement robust security measures to protect your data from unauthorized access, alteration, or
                disclosure. Your data is stored securely within Rwanda.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Community Guidelines</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We encourage respectful and supportive interactions within our community. Any form of harassment or
                inappropriate content is strictly prohibited.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Legal Basis</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                This Privacy Policy is governed by Rwanda's data protection principles and regulations.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Age Restrictions</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Our platform is intended for users aged 13 and older.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact & Updates</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                If you have any questions or concerns, please contact us:
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700">
                  <strong>Eve Health Support Team</strong>
                  <br />
                  Email: support@evehealth.app
                  <br />
                  Phone: +250-790-706-492
                </p>
              </div>
              <p className="text-gray-600 leading-relaxed">
                We may update this Privacy Policy periodically. Please review it regularly for any changes.
              </p>
            </section>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}

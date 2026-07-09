export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-6">
      <div className="border-b border-gray-150 pb-5">
        <h1 className="text-3xl font-extrabold text-gray-900">Privacy Policy</h1>
        <p className="text-gray-500 text-sm mt-1">Last Updated: July 2026</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4 text-sm text-gray-600 leading-relaxed text-justify">
        <h3 className="font-bold text-gray-900 text-base">What Information Do We Collect?</h3>
        <p>
          We collect personal data like your name, delivery address, telephone number, and email when you place orders, register accounts, or sign up for newsletters.
        </p>

        <h3 className="font-bold text-gray-900 text-base mt-6">How We Use Your Data</h3>
        <p>
          Your information is solely used to verify checkout credentials, package shipments, process mobile banking payments (bKash/Nagad), and communicate order dispatch statuses via SMS and email.
        </p>

        <h3 className="font-bold text-gray-900 text-base mt-6">Data Security</h3>
        <p>
          We do not sell, rent, or trade your personal data. All online credit card transaction details are securely processed through local bank gateways via secure SSL protocols.
        </p>
      </div>
    </div>
  );
}

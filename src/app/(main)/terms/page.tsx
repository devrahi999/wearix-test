export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-6">
      <div className="border-b border-gray-150 pb-5">
        <h1 className="text-3xl font-extrabold text-gray-900">Terms & Conditions</h1>
        <p className="text-gray-500 text-sm mt-1">Last Updated: July 2026</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4 text-sm text-gray-600 leading-relaxed text-justify">
        <h3 className="font-bold text-gray-900 text-base">Usage of the Website</h3>
        <p>
          By browsing or buying from the Wearix website, you agree to comply with our general Terms and Conditions, privacy policies, and shipping rules.
        </p>

        <h3 className="font-bold text-gray-900 text-base mt-6">Product Information & Pricing</h3>
        <p>
          We strive to be as accurate as possible with fabric weight (GSM), sizing, and colors. However, actual garment colors may vary slightly due to device display configurations. Prices in Bangladeshi Taka (BDT) are subject to change without prior notice.
        </p>

        <h3 className="font-bold text-gray-900 text-base mt-6">Limitation of Liability</h3>
        <p>
          Wearix is not liable for delay in courier delivery timelines caused by regional emergencies, bad weather conditions, or local strike blockades.
        </p>
      </div>
    </div>
  );
}

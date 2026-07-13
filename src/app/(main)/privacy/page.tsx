export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-6">
      <div className="border-b border-gray-150 pb-5">
        <h1 className="text-3xl font-extrabold text-gray-900">Privacy Policy</h1>
        <p className="text-gray-500 text-sm mt-1">At Wearix, we respect your privacy and are committed to protecting your personal information.</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-6 text-sm text-gray-600 leading-relaxed text-justify">
        
        <div>
          <h3 className="font-bold text-gray-900 text-lg mb-3">Information We Collect</h3>
          <p className="mb-2">We may collect the following information:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Full Name</li>
            <li>Phone Number</li>
            <li>Delivery Address</li>
            <li>Email Address (if provided)</li>
            <li>Order Information</li>
            <li>Device and browser information</li>
            <li>Website usage data through cookies</li>
          </ul>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <h3 className="font-bold text-gray-900 text-lg mb-3">How We Use Your Information</h3>
          <p className="mb-2">Your information is used to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Process and deliver your orders</li>
            <li>Contact you regarding your order</li>
            <li>Improve our website and services</li>
            <li>Prevent fraud and unauthorized activities</li>
            <li>Provide customer support</li>
          </ul>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <h3 className="font-bold text-gray-900 text-lg mb-3">Data Protection</h3>
          <p>We take reasonable security measures to protect your personal information from unauthorized access or misuse.</p>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <h3 className="font-bold text-gray-900 text-lg mb-3">Third-Party Services</h3>
          <p className="mb-2">We may use trusted third-party services such as:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Courier partners</li>
            <li>Payment service providers</li>
            <li>Analytics tools</li>
          </ul>
          <p className="mt-2">These providers only receive the information necessary to perform their services.</p>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <h3 className="font-bold text-gray-900 text-lg mb-3">Cookies</h3>
          <p>Our website may use cookies to improve user experience and website performance.</p>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <h3 className="font-bold text-gray-900 text-lg mb-3">Your Rights</h3>
          <p>You may request to update or delete your personal information by contacting our support team.</p>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <h3 className="font-bold text-gray-900 text-lg mb-3">Changes to This Policy</h3>
          <p>We may update this Privacy Policy at any time. Any changes will be posted on this page.</p>
        </div>

      </div>
    </div>
  );
}

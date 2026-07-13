import Link from 'next/link';

export default function TermsConditionsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-6">
      <div className="border-b border-gray-150 pb-5">
        <h1 className="text-3xl font-extrabold text-gray-900">Terms & Conditions</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome to Wearix. By accessing or using our website, you agree to the following Terms & Conditions.</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-6 text-sm text-gray-600 leading-relaxed text-justify">
        
        <div>
          <h3 className="font-bold text-gray-900 text-lg mb-3">Orders</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>All orders are subject to product availability.</li>
            <li>We reserve the right to cancel or refuse any order if necessary.</li>
            <li>Customers are responsible for providing accurate delivery information.</li>
          </ul>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <h3 className="font-bold text-gray-900 text-lg mb-3">Pricing</h3>
          <p>We strive to keep our prices accurate. However, prices may change without prior notice.</p>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <h3 className="font-bold text-gray-900 text-lg mb-3">Product Information</h3>
          <p className="mb-2">We make every effort to display accurate product descriptions and images.</p>
          <p>However, slight variations in color may occur due to lighting, photography, or screen settings.</p>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <h3 className="font-bold text-gray-900 text-lg mb-3">Delivery</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Delivery times may vary depending on your location and courier service.</li>
            <li>Unexpected delays caused by weather, public holidays, or courier issues may occur.</li>
          </ul>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <h3 className="font-bold text-gray-900 text-lg mb-3">Payments</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>We accept available payment methods displayed during checkout.</li>
            <li>Cash on Delivery is available in eligible areas.</li>
          </ul>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <h3 className="font-bold text-gray-900 text-lg mb-3">Returns & Refunds</h3>
          <p className="mb-2">Returns and refunds are governed by our Return & Refund Policy.</p>
          <p>Please read that <Link href="/return-policy" className="text-blue-600 hover:underline">policy</Link> before placing an order.</p>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <h3 className="font-bold text-gray-900 text-lg mb-3">Intellectual Property</h3>
          <p className="mb-2">All website content including:</p>
          <ul className="list-disc pl-5 space-y-1 mb-2">
            <li>Logo</li>
            <li>Images</li>
            <li>Graphics</li>
            <li>Text</li>
            <li>Design</li>
          </ul>
          <p>is the property of Wearix and may not be copied, reproduced, or distributed without permission.</p>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <h3 className="font-bold text-gray-900 text-lg mb-3">Limitation of Liability</h3>
          <p>Wearix shall not be liable for indirect or consequential damages resulting from the use of our website or products.</p>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <h3 className="font-bold text-gray-900 text-lg mb-3">Changes to Terms</h3>
          <p className="mb-2">We reserve the right to modify these Terms & Conditions at any time without prior notice.</p>
          <p>Continued use of the website indicates your acceptance of any updated terms.</p>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <h3 className="font-bold text-gray-900 text-lg mb-3">Contact Us</h3>
          <p className="mb-2">If you have any questions regarding our policies, please contact us.</p>
          <ul className="space-y-1">
            <li><strong>Email:</strong> help.wearix@gmail.com</li>
            <li><strong>Phone/WhatsApp:</strong> +8801987212011</li>
            <li><strong>Facebook Page:</strong> Wearix</li>
          </ul>
        </div>

      </div>
    </div>
  );
}

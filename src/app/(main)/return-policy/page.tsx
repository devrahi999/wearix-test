export default function ReturnPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-6">
      <div className="border-b border-gray-150 pb-5">
        <h1 className="text-3xl font-extrabold text-gray-900">Return & Exchange Policy</h1>
        <p className="text-gray-500 text-sm mt-1">Last Updated: July 2026</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4 text-sm text-gray-600 leading-relaxed text-justify">
        <h3 className="font-bold text-gray-900 text-base">7-Day Easy Return Policy</h3>
        <p>
          We want you to be completely satisfied with your purchase. If a garment does not fit, or you receive a defective or incorrect item, you can return or exchange the product within <strong>7 days</strong> of delivery.
        </p>

        <h3 className="font-bold text-gray-900 text-base mt-6">Conditions for Return & Exchange</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>The product must be unused, unwashed, and in its original packaging condition.</li>
          <li>All original tags, price tickets, and invoice copies must be intact.</li>
          <li>We cannot accept returns for items bought on clearance sales or customized items.</li>
        </ul>

        <h3 className="font-bold text-gray-900 text-base mt-6">Return Process</h3>
        <p>
          To log a return or exchange, send a WhatsApp message to our hotline at <strong>+8801700000000</strong> with your Order ID and pictures of the product tags. Our support representatives will guide you through our courier pickup options.
        </p>
      </div>
    </div>
  );
}

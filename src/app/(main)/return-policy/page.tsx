import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Return Policy | WearixBD',
  description: 'Read WearixBD\'s return and exchange policy. Easy returns within 7 days of delivery across Bangladesh.',
  alternates: { canonical: 'https://wearixbd.store/return-policy' },
};

export default function ReturnPolicyPage() {

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-6">
      <div className="border-b border-gray-150 pb-5">
        <h1 className="text-3xl font-extrabold text-gray-900">Return & Refund Policy</h1>
        <p className="text-gray-500 text-sm mt-1">At WearixBD, customer satisfaction is our priority. Please read our Return & Refund Policy carefully before placing an order.</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-6 text-sm text-gray-600 leading-relaxed text-justify">
        
        <div>
          <h3 className="font-bold text-gray-900 text-lg mb-3">Return Policy</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>We offer Cash on Delivery (COD) across Bangladesh through our trusted courier partners.</li>
            <li>Customers are requested to inspect the product carefully in the presence of the delivery personnel before accepting the package.</li>
            <li>If the product is found to be damaged, defective, incorrect, or has a manufacturing issue, please refuse the delivery immediately and inform us as soon as possible.</li>
            <li>To process a return for a damaged or incorrect product, customers must provide a clear unboxing video recorded while opening the package in front of the delivery personnel. Claims without an unboxing video may not be accepted.</li>
            <li>If the product is returned because of our mistake (wrong item, damaged item, or manufacturing defect), the customer will receive a replacement or a full refund according to the refund policy.</li>
            <li>If the customer refuses to receive the product for personal reasons (such as change of mind, incorrect size selection, or no product defect), the delivery charge is non-refundable. Any eligible prepaid amount will be refunded after deducting the applicable delivery charges.</li>
            <li>If a return request is made after the delivery personnel has left, the customer must return the product at their own cost unless the return is due to our error.</li>
          </ul>
          
          <h4 className="font-semibold text-gray-900 mt-4 mb-2">Returned products must be:</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li>Unused</li>
            <li>Unwashed</li>
            <li>In their original condition</li>
            <li>With all original tags, labels, and packaging intact</li>
          </ul>
          <p className="mt-3 text-red-600 font-medium">Products that have been used, washed, damaged by the customer, or returned without original packaging may not be eligible for return.</p>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <h3 className="font-bold text-gray-900 text-lg mb-3">Refund Policy</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>Once the returned product is received and inspected, we will notify you of the approval or rejection of your refund.</li>
            <li>If approved, eligible refunds will be processed within 24 hours after the return inspection is completed.</li>
            <li>Refunds will be sent only to the original payment method or account used during the purchase.</li>
            <li>If your refund is not received within the expected timeframe, please contact our customer support with your order details.</li>
          </ul>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <h3 className="font-bold text-gray-900 text-lg mb-3">Important Notes</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>Product colors may vary slightly due to lighting, photography, or screen settings.</li>
            <li>Please review the size chart carefully before placing your order. Returns due to incorrect size selection by the customer may not qualify for free return shipping.</li>
            <li>WearixBD operates as an online retail platform and fulfills orders through trusted supply partners. All return and refund requests are processed according to our quality inspection and fulfillment policies.</li>
          </ul>
        </div>

      </div>
    </div>
  );
}

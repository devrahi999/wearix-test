import { formatPrice } from '@/lib/utils';
import { SHIPPING_FEE } from '@/constants';

export default function ShippingPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-6">
      <div className="border-b border-gray-150 pb-5">
        <h1 className="text-3xl font-extrabold text-gray-900">Shipping & Delivery Policy</h1>
        <p className="text-gray-500 text-sm mt-1">Last Updated: July 2026</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4 text-sm text-gray-600 leading-relaxed text-justify">
        <h3 className="font-bold text-gray-900 text-base">Fulfillment and Courier Partners</h3>
        <p>
          We partner with leading logistical couriers in Bangladesh (Pathao, Steadfast, Paperfly) to ensure secure delivery. Every shipment is tracked from our warehouse in Dhaka to your doorstep.
        </p>

        <h3 className="font-bold text-gray-900 text-base mt-6">Shipping Rates</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Inside Dhaka:</strong> Flat rate of {formatPrice(SHIPPING_FEE.inside_dhaka)}.</li>
          <li><strong>Outside Dhaka:</strong> Flat rate of {formatPrice(SHIPPING_FEE.outside_dhaka)}.</li>
          <li><strong>Free Shipping:</strong> Enjoy free home delivery inside Dhaka on orders above ৳1,500.</li>
        </ul>

        <h3 className="font-bold text-gray-900 text-base mt-6">Delivery Timelines</h3>
        <p>
          Our typical delivery timelines are <strong>24 to 48 hours</strong> for locations inside Dhaka Division, and <strong>2 to 4 business days</strong> for district towns and rural areas across other divisions.
        </p>
      </div>
    </div>
  );
}

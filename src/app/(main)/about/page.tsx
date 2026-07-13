export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-6">
      <div className="border-b border-gray-150 pb-5">
        <h1 className="text-3xl font-extrabold text-gray-900">About Us</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome to Wearix, your trusted online destination for stylish and affordable men's fashion in Bangladesh.</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-6 text-sm text-gray-600 leading-relaxed text-justify">
        
        <div>
          <h3 className="font-bold text-gray-900 text-lg mb-3">Welcome to Wearix</h3>
          <p className="mb-3">At Wearix, we believe that great style should be accessible to everyone. Our goal is to provide high-quality fashion products at competitive prices while ensuring a smooth and reliable shopping experience.</p>
          
          <h4 className="font-semibold text-gray-900 mt-4 mb-2">Our collection includes:</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li>Football Jerseys</li>
            <li>T-Shirts</li>
            <li>Polo Shirts</li>
            <li>Casual Shirts</li>
            <li>Pants</li>
            <li>Sportswear</li>
            <li>And more</li>
          </ul>
          <p className="mt-3">We carefully select products from trusted suppliers to ensure quality and customer satisfaction.</p>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <h3 className="font-bold text-gray-900 text-lg mb-3">Why Choose Wearix?</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>High-quality products</li>
            <li>Affordable prices</li>
            <li>Cash on Delivery across Bangladesh</li>
            <li>Secure online shopping</li>
            <li>Responsive customer support</li>
            <li>Fast and reliable delivery</li>
          </ul>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <p className="font-medium text-gray-800">Our mission is to make online fashion shopping simple, convenient, and trustworthy for every customer.</p>
          <p className="mt-2 text-blue-600 font-bold">Thank you for choosing Wearix.</p>
        </div>

      </div>
    </div>
  );
}

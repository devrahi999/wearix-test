import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      {/* Title */}
      <div className="text-center space-y-2 border-b border-gray-100 pb-6">
        <h1 className="text-4xl font-extrabold text-gray-900">About Wearix</h1>
        <p className="text-gray-500 text-sm max-w-md mx-auto">
          Redefining premium Bangladeshi streetwear and traditional wear since 2025.
        </p>
      </div>

      {/* Intro */}
      <div className="space-y-4 text-sm text-gray-600 leading-relaxed text-justify">
        <p>
          At <strong>Wearix</strong>, we believe that fashion is a form of self-expression. Our garments are designed with a meticulous blend of modern aesthetics, premium comfort, and structural elegance. From breathable casual t-shirts and high-performance jerseys to intricately embroidered traditional panjabis, we offer collections that empower you to Wear Your Style.
        </p>
        <p>
          We source only the finest fabrics from local weavers and spinning mills, supporting our local industry while keeping manufacturing quality standards exceptionally high. Every single thread, seam, and button is inspected before it leaves our fulfillment facility in Dhaka, ensuring that you receive nothing but perfection.
        </p>
      </div>

      {/* Vision cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-2">
          <span className="text-2xl">🌱</span>
          <h3 className="font-bold text-gray-900 text-base">Ethical Sourcing</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            We work directly with cotton growers and spinning mills to ensure fair wage practices and environmentally friendly processes.
          </p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-2">
          <span className="text-2xl">🏆</span>
          <h3 className="font-bold text-gray-900 text-base">Premium Standards</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Our 180+ GSM combed cotton, custom blends, and high-performance meshes offer unmatched durability and fit retention.
          </p>
        </div>
      </div>

      <div className="pt-6 text-center">
        <Link
          href="/shop"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors shadow-sm"
        >
          Explore Our Collections
        </Link>
      </div>
    </div>
  );
}

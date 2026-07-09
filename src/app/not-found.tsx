import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white border border-gray-150 rounded-2xl p-8 shadow-sm text-center space-y-6">
        <span className="text-6xl">👕</span>
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-gray-900">404 - Not Found</h1>
          <p className="text-sm text-gray-500">
            Whoops! Looks like the outfit style or page you are looking for has run out of stock or does not exist.
          </p>
        </div>
        <Link
          href="/"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors shadow-sm"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}

import Link from "next/link";

export default function TestIndexPage() {
  return (
    <div className="mx-auto max-w-lg py-12 px-6">
      <h1 className="text-2xl font-semibold mb-4">Internal Test Utilities</h1>
      <p className="text-sm text-gray-600 mb-6">
        This area exposes temporary testing routes not intended for public use.
      </p>
      <ul className="space-y-3">
        <li>
          <Link
            href="/test/register"
            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-white text-sm font-medium shadow hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            Register Test Admin + Organization
          </Link>
        </li>
      </ul>
    </div>
  );
}

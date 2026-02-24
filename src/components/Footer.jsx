export default function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-8 text-center text-gray-400">

        <h2 className="text-lg font-semibold text-white mb-2">
          OsPheii Forum
        </h2>

        <p>Developer Knowledge Hub — Ask • Share • Solve</p>

        <p className="mt-4 text-sm">
          © {new Date().getFullYear()} OsPheii. All rights reserved.
        </p>

      </div>
    </footer>
  );
}

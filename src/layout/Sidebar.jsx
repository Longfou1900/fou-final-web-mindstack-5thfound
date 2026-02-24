import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="w-64 h-screen bg-gray-800 p-4">
      <h1 className="text-2xl font-bold mb-6">OsPheii</h1>

      <nav className="space-y-3">
        <Link to="/" className="block hover:text-yellow-400">Home</Link>
        <Link to="/chat" className="block hover:text-yellow-400">Chat</Link>
        <Link to="/favorite" className="block hover:text-yellow-400">Favorite</Link>
        <Link to="/account" className="block hover:text-yellow-400">Account</Link>
      </nav>
    </div>
  );
}

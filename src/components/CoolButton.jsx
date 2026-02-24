export default function CoolButton({ text }) {
  return (
    <button
      className="
      px-6 py-3 rounded-full font-semibold text-white
      bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500
      shadow-lg shadow-blue-500/40
      hover:scale-105 transition-all duration-300
      hover:shadow-purple-500/60
      "
    >
      {text}
    </button>
  );
}

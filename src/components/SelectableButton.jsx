export default function SelectableButton({ text }) {
  return (
    <div
      className="
      flex items-center justify-between
      px-6 py-4 rounded-2xl
      bg-gradient-to-r from-blue-400 to-purple-500
      shadow-xl shadow-purple-500/40
      text-white font-semibold
      cursor-pointer
      hover:scale-105 transition
      "
    >
      <span>✕</span>
      <span>{text}</span>
      <span>＋</span>
    </div>
  );
}

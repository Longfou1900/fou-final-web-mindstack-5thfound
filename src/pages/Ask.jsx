export default function Ask() {
  return (
    <div>
      <h2 className="text-2xl mb-4">Ask a Question</h2>

      <input
        placeholder="Title"
        className="w-full p-2 mb-4 bg-gray-700 rounded"
      />

      <textarea
        placeholder="Describe your problem..."
        className="w-full p-2 h-40 bg-gray-700 rounded"
      />

      <button className="mt-4 bg-green-500 px-4 py-2 rounded">
        Post Question
      </button>
    </div>
  );
}

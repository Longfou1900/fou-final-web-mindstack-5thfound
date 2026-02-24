export default function Question() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">
        How to center a div in CSS?
      </h2>

      <div className="bg-gray-800 p-4 rounded mb-6">
        <p>Use flexbox:</p>

        <pre className="bg-black p-3 mt-2 rounded">
{`display: flex;
justify-content: center;
align-items: center;`}
        </pre>

        <button className="mt-2 bg-yellow-500 px-3 py-1 rounded">
          💡 Lamp
        </button>
      </div>

      <textarea
        placeholder="Write your solution..."
        className="w-full p-2 h-24 bg-gray-700 rounded"
      />
    </div>
  );
}

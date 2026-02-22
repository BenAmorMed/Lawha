export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-4">🖼️ Canvas Platform</h1>
        <p className="text-xl text-gray-600 mb-8">
          Design and print custom personalized canvas prints
        </p>
        <button className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          Start Designing
        </button>
      </div>
    </main>
  );
}

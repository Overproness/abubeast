export function TailwindTest() {
  return (
    <div className="p-6 m-4 border-2 border-gray-300 rounded-lg">
      <h2 className="text-3xl font-bold text-blue-600 mb-4">
        Tailwind Test Component
      </h2>
      <p className="mt-2 text-gray-700 text-lg">
        This component should display proper styling if Tailwind is working.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button className="rounded-md bg-blue-500 px-6 py-3 text-white font-medium">
          Blue Button
        </button>
        <button className="rounded-md bg-red-500 px-6 py-3 text-white font-medium">
          Red Button
        </button>
      </div>
    </div>
  );
}

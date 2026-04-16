function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-indigo-600 mb-2">
          TFG Ecommerce Blockchain
        </h1>
        <p className="text-gray-500 mb-4">
          Stack funcionando correctamente
        </p>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500"></span>
            <span className="text-sm text-gray-700">Frontend React 18 + TypeScript + Tailwind</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500"></span>
            <span className="text-sm text-gray-700">Backend Node.js + Express</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500"></span>
            <span className="text-sm text-gray-700">PostgreSQL en Railway</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
            <span className="text-sm text-gray-700">Hardhat 3 + Polygon Mumbai</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

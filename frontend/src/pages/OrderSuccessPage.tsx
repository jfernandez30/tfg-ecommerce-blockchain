interface OrderSuccessPageProps {
  onContinue: () => void
}

export default function OrderSuccessPage({ onContinue }: OrderSuccessPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          ¡Pedido confirmado!
        </h1>
        <p className="text-gray-500 mb-6">
          Tu pedido ha sido registrado correctamente. Recibirás una confirmación en breve.
        </p>
        <button
          onClick={onContinue}
          className="w-full bg-indigo-600 text-white rounded-xl py-3 font-medium hover:bg-indigo-700 transition"
        >
          Seguir comprando
        </button>
      </div>
    </div>
  )
}

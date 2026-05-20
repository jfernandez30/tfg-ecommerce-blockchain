interface OrderSuccessPageProps {
  orderId: string | null
  txHash?: string | null
  onContinue: () => void
}

export default function OrderSuccessPage({ orderId, txHash, onContinue }: OrderSuccessPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pedido confirmado</h1>
        <p className="text-gray-500 mb-2">Tu pedido ha sido procesado correctamente.</p>

        {orderId && (
          <p className="text-xs text-gray-400 mb-4 font-mono break-all">
            ID: {orderId}
          </p>
        )}

        {txHash && (
          <div className="bg-green-50 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm font-semibold text-green-800 mb-1">Registrado en blockchain</p>
            <p className="text-xs text-gray-500 font-mono break-all mb-3">{txHash}</p>
            <a
              href={`https://amoy.polygonscan.com/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center bg-green-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-green-700 transition"
            >
              Ver en Polygonscan
            </a>
          </div>
        )}

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
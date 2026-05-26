interface OrderSuccessPageProps {
  orderId: string | null
  txHash?: string | null
  onContinue: () => void
}

export default function OrderSuccessPage({ orderId, txHash, onContinue }: OrderSuccessPageProps) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">Pedido confirmado</h1>
          <p className="text-zinc-500 text-sm mb-4">Tu pedido ha sido procesado correctamente.</p>

          {orderId && (
            <p className="text-xs text-zinc-600 font-mono mb-6 break-all">ID: {orderId}</p>
          )}

          {txHash ? (
            <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4 mb-6 text-left">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <p className="text-sm font-semibold text-green-400">Registrado en blockchain</p>
              </div>
              <p className="text-xs text-zinc-500 font-mono break-all mb-3">{txHash}</p>
              <a href={`https://amoy.polygonscan.com/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-green-400 hover:text-green-300 transition">
                Ver en Polygonscan
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          ) : (
            <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-4 mb-6 text-left">
              <p className="text-sm text-zinc-400">Tu pedido está siendo procesado por nuestro equipo.</p>
            </div>
          )}

          <button
            onClick={onContinue}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-3 font-semibold text-sm transition"
          >
            Seguir comprando
          </button>
        </div>
      </div>
    </div>
  )
}
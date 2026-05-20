import { createConfig, http } from 'wagmi'
import { polygonAmoy } from 'wagmi/chains'
import { injected, walletConnect } from 'wagmi/connectors'

export const wagmiConfig = createConfig({
  chains: [polygonAmoy],
  connectors: [
    injected(),
  ],
  transports: {
    [polygonAmoy.id]: http('https://polygon-amoy.g.alchemy.com/v2/5ssGo3A6fe3rYGzDuAFtA'),
  },
})

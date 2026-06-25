import { createConfig, http } from 'wagmi'
import { polygonAmoy } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

export const wagmiConfig = createConfig({
  chains: [polygonAmoy],
  connectors: [
    injected(),
  ],
  transports: {
    [polygonAmoy.id]: http(`https://polygon-amoy.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_KEY}`),
  },
})

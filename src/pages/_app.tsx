import { createContext, useEffect, useState } from "react";
import type { AppProps } from "next/app";
import "@/styles/globals.css";
import {
  configureChains,
  createClient,
  WagmiConfig,
  useConnect,
  CreateClientConfig,
} from "wagmi";
import { polygonMumbai } from "wagmi/chains";
import { GlobalState } from "@/types/global";
import {
  GlobalStateContext,
  SetGlobalStateContext,
} from "@/hooks/globalContext";
import { NotificationProvider } from "@web3uikit/core";
import { ConfigProvider } from "antd-mobile";
import enUS from "antd-mobile/es/locales/en-US";
import { bindings as wagmiBindings } from "@lens-protocol/wagmi";
import { staging, LensProvider, LensConfig } from "@lens-protocol/react-web";
const GLOBAL_STATE_KEY = "GLOBAL_STATE_KEY";
import { CoinbaseWalletConnector } from "wagmi/connectors/coinbaseWallet";
import { InjectedConnector } from "wagmi/connectors/injected";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import { alchemyProviderKey } from "@/constants";
import { MetaMaskContextProvider } from "@/hooks/useMetamask";

// 1. Get projectID at https://cloud.walletconnect.com
if (!process.env.NEXT_PUBLIC_PROJECT_ID) {
  throw new Error("You need to provide NEXT_PUBLIC_PROJECT_ID env variable");
}
// https://dev.to/muratcanyuksel/connecting-to-different-web3-wallets-using-wagmish-and-reactjs-1ojp
// wagmi only use 0.11
const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;

// 2. Configure wagmi client

// const { provider } = configureChains([polygonMumbai,polygon], [walletConnectProvider({ projectId })]);
const { chains, provider, webSocketProvider } = configureChains(
  [polygonMumbai],
  [alchemyProvider({ apiKey: alchemyProviderKey }), publicProvider()]
);
const client = createClient({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({ chains }),
    new CoinbaseWalletConnector({
      chains,
      options: {
        appName: "wagmi",
      },
    }),
    // new WalletConnectConnector({
    //   chains,
    //   options: {
    //     qrcode: true
    //   }
    // }),
    new InjectedConnector({
      chains,
      options: {
        name: "Injected",
        shimDisconnect: true,
      },
    }),
  ],
  provider,
  webSocketProvider,
});

const lensConfig: LensConfig = {
  bindings: wagmiBindings(),
  environment: staging,
};

// // 3. Configure modal ethereum client
// const ethereumClient = new EthereumClient(wagmiClient, chains);

// 4. Wrap your app with WagmiProvider and add <Web3Modal /> component
export default function App({ Component, pageProps }: AppProps) {
  const [ready, setReady] = useState(false);
  const [globalState, setGlobalState] = useState<GlobalState>(() => {
    try {
      return JSON.parse(window.localStorage.getItem(GLOBAL_STATE_KEY) || "");
    } catch (e) {
      return {};
    }
  });

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(GLOBAL_STATE_KEY, JSON.stringify(globalState));
  }, [globalState]);

  return (
    <ConfigProvider locale={enUS}>
      <NotificationProvider>
        <MetaMaskContextProvider>
          <GlobalStateContext.Provider value={globalState}>
            <SetGlobalStateContext.Provider value={setGlobalState}>
              {ready && (
                <WagmiConfig client={client}>
                  <LensProvider config={lensConfig}>
                    <Component {...pageProps} />
                  </LensProvider>
                </WagmiConfig>
              )}
            </SetGlobalStateContext.Provider>
          </GlobalStateContext.Provider>
        </MetaMaskContextProvider>
      </NotificationProvider>
    </ConfigProvider>
  );
}

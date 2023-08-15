import { useWalletLogin } from "@lens-protocol/react-web";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { Button } from "antd-mobile";

export const useLensLogin = () => {
  const {
    execute: login,
    error: loginError,
    isPending: isLoginPending,
  } = useWalletLogin();

  console.log("isPending", isLoginPending);

  const { isConnected } = useAccount();
  const { disconnectAsync } = useDisconnect();

  const { connectAsync } = useConnect({
    connector: new InjectedConnector(),
  });

  // Called when the user clicks "login"
  const onLoginClick = async () => {
    if (isConnected) {
      await disconnectAsync();
    }

    // login with wallet
    const { connector } = await connectAsync();
    if (connector instanceof InjectedConnector) {
      const signer = await connector.getSigner();
      // login with lens
      await login(signer);
    }
  };

  const LoginWithLensButton = () => (
    <div>
      {loginError && <p>{loginError.message}</p>}
      <Button disabled={isLoginPending} onClick={onLoginClick}>
        Connect Wallet With Lens
      </Button>
    </div>
  );

  return { LoginWithLensButton, isLoginPending, loginError };
};

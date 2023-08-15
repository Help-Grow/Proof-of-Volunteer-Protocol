import {
  useAccount,
  useConnect,
  useDisconnect,
  useEnsAvatar,
  useEnsName,
} from "wagmi";
import {
  Card,
  Result,
  Button,
  Space,
  Toast,
  Dialog,
  Form,
  Input,
  NoticeBar,
} from "antd-mobile";
import { useRouter } from "next/router";
export function Connected() {
  const { address, connector, isConnected } = useAccount();
  const { connect, connectors, error, isLoading, pendingConnector } =
    useConnect();
  const { disconnect } = useDisconnect();
  const router = useRouter();

  if (isConnected) {
    return (
      <div style={{ float: "right" }}>
        <div>Connected to {connector?.name}</div>
        <Button
          onClick={() => {
            disconnect();
            router.push("/pomp_lens/login");
          }}
        >
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <div>
      {connectors.map((connector) => (
        <button
          disabled={!connector.ready}
          key={connector.id}
          onClick={() => connect({ connector })}
        >
          {connector.name}
          {!connector.ready && " (unsupported)"}
          {isLoading &&
            connector.id === pendingConnector?.id &&
            " (connecting)"}
        </button>
      ))}

      {error && <div>{error.message}</div>}
    </div>
  );
}

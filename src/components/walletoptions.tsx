import { useConnect } from "wagmi";
import { Card, Button } from "antd-mobile";

export function WalletOptions() {
  const { connect, connectors, error, isLoading, pendingConnector } =
    useConnect();

  return (
    <Card
      bodyStyle={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "10px",
      }}
    >
      {connectors.map((connector) => (
        <Button
          color="primary"
          disabled={!connector.ready}
          key={connector.id}
          onClick={() => connect({ connector })}
        >
          {connector.name}
          {!connector.ready && " (unsupported)"}
          {isLoading &&
            connector.id === pendingConnector?.id &&
            " (connecting)"}
        </Button>
      ))}

      {error && <div>{error.message}</div>}
    </Card>
  );
}

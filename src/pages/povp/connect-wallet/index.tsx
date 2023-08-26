import React from "react";

// Components
import Image from "next/image";
import { Web3Button, Web3NetworkSwitch } from "@web3modal/react";
import { Card, Result, Button, Dialog } from "antd-mobile";
import { SmileOutline } from "antd-mobile-icons";

// Hooks
import { useAccount, useDisconnect } from "wagmi";
import { useLensLogin } from "@/hooks/useLensLogin";
import { useRouter } from "next/router";
import { useGlobalState } from "@/hooks/globalContext";
import {
  ImageType,
  useActiveProfile,
  useCreatePost,
} from "@lens-protocol/react-web";

// Enums
import {
  ContentFocus,
  ReferencePolicyType,
  CollectPolicyType,
} from "@lens-protocol/react-web";

// Utils
import { getPOVPRawData, uploadToArweave, uploadToIPFS } from "@/util";
import { WalletOptions } from "@/components/walletoptions";

import styles from "@/styles/common.module.css";

export interface ConnectWalletPageProps {}

const ConnectWalletPage: React.FC<ConnectWalletPageProps> = (props) => {
  // wagmi connection
  const { isConnected: isWAGMIConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const router = useRouter();
  const { imageUrl, email } = useGlobalState();
  const { data: activeProfile } = useActiveProfile();
  const {
    execute: createPost,
    error: isPostError,
    isPending: isPostPending,
  } = useCreatePost({
    publisher: activeProfile!,
    upload: async (data) => {
      console.log("data from lens: ", data);
      const buffer = Buffer.from(JSON.stringify(data));
      const file = new File([buffer], "metadata.json");
      // const metaDataUrl = await uploadToIPFS(file);
      const metaDataUrl = await uploadToArweave(file);
      return metaDataUrl!;
    },
  });

  // maybe will use metamask sdk separately in the future
  // const { wallet, hasProvider, isConnecting, connectMetaMask } = useMetaMask();
  // const [imageId] = useUploadImage({ imageObj: imageUrl, isConnected });

  const isConnected = isWAGMIConnected;

  const { LoginWithLensButton, isLoginPending } = useLensLogin();

  const handleMint = async () => {
    if (!activeProfile) {
      console.log("Please connect wallet");
    }

    if (imageUrl && email) {
      // there is an bug that if the createPost transaction haven't been indexed, then the indexed query call will call infinite times. this should be the hooks error.
      // 2023.08.26 update again: it's not a bug, lens protocol will auto reject a ipfs url if it's not a valid lens protocol metadata json.
      // metadata json structure ref: https://docs.lens.xyz/docs/metadata-standards#metadata-structure
      // createPost type ref: https://lens-protocol.github.io/lens-sdk/types/_lens_protocol_react_web.CreatePostArgs.html
      const res = await createPost({
        content: JSON.stringify(getPOVPRawData(imageUrl!, email)),
        // contentFocus: ContentFocus.TEXT,
        contentFocus: ContentFocus.IMAGE,
        collect: {
          type: CollectPolicyType.NO_COLLECT,
        },
        locale: "en",
        reference: { type: ReferencePolicyType.ANYONE },
        media: [
          {
            url: imageUrl!,
            mimeType: ImageType.JPEG,
          },
        ],
      });

      if (res.isSuccess()) {
        Dialog.alert({
          content: "Mint Success!",
          confirmText: "Got it",
          onConfirm: () => {
            router.push("/povp/done");
          },
        });
      }
    }
  };

  return (
    <div className={styles.app}>
      <div className={styles.body}>
        <Card style={{ width: "100%" }}>
          <Result
            icon={<SmileOutline />}
            status="success"
            title="Connect Wallet!"
          />

          {/* below is separate metamask sdk wallet connector. comment for now */}
          {/* {!hasProvider && (
            <Link href="https://metamask.io" target="_blank">
              Install MetaMask
            </Link>
          )}
          {window.ethereum?.isMetaMask && wallet.accounts.length < 1 && (
            <Button disabled={isConnecting} onClick={connectMetaMask}>
              Connect MetaMask
            </Button>
          )} */}

          {!isConnected && <WalletOptions />}
          {!activeProfile && <LoginWithLensButton />}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "24px",
            }}
          >
            {imageUrl?.length && isConnected && (
              <Image
                src={imageUrl}
                alt="image"
                width={300}
                height={400}
                style={{ maxHeight: "300px", maxWidth: "100%" }}
              />
            )}
          </div>

          <div style={{ textAlign: "center", margin: "32px 0px" }}>
            <Web3NetworkSwitch />
            <Web3Button
              icon="show"
              label="Connect Wallet"
              balance="show"
            ></Web3Button>
          </div>

          {isConnected && !isLoginPending && (
            <>
              <Button
                style={{ margin: "12px 0px" }}
                block
                color="primary"
                onClick={handleMint}
                loading={isPostPending}
                disabled={!!isPostError}
              >
                Mint now
              </Button>
              <Button onClick={() => disconnect()}>Disconnect</Button>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ConnectWalletPage;

import React, { useEffect, useState } from "react";

// Components
import Image from "next/image";
import { Web3Button, Web3NetworkSwitch } from "@web3modal/react";
import { Card, Result, Button, Dialog } from "antd-mobile";
import { SmileOutline } from "antd-mobile-icons";

// Hooks
import {
  useAccount,
  useContractWrite,
  useDisconnect,
  usePrepareContractWrite,
} from "wagmi";
import { useLensLogin } from "@/hooks/useLensLogin";
import { useRouter } from "next/router";
import { useGlobalState } from "@/hooks/globalContext";
import { useActiveProfile, useCreatePost } from "@lens-protocol/react-web";

// Constants
import abiJson from "@/povp_abi.json";
import { povp_Contract_Address, Web3StorageApi } from "@/constants";

// Enums
import { ContentFocus, ReferencePolicyType } from "@lens-protocol/react-web";

// Utils
import { Web3Storage } from "web3.storage";
import Web3 from "web3";
import { WalletOptions } from "@/components/walletoptions";

import styles from "@/styles/common.module.css";

export interface ConnectWalletPageProps {}

const getRawData = (imgUrl: string, email: string) => ({
  description: "Jerry Volunteered at Digital Literacy Help",
  external_url: "",
  image: imgUrl,
  name: "Volunteering Moment",
  attributes: [
    {
      display_type: "date",
      trait_type: "POVP Date",
      value: Math.round(Date.now() / 1000),
    },
    {
      trait_type: "Organizer",
      value: "Help & Grow",
    },
    {
      trait_type: "Event Name",
      value: "Digital Literacy Help",
    },
    {
      trait_type: "PIC to Claim From",
      value: "Katrina",
    },
    {
      trait_type: "Volunteer Name",
      value: "Jerry",
    },
    {
      trait_type: "Volunteer Email",
      value: email,
    },
  ],
});

// const useUploadImage = ({
//   imageObj,
//   isConnected
// }: {
//   imageObj: ImageObjType;
//   isConnected: boolean;
// }) => {
//   const [id, setId] = useState('init');

//   useEffect(() => {
//     (async function extractFile() {
//       try {
//         if (isConnected && imageObj.name.length > 0 && imageObj.bucket.length > 0) {
//           // const file = await (await fetch(blobUrl)).blob();
//           // const fileBase64 = await convertBase64(file);
//           // const formData = new FormData();
//           // formData.append('imageFile', file, file.name);
//           // const res = await postData('/api/upload-image', {
//           //   content: fileBase64,
//           //   fileName
//           // });
//           setId(`https://${imageObj.bucket}.4everland.store/${imageObj.name}`);
//         }
//       } catch (e: any) {
//         console.log('e', e);
//         // Dialog.alert({
//         //   content: e?.message || 'Error',
//         //   confirmText: 'Dismiss'
//         // });
//         setId('debug');
//       }
//     })();
//   }, [isConnected, imageObj]);

//   return [id];
// };

const ConnectWalletPage: React.FC<ConnectWalletPageProps> = (props) => {
  // const [imageUrl, setImageUrl] = useState<string>("");
  // wagm connection
  const { isConnected: isWAGMConnected, status } = useAccount();
  const { disconnect } = useDisconnect();
  const router = useRouter();
  const { recipient, ipfsImageUrl, email } = useGlobalState();
  const { data: activeProfile, loading: profileLoading } = useActiveProfile();
  const {
    execute: createPost,
    error: isPostError,
    isPending: isPostPending,
  } = useCreatePost({
    publisher: activeProfile!,
    upload: async () => ipfsImageUrl!,
  });

  console.log("isPostPending", isPostPending);

  // metamask sdk
  // const { wallet, hasProvider, isConnecting, connectMetaMask } = useMetaMask();
  // const [imageId] = useUploadImage({ imageObj: imageUrl, isConnected });
  const [walletAddress, setWalletAddress] = useState<string>();
  const [metaData, setmetaData] = useState<string>();

  const [client, setClient] = useState<Web3Storage>();

  const isConnected = isWAGMConnected;
  // isWAGMConnected || (hasProvider && wallet.accounts.length > 0);

  useEffect(() => {
    setClient(new Web3Storage({ token: Web3StorageApi }));
  }, []);

  const { LoginWithLensButton, isLoginPending, loginError } = useLensLogin();

  const handleMint = async () => {
    // var web3 = new Web3(Web3.givenProvider);
    // if (web3) {
    //   const accounts = await web3.eth.getAccounts();
    //   setWalletAddress(accounts[0]);
    //   console.log(accounts[0]);
    // } else {
    //   console.log("Please connect wallet");
    // }
    if (!activeProfile) {
      console.log("Please connect wallet");
    }

    console.log(ipfsImageUrl, email);

    if (ipfsImageUrl && email) {
      // there is an bug that if the createPost transaction haven't been indexed, then the indexed query call will call infinite times. this should be the hooks error.
      const res = await createPost({
        content: JSON.stringify(getRawData(ipfsImageUrl!, email)),
        contentFocus: ContentFocus.TEXT,
        locale: "en",
        reference: { type: ReferencePolicyType.ANYONE },
      });

      console.log(res.unwrap());
      console.log(res.isSuccess());
      if (res.isSuccess()) {
        Dialog.alert({
          content: "Mint Success!",
          confirmText: "Got it",
          onConfirm: () => {
            router.push("/povp/done");
          },
        });
      }

      // const blob = new Blob(
      //   [JSON.stringify(getRawData(ipfsImageUrl!, email))],
      //   {
      //     type: "application/json",
      //   }
      // );
      // const rootCid = await client?.put([new File([blob], "povpsbt.json")]);
      // setmetaData(rootCid);
    }
  };

  // useEffect(() => {
  //   const fileName = localStorage.getItem('ImageFileName') ?? '';
  //   const bucketName = localStorage.getItem('BucketName') ?? '';
  //   if (fileName.length && bucketName.length)
  //     setImageUrl(`https://${bucketName}.4everland.store/${fileName}`);
  // }, []);

  // useEffect(() => {
  //   if (recipient) {
  //     setWalletAddress(recipient.wallet_address);
  //   }
  // }, [recipient]);

  return (
    <div className={styles.app}>
      <div className={styles.body}>
        <Card style={{ width: "100%" }}>
          <Result
            icon={<SmileOutline />}
            status="success"
            title="Connect Wallet!"
          />

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
            {ipfsImageUrl?.length && isConnected && (
              <Image
                src={ipfsImageUrl}
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

          {/* {isConnected && (
            <Form
              onValuesChange={({ wallet_address }) => {
                setWalletAddress(wallet_address);
              }}
            >
              <NoticeBar
                content={`As ${recipient?.name} did not bind Etherum address or Unipass account, please input the target address`}
                wrap
                color="alert"
              />

              <Form.Item name="wallet_address">
                <Input placeholder="Input wallet address"></Input>
              </Form.Item>
            </Form>
          )} */}

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

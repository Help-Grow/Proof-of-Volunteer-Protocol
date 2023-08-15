import React, { useEffect, useState } from "react";
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
import { SmileOutline } from "antd-mobile-icons";
import styles from "@/styles/common.module.css";
import { Web3Button, Web3NetworkSwitch } from "@web3modal/react";
import { useAccount, useContractWrite, usePrepareContractWrite } from "wagmi";
import { convertBase64, postData } from "@/util";
import abiJson from "@/abi.json";
import { CONTRACT_ADDRESS } from "@/constants";
import { useRouter } from "next/router";
import { useGlobalState } from "@/hooks/globalContext";
import Image from "next/image";

export interface ConnectWalletPageProps {}

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
  const [imageUrl, setImageUrl] = useState<string>("");
  const { isConnected } = useAccount();
  const router = useRouter();
  const { recipient } = useGlobalState();
  // const [imageId] = useUploadImage({ imageObj: imageUrl, isConnected });

  const [walletAddress, setWalletAddress] = useState(recipient?.wallet_address);

  const { config } = usePrepareContractWrite({
    address: CONTRACT_ADDRESS,
    abi: abiJson,
    functionName: "mint",
    args: [walletAddress, "1", imageUrl],
  });
  const { data, isLoading, isSuccess, write } = useContractWrite(config);

  console.log("data", data, isSuccess, walletAddress, imageUrl);

  const handleMint = () => {
    console.log("mint now");
    write?.();
  };

  useEffect(() => {
    const fileName = localStorage.getItem("ImageFileName") ?? "";
    const bucketName = localStorage.getItem("BucketName") ?? "";
    if (fileName.length && bucketName.length)
      setImageUrl(`https://${bucketName}.4everland.store/${fileName}`);
  }, []);

  useEffect(() => {
    if (isSuccess) {
      const res = Dialog.alert({
        content: "Mint Success!",
        confirmText: "Got it",
        onConfirm: () => {
          router.push("/pomp/done");
        },
      });
    }
  }, [isSuccess, router]);

  useEffect(() => {
    if (recipient) {
      setWalletAddress(recipient.wallet_address);
    }
  }, [recipient]);

  return (
    <div className={styles.app}>
      <div className={styles.body}>
        <Card style={{ width: "100%" }}>
          <Result
            icon={<SmileOutline />}
            status="success"
            title="Connect Wallet!"
          />

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "24px",
            }}
          >
            {imageUrl.length && isConnected && (
              <Image
                src={imageUrl}
                alt=""
                style={{ maxHeight: "300px", width: "auto", maxWidth: "100%" }}
              />
            )}
          </div>

          <div style={{ textAlign: "center", margin: "32px 0px" }}>
            <Web3NetworkSwitch />
            {/* <Web3Button icon="show" label="Connect Wallet" balance="show"></Web3Button> */}
          </div>

          {isConnected && !recipient?.wallet_address && (
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
          )}

          {isConnected && (
            <Button
              style={{ margin: "12px 0px" }}
              block
              color="primary"
              onClick={handleMint}
              loading={isLoading}
              disabled={isSuccess || !walletAddress}
            >
              Mint now
            </Button>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ConnectWalletPage;

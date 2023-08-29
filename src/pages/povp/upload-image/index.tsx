import React, { useState } from "react";

// Components
import {
  Card,
  Result,
  ImageUploader,
  ImageUploadItem,
  Tag,
  Button,
  Toast,
} from "antd-mobile";
import { SmileOutline, CameraOutline } from "antd-mobile-icons";
import Link from "next/link";

// Hooks
import { useSetGlobalState } from "@/hooks/globalContext";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useNetwork,
  useSwitchNetwork,
} from "wagmi";

// Enums
import { ImageType } from "@lens-protocol/react-web";
import { ChainID } from "@/interfaces/chain";

// Utils
import { uploadToArweave, uploadToIPFS } from "@/util";
import { InjectedConnector } from "wagmi/connectors/injected";

import styles from "@/styles/common.module.css";

export interface TakePhotoPageProps {}

const AllowedImageTypes = [ImageType.JPEG, ImageType.PNG, ImageType.GIF];

const TakePhotoPage: React.FC<TakePhotoPageProps> = () => {
  const [showWarning, setShowWarning] = useState<boolean>(false);

  const [fileList, setFileList] = useState<ImageUploadItem[]>([]);

  const setGlobalState = useSetGlobalState();

  const { isConnected } = useAccount();
  const { disconnectAsync } = useDisconnect();
  const { connectAsync } = useConnect({
    connector: new InjectedConnector(),
  });
  const { chain } = useNetwork();
  const { switchNetworkAsync } = useSwitchNetwork();

  const handleUploadToIPFS = async (file: File): Promise<string> => {
    const imageUrl = await uploadToIPFS(file);
    return imageUrl;
  };

  const handleUploadToArweave = async (file: File): Promise<string> => {
    // need to take not that upload to arweave need to connect wallet
    if (isConnected) {
      await disconnectAsync();
    }
    await connectAsync();
    if (chain?.id !== ChainID.PolygonMumbai) {
      await switchNetworkAsync?.(ChainID.PolygonMumbai);
    }
    const imageUrl = await uploadToArweave(file);
    return imageUrl;
  };

  const handleUpload = async (file: File): Promise<ImageUploadItem> => {
    setShowWarning(false);
    const localUrl = URL.createObjectURL(file);
    if (AllowedImageTypes.includes(file.type as ImageType)) {
      try {
        console.log("Upload Started");
        const imageUrl = await handleUploadToArweave(file);
        // const imageUrl = await handleUploadToIPFS(file);
        setGlobalState((pre) => ({
          ...pre,
          imageUrl,
          imageType: file.type as ImageType,
          localImageUrl: localUrl,
        }));
        setFileList([{ url: localUrl }]);
        console.log("Image " + imageUrl);
      } catch (err) {
        console.log(err);
        setFileList([]);
        const error = JSON.parse(JSON.stringify(err));
        Toast.show({
          content: `Upload failed (Error: ${error.message || error.reason})`,
          position: "top",
        });
      }
    } else {
      setShowWarning(true);
    }
    return {
      url: localUrl,
    };
  };

  return (
    <div className={styles.app}>
      <div className={styles.body}>
        <Card style={{ width: "100%" }}>
          <Result
            icon={<SmileOutline />}
            status="success"
            title="Thank you for volunteering at Digital Literacy Help Event"
          />

          {Boolean(fileList?.length) ? (
            <Link href="/povp/connect-wallet">
              <Button block color="primary">
                Next
              </Button>
            </Link>
          ) : null}
        </Card>

        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          <ImageUploader
            value={fileList}
            onChange={setFileList}
            upload={handleUpload}
            maxCount={1}
            style={{ "--cell-size": "240px" }}
          >
            <div
              style={{
                width: 240,
                height: 240,
                borderRadius: 80,
                backgroundColor: "#f5f5f5",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "#999999",
              }}
            >
              <CameraOutline style={{ fontSize: 96 }} />
            </div>
          </ImageUploader>
          {showWarning && (
            <Tag>Only types: {AllowedImageTypes.join(", ")} are allowed</Tag>
          )}
        </div>
      </div>
    </div>
  );
};

export default TakePhotoPage;

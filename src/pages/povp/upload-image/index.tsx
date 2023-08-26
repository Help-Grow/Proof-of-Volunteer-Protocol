import React, { useState } from "react";
import {
  Card,
  Result,
  ImageUploader,
  ImageUploadItem,
  Tag,
  Button,
} from "antd-mobile";
import { SmileOutline, CameraOutline } from "antd-mobile-icons";
import styles from "@/styles/common.module.css";
import Link from "next/link";

import { useSetGlobalState } from "@/hooks/globalContext";

// Utils
import { uploadToArweave, uploadToIPFS } from "@/util";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";

export interface TakePhotoPageProps {}

const AllowedImageTypes = ["jpeg", "png", "gif"];

const TakePhotoPage: React.FC<TakePhotoPageProps> = () => {
  const [showWarning, setShowWarning] = useState<boolean>(false);

  const [fileList, setFileList] = useState<ImageUploadItem[]>([]);

  const setGlobalState = useSetGlobalState();

  const { isConnected } = useAccount();
  const { disconnectAsync } = useDisconnect();
  const { connectAsync } = useConnect({
    connector: new InjectedConnector(),
  });

  const handleUpload = async (file: File): Promise<ImageUploadItem> => {
    setShowWarning(false);
    if (AllowedImageTypes.map((t) => "image/" + t).includes(file.type)) {
      console.log("Upload Started");
      // const imageUrl = await uploadToIPFS(file);
      // need to take not that upload to arweave need to connect wallet
      if (isConnected) {
        await disconnectAsync();
      }
      await connectAsync();
      const imageUrl = await uploadToArweave(file);
      setGlobalState((pre) => ({ ...pre, imageUrl }));
      console.log("Image " + imageUrl);
    } else {
      setShowWarning(true);
    }
    return {
      url: URL.createObjectURL(file),
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
          ) : (
            <></>
            // <div style={{ textAlign: 'center' }}>
            //   <Link href="/mint" style={{ fontSize: '18px', textDecorationLine: 'underline' }}>
            //     Skip first
            //   </Link>
            // </div>
          )}
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
            // onDelete={() =>
            //   Dialog.confirm({
            //     content: 'Are you sure to remove this photo?',
            //     cancelText: 'Cancel',
            //     confirmText: 'Confirm',
            //     onConfirm: () => {
            //       s3client?.deleteObject({
            //         Bucket: imageObj?.bucket,
            //         Key: imageObj?.name
            //       });
            //     }
            //   })
            // }
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

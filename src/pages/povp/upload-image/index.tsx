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
import { uploadToIPFS } from "@/util";

export interface TakePhotoPageProps {}

const AllowedImageTypes = ["jpeg", "png", "gif"];

const TakePhotoPage: React.FC<TakePhotoPageProps> = () => {
  const [showWarning, setShowWarning] = useState<boolean>(false);

  const [fileList, setFileList] = useState<ImageUploadItem[]>([]);

  const setGlobalState = useSetGlobalState();

  const handleUpload = async (file: File): Promise<ImageUploadItem> => {
    setShowWarning(false);
    if (AllowedImageTypes.map((t) => "image/" + t).includes(file.type)) {
      console.log("Upload Started");
      // sample https:/bafybeihm2clcti5ch7y2tke4ocqy6sgmtbe3hcnc3xbn5v4oiiym5vatv4.ipfs.dweb.link/Tom-and-jerry.jpeg
      const ipfsImageUrl = await uploadToIPFS(file);
      setGlobalState((pre) => ({ ...pre, ipfsImageUrl }));
      console.log("Image " + ipfsImageUrl);
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

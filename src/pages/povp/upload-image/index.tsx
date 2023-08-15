import React, { useEffect, useState } from "react";
import {
  Card,
  Result,
  ImageUploader,
  ImageUploadItem,
  Dialog,
  Tag,
  Button,
} from "antd-mobile";
import { SmileOutline, CameraOutline } from "antd-mobile-icons";
import styles from "@/styles/common.module.css";
import Link from "next/link";
import { Web3StorageApi } from "@/constants";
// import { S3 } from '@aws-sdk/client-s3';
import { Web3Storage } from "web3.storage";
import { useSetGlobalState } from "@/hooks/globalContext";

export interface TakePhotoPageProps {}

const AllowedImageTypes = ["jpeg", "png", "gif"];

const TakePhotoPage: React.FC<TakePhotoPageProps> = () => {
  const [err, setErr] = useState<string>();
  const [showWarning, setShowWarning] = useState<boolean>(false);

  const [fileList, setFileList] = useState<ImageUploadItem[]>([]);

  const [imageObj, setImageObj] = useState<{ name: string; bucket: string }>();

  const [client, setClient] = useState<Web3Storage>();
  const setGlobalState = useSetGlobalState();

  useEffect(() => {
    // const s3 = new S3({
    //   endpoint: 'https://endpoint.4everland.co',
    //   credentials: {
    //     accessKeyId: 'ON4I2LI6AHLHFVJ838EL',
    //     secretAccessKey: 'gQFNviKG3+rRHw3sKkUf+1silQZ2KhQEMIxS3Ad1'
    //   },
    //   region: 'us-west-2'
    // });

    setClient(new Web3Storage({ token: Web3StorageApi }));
    // setClient(s3);
  }, []);

  const handleUpload = async (file: File): Promise<ImageUploadItem> => {
    setShowWarning(false);
    if (AllowedImageTypes.map((t) => "image/" + t).includes(file.type)) {
      // if (s3client) {
      //   const buckets = await s3client.listBuckets({});
      //   if (buckets.Buckets) {
      //     const bucketName = buckets.Buckets[0].Name;
      //     if (bucketName) {
      //       await s3client.putObject({
      //         Bucket: bucketName,
      //         Key: file.name,
      //         Body: file,
      //         ContentType: file.type
      //       });
      //       localStorage.setItem('BucketName', bucketName);
      //       localStorage.setItem('ImageFileName', file.name);
      //       setImageObj({ name: file.name, bucket: bucketName });
      //     }
      //   }
      // }
      console.log("Upload Started");
      if (client) {
        const rootCid = await client.put([file]);
        var ipfsImageUrl = `https://${rootCid}.ipfs.w3s.link/${file.name}`;
        setGlobalState((pre) => ({ ...pre, ipfsImageUrl }));
        console.log("Image " + ipfsImageUrl);

        // sample https:/bafybeihm2clcti5ch7y2tke4ocqy6sgmtbe3hcnc3xbn5v4oiiym5vatv4.ipfs.dweb.link/Tom-and-jerry.jpeg
      }
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

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
import { S3 } from "@aws-sdk/client-s3";

export interface TakePhotoPageProps {}

const AllowedImageTypes = ["jpeg", "png", "gif"];

const TakePhotoPage: React.FC<TakePhotoPageProps> = () => {
  const [err, setErr] = useState<string>();
  const [showWarning, setShowWarning] = useState<boolean>(false);

  const [fileList, setFileList] = useState<ImageUploadItem[]>([]);

  const [imageObj, setImageObj] = useState<{ name: string; bucket: string }>();

  const [s3client, setClient] = useState<S3>();

  useEffect(() => {
    const s3 = new S3({
      endpoint: "https://endpoint.4everland.co",
      credentials: {
        accessKeyId: "ON4I2LI6AHLHFVJ838EL",
        secretAccessKey: "gQFNviKG3+rRHw3sKkUf+1silQZ2KhQEMIxS3Ad1",
      },
      region: "us-west-2",
    });
    setClient(s3);
  }, []);

  const handleUpload = async (file: File): Promise<ImageUploadItem> => {
    setShowWarning(false);
    if (AllowedImageTypes.map((t) => "image/" + t).includes(file.type)) {
      if (s3client) {
        const buckets = await s3client.listBuckets({});
        if (buckets.Buckets) {
          const bucketName = buckets.Buckets[0].Name;
          if (bucketName) {
            await s3client.putObject({
              Bucket: bucketName,
              Key: file.name,
              Body: file,
              ContentType: file.type,
            });
            localStorage.setItem("BucketName", bucketName);
            localStorage.setItem("ImageFileName", file.name);
            setImageObj({ name: file.name, bucket: bucketName });
          }
        }
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
            title="You two met in “Alibaba Cloud (Singapore)”"
          />

          {Boolean(fileList?.length) ? (
            <Link href="/pomp/mint">
              <Button block color="primary">
                Next
              </Button>
            </Link>
          ) : (
            <div style={{ textAlign: "center" }}>
              <Link
                href="/pomp/mint"
                style={{ fontSize: "18px", textDecorationLine: "underline" }}
              >
                Skip first
              </Link>
            </div>
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
            onDelete={() =>
              Dialog.confirm({
                content: "Are you sure to remove this photo?",
                cancelText: "Cancel",
                confirmText: "Confirm",
                onConfirm: () => {
                  s3client?.deleteObject({
                    Bucket: imageObj?.bucket,
                    Key: imageObj?.name,
                  });
                },
              })
            }
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

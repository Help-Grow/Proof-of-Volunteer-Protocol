import { Web3Button, Web3NetworkSwitch } from "@web3modal/react";
import {
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
} from "wagmi";
import abiJson from "@/abi.json";
import { useEffect, useState } from "react";
import { Upload } from "@aws-sdk/lib-storage";
import { CameraOutline } from "antd-mobile-icons";
import { Dialog, ImageUploader, ImageUploadItem } from "antd-mobile";
import { S3 } from "@aws-sdk/client-s3";

const AllowedImageTypes = ["jpeg", "png", "gif"];

export default function HomePage() {
  // The address of the smart contract on Polygon
  const contract = "0x1e2f63405d0738B9F954E48F5292e305268750ea";
  // The wallet address that will receive the SBT
  const addr = "0x088238BaFC6d368d5aF78F2FD719C0008dec6Fdb";
  // This will determine the which token given to the user, e.g. Event1 -> tokenId 1, Event2 -> tokenId 2
  const tokenId = 1;

  const [fileList, setFileList] = useState<ImageUploadItem[]>([]);
  /**
   * This calls the mint function which requires 3 arguments:
   * 1. Recipient wallet's address
   * 2. The token ID
   * 3. Any media url to be associated with this mint
   */
  const { config } = usePrepareContractWrite({
    addressOrName: contract,
    contractInterface: abiJson,
    functionName: "mint",
    args: [addr, tokenId, "https://www.youtube.com/watch?v=3tGYbYZRqdY"],
  });
  const { data, isLoading, isSuccess, write } = useContractWrite(config);

  const [url, setUrl] = useState<string>("");

  /**
   * In the smart contract the media URI is saved as the type `mapping (address => mapping(uint256 => string))`
   * So when try to retrieve the URI you need to provide both the address and tokenId as argument.
   */
  const { data: tokenUriData } = useContractRead({
    addressOrName: contract,
    contractInterface: abiJson,
    functionName: "_tokenURIs",
    args: [addr, tokenId],
  });

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
    if (AllowedImageTypes.map((t) => "image/" + t).includes(file.type)) {
      if (s3client) {
        const buckets = await s3client.listBuckets({});
        if (buckets.Buckets) {
          const bucketName = buckets.Buckets[0].Name;

          s3client
            .listObjectsV2({ Bucket: bucketName, MaxKeys: 10 })
            .then((data) => {
              if (data.Contents) {
                data.Contents.forEach((o) => {
                  console.log(o.Key);
                });
              }
            })
            .catch((err) => {
              console.log(err);
            });

          // s3client
          //   .putObject({
          //     Bucket: buckets.Buckets[0].Name,
          //     Key: file.name,
          //     Body: file,
          //     ContentType: file.type
          //   })
          //   .then((data) => {
          //     console.log(data, file.name, bucketName);
          //   })
          //   .catch((error) => {
          //     console.log('err: ', error);
          //   });

          // console.log(putObjectOutput, file.name, bucketName);
        }
      }
      // const url = URL.createObjectURL(file);
      // setBlobUrl(url);
      // localStorage.setItem('imageBlobUrl', url);
      // localStorage.setItem('imageFileName', file.name);
    } else {
      // setShowWarning(true);
    }
    return {
      url: URL.createObjectURL(file),
    };
  };

  return (
    <div>
      {/* Predefined button  */}
      <Web3Button icon="show" label="Connect Wallet" balance="show" />
      <br />

      {/* Network Switcher Button */}
      <Web3NetworkSwitch />
      <br />

      <br />
      <br />
      <div>
        <button disabled={!write} onClick={() => write?.()}>
          Mint
        </button>
        {isLoading && <div>Check Wallet</div>}
        {isSuccess && <div>Transaction: {JSON.stringify(data)}</div>}
      </div>
      <br />
      <div>{JSON.stringify(tokenUriData)}</div>
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
            // onConfirm: () => {
            //   if (blobUrl) URL.revokeObjectURL(blobUrl);
            // }
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
    </div>
  );
}

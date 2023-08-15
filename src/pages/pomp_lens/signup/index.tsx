import { useEffect, useState } from "react";
import { BigNumber, ethers } from "ethers";

import { client, challenge, authenticate } from "../../api/lens_api";
import styles from "@/styles/common.module.css";
import {
  Card,
  Space,
  Form,
  Input,
  Result,
  ImageUploader,
  ImageUploadItem,
  Dialog,
  Tag,
  Button,
} from "antd-mobile";
import { useSetGlobalState, useGlobalState } from "@/hooks/globalContext";
import { LensClient, development } from "@lens-protocol/client";
import { useRouter } from "next/router";
import LocalStorageProvider from "../storage";
import { Web3Storage } from "web3.storage";
import { useNotification } from "@web3uikit/core";
import { SmileOutline, CameraOutline } from "antd-mobile-icons";
import { Web3StorageApi, MockProfileAddress } from "@/constants";
const AllowedImageTypes = ["jpeg", "png", "gif", "jpg"];
import { useAccount, useContractWrite, usePrepareContractWrite } from "wagmi";
import profileAbiJson from "@/mockprofileabi.json";
import { Web3Button, Web3NetworkSwitch } from "@web3modal/react";
import { Connected } from "@/components/connected";
export default function Home() {
  /* local state variables to hold user's address and access token */
  const { address, isConnected } = useAccount();

  const lensClient = new LensClient({
    environment: development,
    storage: new LocalStorageProvider(),
  });

  const router = useRouter();
  const [err, setErr] = useState<string>();
  const [showWarning, setShowWarning] = useState<boolean>(false);
  const [imageURL, setImageURL] = useState<string>("abc");
  const [fileList, setFileList] = useState<ImageUploadItem[]>([]);
  const notification = useNotification();
  const [handle, setHandle] = useState<string>("http://123");
  const [client, setClient] = useState<Web3Storage>();
  const [form, setFinishForm] = useState<Boolean>(false);
  const encoder = new TextEncoder();

  useEffect(() => {
    setClient(new Web3Storage({ token: Web3StorageApi }));
  }, []);

  const { config, error } = usePrepareContractWrite({
    addressOrName: MockProfileAddress,
    contractInterface: profileAbiJson,
    functionName: "proxyCreateProfile",

    args: [
      {
        to: address!.toString(),
        handle: handle,
        imageURI: imageURL,
        followModule: "0x0000000000000000000000000000000000000000",
        followModuleInitData: "0x00",
        followNFTURI: imageURL,
      },
    ],
    overrides: {
      gasLimit: BigNumber.from(10e5),
    },
  });
  const { write, writeAsync } = useContractWrite({
    ...config,

    onSettled(data, error) {
      if (!error) {
        notification({
          type: "success",
          message: "Profile created, please login",

          position: "topR",
        });
        console.log(data);
        router.push("/pomp_lens/login");
      } else {
        notification({
          type: "error",
          message: error.message,
          position: "topR",
        });
      }
    },
  });

  // const { config } = usePrepareContractWrite({
  //   address: MockProfileAddress,
  //   abi: profileAbiJson,
  //   // chainId:80001,
  //   functionName: 'proxyCreateProfile',
  //   args: [address, handleToWrite,imageURL,"0x0000000000000000000000000000000000000000","0x00",imageURL],

  // });

  //   const { data, isLoading, isSuccess, write } = useContractWrite({...config,
  //     onError(error) {
  //     console.log('Error', error)
  //   }
  // });

  useEffect(() => {
    if (write && form) {
      console.log(imageURL);
      write!();
    }

    if (form) setFinishForm(false);
  }, [handle, form]);

  async function finishForm(event: any) {
    setFinishForm(false);
    if (imageURL == "abc" || event.handle == null) {
      notification({
        type: "warning",
        message: "Please upload image/ fill in handle",

        position: "topR",
      });
      return;
    }
    setHandle(event.handle);
    setFinishForm(true);
  }
  const handleUpload = async (file: File): Promise<ImageUploadItem> => {
    setShowWarning(false);
    if (AllowedImageTypes.map((t) => "image/" + t).includes(file.type)) {
      console.log("Upload Started");
      if (client) {
        const rootCid = await client.put([file]);
        var ipfsImageUrl = `https://${rootCid}.ipfs.w3s.link/${file.name}`;

        setImageURL(ipfsImageUrl);
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
        <Card>
          <Connected />
          <Form onFinish={finishForm}>
            {/* <Form.Item name='Address' label='Ethereum Address' rules={[{ required: true }]}>
              <Input placeholder='Address' id="Address" type='text' />
            </Form.Item> */}
            <Form.Item
              name="handle"
              label="handle"
              rules={[{ required: true }]}
            >
              <Input placeholder="handle" id="handle" type="text" />
            </Form.Item>

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
              {showWarning && <Tag>Please change to a unique handle</Tag>}
            </div>

            <Button type="submit" color="primary" style={{ float: "right" }}>
              Submit
            </Button>
          </Form>
        </Card>
      </div>
    </div>
  );
}

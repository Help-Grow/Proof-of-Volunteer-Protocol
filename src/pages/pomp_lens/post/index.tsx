import React, { useEffect, useState } from "react";
import {
  Card,
  TextArea,
  Form,
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
import { Web3StorageApi, EventName } from "@/constants";
// import { S3 } from '@aws-sdk/client-s3';
import { Web3Storage } from "web3.storage";
import { useSetGlobalState, useGlobalState } from "@/hooks/globalContext";
import LocalStorageProvider from "../storage";
export interface TakePhotoPageProps {}
import {
  LensClient,
  ProfileFragment,
  development,
} from "@lens-protocol/client";
// import { ethers } from 'ethers';
const AllowedImageTypes = ["jpeg", "png", "gif"];
import { useRouter } from "next/router";
import { useNotification } from "@web3uikit/core";
import {
  PublicationMetadataDisplayType,
  PublicationMainFocus,
  MetadataAttributeInput,
} from "../../../interfaces/publication";
import { Web3Button } from "@web3modal/react";
import { useAccount, useContract, useSignTypedData } from "wagmi";
import { TypedDataDomain } from "ethers";
import { Connected } from "@/components/connected";

const TakePhotoPage: React.FC<TakePhotoPageProps> = () => {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [err, setErr] = useState<string>();
  const [showWarning, setShowWarning] = useState<boolean>(false);
  const [imageURL, setImageURL] = useState<string>();
  const [profile, setProfile] = useState<ProfileFragment>();
  const [fileList, setFileList] = useState<ImageUploadItem[]>([]);
  const notification = useNotification();

  const { data, isError, isLoading, isSuccess, signTypedDataAsync } =
    useSignTypedData();

  const [client, setClient] = useState<Web3Storage>();
  const setGlobalState = useSetGlobalState();
  const lensClient = new LensClient({
    environment: development,
    storage: new LocalStorageProvider(),
  });
  useEffect(() => {
    // const s3 = new S3({
    //   endpoint: 'https://endpoint.4everland.co',
    //   credentials: {
    //     accessKeyId: 'ON4I2LI6AHLHFVJ838EL',
    //     secretAccessKey: 'gQFNviKG3+rRHw3sKkUf+1silQZ2KhQEMIxS3Ad1'
    //   },
    //   region: 'us-west-2'
    // });
    fetchProfile();
    setClient(new Web3Storage({ token: Web3StorageApi }));
    // setClient(s3);
  }, []);

  const postNFT = async (event: any) => {
    if (!imageURL) {
      notification({
        type: "warning",
        title: "Please Upload Image",
        position: "topR",
      });
      return;
    }
    // const allOwnedProfiles = await lensClient.profile.fetchAll({
    //   ownedBy: [address?.toString()!],
    //   limit: 1
    // });
    // const profile = allOwnedProfiles.items[0];

    // const attribute1:MetadataAttributeInput = {
    //     traitType: "Meetup Time",
    //     value: Date.now().toString(),
    //   }

    const metadata = {
      appId: "HelpAndGrowCommunity",
      attributes: [
        {
          traitType: "Meetup Time",
          value: Date.now().toString(),
        },
        {
          traitType: "Contact",
          value: profile!.handle,
        },
        {
          traitType: "Meet",
          value: "helpandgrow.test",
        },
        {
          traitType: "Event",
          value: "Help and Grow Annual Meetup",
        },
        {
          traitType: "Organization",
          value: "New Hope",
        },
      ],
      content: profile!.handle.split(".")[0] + ":" + event.message,
      description: "Super happy to meet! ",
      locale: "en",
      mainContentFocus: PublicationMainFocus.Image,
      image: imageURL!,

      media: [
        {
          item: imageURL!,
          type:
            "image/" + imageURL?.split(".")[imageURL?.split(".").length - 1],
        },
      ],
      metadata_id: imageURL!,
      name: "Proof Of Meet Protocol",
      tags: ["HelpAndGrow", "Volunteer"],
      version: "2.0.0",
    };

    console.log(profile!.handle.split(".")[0] + ":" + event.message);

    ///// comment out validation logic here
    // const validateResult = await lensClient.publication.validateMetadata(metadata);

    // if (!validateResult.valid) {
    //   console.log(validateResult);
    //   throw new Error(`Metadata is not valid.`);
    // }
    if (client) {
      const blob = new Blob([JSON.stringify(metadata)], {
        type: "application/json",
      });
      const rootCid = await client?.put([
        new File([blob], "lensMetaData.json"),
      ]);
      var contentURI = `https://${rootCid}.ipfs.w3s.link/lensMetaData.json`;
    } else {
      throw new Error("IPFS not connected");
    }
    // ************* to optimize

    // upload metadata to ipfs or arweave - upload is your custom function that returns contentURI

    // or with typedData that require signature and broadcasting
    const typedDataResult = await lensClient.publication.createPostTypedData({
      profileId: profile!.id,
      contentURI: contentURI!,
      //   collectModule: {
      //     freeCollectModule: {
      //       followerOnly: false
      //     }
      //   },
      collectModule: {
        multirecipientFeeCollectModule: {
          amount: {
            currency: "0x2058A9D7613eEE744279e3856Ef0eAda5FCbaA7e",
            value: "2",
          },
          recipients: [
            {
              recipient: address?.toString()!,
              split: 20,
            },
            {
              recipient: "0x4B162DBa01943Bd8CD8af668bE72fB769999aC83",
              split: 80,
            },
          ],
          referralFee: 10,
          followerOnly: false,
        },
      },
      referenceModule: {
        followerOnlyReferenceModule: false, // anybody can comment or mirror
      },
    });

    if (typedDataResult) {
      console.log(typedDataResult);

      /* ask the user to sign a message with the challenge info returned from the server */

      const result = typedDataResult.unwrap();
      const d = result.typedData.domain;
      const dTmp = {
        chainId: d.chainId,
        name: d.name,

        verifyingContract: d.verifyingContract as "0x${string}",
        version: d.version,
      };
      const sig = await signTypedDataAsync({
        domain: dTmp,
        types: result.typedData.types,
        value: result.typedData.value,
      });

      console.log(sig);

      const broadcastResult = await lensClient.transaction.broadcast({
        id: result.id,
        signature: sig,
      });
      console.log(broadcastResult);

      //   const { v, r, s } = ethers.utils.splitSignature(signature);
      //   const LENS_HUB_ABI = abi;
      //   const tx = await new ethers.Contract(
      //     '0x60Ae865ee4C725cd04353b5AAb364553f56ceF82',
      //     LENS_HUB_ABI,
      //     signer
      //   ).postWithSig({
      //     profileId: typedData.value.profileId,
      //     contentURI: typedData.value.contentURI,
      //     collectModule: typedData.value.collectModule,
      //     collectModuleInitData: typedData.value.collectModuleInitData,
      //     referenceModule: typedData.value.referenceModule,
      //     referenceModuleInitData: typedData.value.referenceModuleInitData,
      //     sig: {
      //       v,
      //       r,
      //       s,
      //       deadline: typedData.value.deadline
      //     }
      //   });

      const res = Dialog.alert({
        content: "Mint Success!",
        confirmText: "Got it",
        onConfirm: () => {
          router.push("/pomp_lens/profile");
        },
      });

      //   0xaaa270c8ee36f3418c144a7342c65208f464962ed590f52237130da78ac8a234
      // const web3 = new Web3('https://polygon-mumbai.g.alchemy.com/v2/oCg7K_rQwFRVdDpFHhBtm5OcH-FZV_kW')
      // web3.eth.sendSignedTransaction(signature, (err, txHash) => {
      //     console.log(err)
      //     console.log('txHash:', txHash)
      //     // Now go check etherscan to see the transaction!
      //   })
      // const msgParams = result.typedData;
      // console.log(msgParams)
      // var method = 'eth_signTypedData_v4';
      // if (web3){
      //     (web3.givenProvider as any).sendAsync({
      //         method: 'eth_signTypedData',
      //         params: [msgParams,address],
      //         from: address,
      //       }, function (err:any, result:any) {
      //         if (err) return console.error(err)
      //         if (result.error) {
      //           return console.error(result.error.message)
      //         }
      //         // const recovered = sigUtil.recoverTypedSignature({
      //         //   data: msgParams,
      //         //   sig: result.result
      //         // })
      //         // if (recovered === address ) {
      //         //   alert('Recovered signer: ' + address)
      //         // } else {
      //         //   alert('Failed to verify signer, got: ' + result)
      //         // }
      //       })

      // await new  ethers.providers.AlchemyProvider("maticmum", "oCg7K_rQwFRVdDpFHhBtm5OcH-FZV_kW").sendTransaction(signature)
      // const res = Dialog.alert({
      //     content: 'Post Success!',
      //     confirmText: 'Got it',
      //     onConfirm: () => {
      //       router.push('/pomp_lens/profile');
      //     }
      //   });
    }
  };
  async function fetchProfile() {
    const allOwnedProfiles = await lensClient.profile.fetchAll({
      ownedBy: [address!.toString()],
      limit: 1,
    });

    setProfile(allOwnedProfiles.items[0]);
    console.log(allOwnedProfiles.items[0]);
    // form.setFieldsValue({
    //     id:"message",
    //     Value: allOwnedProfiles.items[0].handle.split(".")[0] + " met with ___ today at "+EventName+" , it was great fun!"
    // })
  }

  const handleUpload = async (file: File): Promise<ImageUploadItem> => {
    setShowWarning(false);
    var ipfsImageUrl = "";
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
        ipfsImageUrl = `https://${rootCid}.ipfs.w3s.link/${file.name}`;

        setImageURL(ipfsImageUrl);
        //   if (typedDataResult){
        //     notification({
        //     type: 'success',
        //     title: 'Post Success',
        //     position: 'topR'}
        //     )
        //   }
        //   else{
        //     notification({
        //         type: 'error',
        //         title: 'Post Failed',
        //         message:JSON.stringify(typedDataResult),
        //         position: 'topR'}
        //     )
        //   }
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
          <Connected />
          <Result
            icon={<SmileOutline />}
            status="success"
            // title={"You two met at the " + EventName}
            title={
              "Mint a POMP (Proof of Meet Protocol) SBT which will be stored permanently!"
            }
          />

          {Boolean(fileList?.length) ? (
            <Form onFinish={postNFT}>
              <Form.Item
                name="message"
                label="message"
                rules={[{ required: true }]}
              >
                <TextArea
                  placeholder="Please enter who u meet with"
                  id="message"
                />
              </Form.Item>
              <Button block color="primary" type="submit">
                Post
              </Button>
            </Form>
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

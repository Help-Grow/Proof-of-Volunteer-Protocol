import { Web3Storage } from "web3.storage";
import { Web3StorageApi } from "@/constants";

export const convertBase64 = (file: Blob) =>
  new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);

    fileReader.onload = () => {
      resolve(fileReader.result);
    };

    fileReader.onerror = (error) => {
      reject(error);
    };
  });

export async function postData(url: string, data: any) {
  const response = await fetch(url, {
    method: "POST",
    mode: "cors",
    body: JSON.stringify(data),
    headers: new Headers({
      "Content-Type": "application/json",
      Accept: "application/json",
    }),
  });

  const json = await response.json();
  return json;
}

export const formatBalance = (rawBalance: string) => {
  const balance = (parseInt(rawBalance) / 1000000000000000000).toFixed(2);
  return balance;
};

export const formatChainAsNum = (chainIdHex: string) => {
  const chainIdNum = parseInt(chainIdHex);
  return chainIdNum;
};

export const formatAddress = (addr: string) => {
  return `${addr.substring(0, 8)}...`;
};

/**
 * get POVP protocol raw data
 * @param imgUrl the upload image url. should be ipfs url or arweave url
 * @param email the volunteer email
 */
export const getPOVPRawData = (imgUrl: string, email: string) => ({
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

export const uploadToIPFS = async (file: Blob) => {
  try {
    const client = new Web3Storage({ token: Web3StorageApi });
    const rootCid = await client.put([file]);
    const ipfsUrl = `https://${rootCid}.ipfs.w3s.link/${file.name}`;
    console.log("ipfs upload success, url:", ipfsUrl);
    return ipfsUrl;
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message);
    }
  }
};

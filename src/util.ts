import { Web3Storage } from "web3.storage";
import { Web3StorageApi } from "@/constants";
import { WebBundlr } from "@bundlr-network/client";
import { fetchSigner } from "wagmi/actions";

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
  const client = new Web3Storage({ token: Web3StorageApi });
  const rootCid = await client.put([file]);
  const ipfsUrl = `https://${rootCid}.ipfs.w3s.link/${file.name}`;
  console.log("ipfs upload success, url:", ipfsUrl);
  return ipfsUrl;
};

/**
 * Creates a new Bundlr object that will then be used by other
 * utility functions. This is where you set your node address and currency.
 *
 * @returns A reference to a Bundlr object
 */
export const getBundlr = async () => {
  const signer = await fetchSigner();
  const provider = signer?.provider;
  // use method injection to add the missing function
  // @ts-ignore
  provider.getSigner = () => signer;
  const bundlr = new WebBundlr(
    "https://devnet.bundlr.network",
    "matic",
    signer?.provider
  );
  await bundlr.ready();
  return bundlr;
};

const convertFileToBuffer = (file: File): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const blob = new Blob([reader.result as ArrayBuffer]);
      const fileReader = new FileReader();
      fileReader.onload = () => {
        const buffer = Buffer.from(fileReader.result as ArrayBuffer);
        resolve(buffer);
      };
      fileReader.readAsArrayBuffer(blob);
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Uploads an image to Bundlr.
 *
 * @param {*} fileToUpload The file to be uploaded.
 * @param {*} fileType The mime-type of the file to be uploaded.
 * @returns
 */
export const uploadToArweave = async (fileToUpload: File) => {
  // Get a refernce to the WebBundlr singleton
  const bundlr = await getBundlr();

  // Convert to a data stream
  const dataStream = await convertFileToBuffer(fileToUpload);
  // Get the const to upload
  const price = await bundlr.getPrice(fileToUpload.size);
  // Get the amount currently funded for this user on a Bundlr node
  const balance = await bundlr.getLoadedBalance();

  console.log("price", price.toNumber());
  console.log("balance", balance.toNumber());

  // Only fund if needed
  if (price.isGreaterThanOrEqualTo(balance)) {
    console.log("Funding node.");
    const res = await bundlr.fund(price);

    console.log("fund res", res);
  } else {
    console.log("Funding not needed, balance sufficient.");
  }

  const tx = await bundlr.upload(dataStream, {
    tags: [{ name: "Content-Type", value: fileToUpload.type }],
  });

  console.log(`File uploaded ==> https://arweave.net/${tx.id}`);

  return "https://arweave.net/" + tx.id;
};

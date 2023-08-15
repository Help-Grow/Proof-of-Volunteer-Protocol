// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  result: any;
};

// do not parse the body of response to allow the raw data
export const config = {
  api: {
    responseLimit: false,
    bodyParser: false,
  },
};

async function toDataURL_node(url: string) {
  let response = await fetch(url);
  let buffer = await response.text();
  return buffer;
}

const get = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  try {
    const { fileResId } = req.query;
    const fileBuffer = await toDataURL_node(
      "https://arseed.web3infra.dev/" + fileResId
    );
    res.status(200).send({ result: fileBuffer });
  } catch (err) {
    console.log("error: ", err);
    res.status(500).send({ result: "error" });
  }
};

export default function upload(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  req.method === "GET"
    ? get(req, res)
    : res.status(404).send({ result: "only get" });
}

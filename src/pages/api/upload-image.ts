// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { submitByApikey } from "arseeding-js";
import type { NextApiRequest, NextApiResponse } from "next";
// import formidable from 'formidable';
// import fs from 'fs';

type Data = {
  name?: string;
  result: any;
};

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "20mb",
    },
  },
};

// async function submitImage(imageFile: File & { filepath: string; mimetype: string }) {
function submitImage(imageData: string, imageType: string) {
  const arseedingUrl = "https://arseed.web3infra.dev";
  const apikey = "18a850a9-28b6-4abc-abbd-1b8c2aad9b5e";
  // read the file buffer from its path
  const data = Buffer.from(imageData);
  const contentType = "image/" + imageType;
  const tags = { fileType: "image", imageType: imageType };
  // const data = fs.readFileSync(imageFile.filepath);
  // const contentType = imageFile.mimetype;
  // const tags = { fileType: 'image', imageType: imageFile.mimetype };
  return submitByApikey(arseedingUrl, apikey, data, contentType, tags);
}

const post = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  try {
    const { content: base64, fileName } = req.body;
    const match = base64.match(/(?<=data:image\/)\w+/g);

    // const fData = await new Promise<{ fields: any; files: any }>((resolve) => {
    //   // extract the file with formidable
    //   const form = new formidable.IncomingForm();
    //   form.parse(req, (err, fields, files) => {
    //     if (err) {
    //       console.error(err);
    //       res.status(500).send({ result: 'Upload failed' });
    //       return;
    //     }
    //     resolve({ fields, files });
    //   });
    // });

    // const imageFile = fData.files.imageFile;

    submitImage(base64, match[0]).then(
      (resFromArseed) => {
        console.log(resFromArseed);
        res
          .status(200)
          .send({
            name: "save file " + fileName + " success",
            result: resFromArseed,
          });
      },
      (error) => {
        console.log("error: ", error);
        res.status(500).send({ result: error });
      }
    );
  } catch (err) {
    res.status(500).send({ result: "error" });
  }
};

export default function upload(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  req.method === "POST"
    ? post(req, res)
    : res.status(404).send({ result: "only post" });
}

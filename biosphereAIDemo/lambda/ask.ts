import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import {
  BedrockRuntimeClient,
  ConverseCommand,
} from "@aws-sdk/client-bedrock-runtime";

const s3 = new S3Client();
const bedrock = new BedrockRuntimeClient();
const BUCKET_NAME = process.env.BUCKET_NAME!;
const MODEL_ID = process.env.MODEL_ID!;

export const handler = async (event: any) => {
  try {
    const { question } = JSON.parse(event.body || "{}");
    if (!question) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing question field" }) };
    }

    // List and read all .txt files
    const listRes = await s3.send(new ListObjectsV2Command({ Bucket: BUCKET_NAME }));
    const txtKeys = (listRes.Contents || [])
      .map((o) => o.Key!)
      .filter((k) => k.endsWith(".txt"));

    const docs = await Promise.all(
      txtKeys.map(async (key) => {
        const res = await s3.send(new GetObjectCommand({ Bucket: BUCKET_NAME, Key: key }));
        return res.Body!.transformToString();
      })
    );

    const context = docs.join("\n\n---\n\n");

    const response = await bedrock.send(
      new ConverseCommand({
        modelId: MODEL_ID,
        system: [
          {
            text: "You are a helpful educational assistant about Biosphere 2. Only answer using the provided documents. Use exact numbers, dates, and facts from the documents. If the answer is not in the documents, say \"I don't know.\"",
          },
        ],
        messages: [
          {
            role: "user",
            content: [
              {
                text: `Documents:\n${context}\n\nQuestion: ${question}`,
              },
            ],
          },
        ],
      })
    );

    const answer =
      response.output?.message?.content?.[0]?.text ?? "No response from model.";

    return { statusCode: 200, body: JSON.stringify({ answer }) };
  } catch (err: any) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};

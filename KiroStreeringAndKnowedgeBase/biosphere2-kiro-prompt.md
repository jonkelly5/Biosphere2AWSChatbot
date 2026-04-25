# Biosphere 2 Educational Q&A Application

## Goal
Build a serverless application using AWS CDK (TypeScript) that deploys a Lambda function behind an API Gateway. The Lambda reads plain text documents from an S3 bucket, stuffs their content into a prompt, and sends it to Amazon Bedrock to answer user questions about Biosphere 2. This is an educational application for University of Arizona students.

## Architecture
```
User (HTTP POST) → API Gateway → Lambda → Bedrock (Claude)
                                   ↑
                                S3 Bucket (plain text documents)
```

## Requirements

### CDK Stack (TypeScript, single stack)
- S3 bucket for storing plain text document files (private, encrypted with AES256, versioning enabled)
- Lambda function (Node.js 22.x runtime) with:
  - IAM permissions to call `bedrock:InvokeModel` on both `arn:aws:bedrock:*::foundation-model/*` and `arn:aws:bedrock:*:<account-id>:inference-profile/*` (inference profile model IDs resolve to a different ARN pattern than bare foundation model IDs)
  - IAM permissions to read from the S3 bucket (`s3:GetObject`, `s3:ListBucket`)
  - Environment variables: `BUCKET_NAME` (the S3 bucket name), `MODEL_ID` set to `us.anthropic.claude-haiku-4-5-20251001-v1:0`
  - 30 second timeout, 512MB memory
- HTTP API Gateway (API Gateway v2) with a POST route `/ask` integrated with the Lambda
- CfnOutputs for the API endpoint URL and S3 bucket name
- Use `NodejsFunction` from `aws-cdk-lib/aws-lambda-nodejs` to bundle the Lambda TypeScript code automatically. Include `esbuild` as a devDependency in package.json so that `NodejsFunction` can bundle locally without falling back to Docker.
- Deploy to `us-west-2`

### Lambda Function (TypeScript)
- On each request:
  1. Parse the JSON body to get a `question` field
  2. List all `.txt` files in the S3 bucket
  3. Read each text file from S3
  4. Construct a prompt that includes all document text as context, with a system message instructing the model to only answer from the provided documents, use exact numbers/dates/facts, and say "I don't know" if the answer isn't in the documents
  5. Call Bedrock using the `@aws-sdk/client-bedrock-runtime` `ConverseCommand` (not the older `InvokeModel` API) with the model ID from the environment variable
  6. Return the model's response as JSON `{ "answer": "..." }`
- Handle errors gracefully and return appropriate HTTP status codes

### Important Technical Notes
- Use the Bedrock **Converse API** (`ConverseCommand`), not `InvokeModel`. The Converse API is model-agnostic and uses a standard message format.
- The model ID `us.anthropic.claude-haiku-4-5-20251001-v1:0` is an inference profile ID (required for newer models instead of bare model IDs).
- The `@aws-sdk/client-bedrock-runtime` and `@aws-sdk/client-s3` packages are available in the Lambda Node.js 22.x runtime — they do NOT need to be bundled. Mark them as external dependencies in the NodejsFunction bundling config.
- Do NOT create any Bedrock agents, knowledge bases, or vector stores. The Lambda calls the foundation model directly.

## Reference Projects
These existing projects demonstrate similar patterns:
- https://github.com/aws-samples/amazon-serverless-chatbot-using-bedrock — CDK + Lambda + Bedrock InvokeModel (Python, see lambda2/textgen.py)
- https://github.com/san99tiago/aws-cdk-bedrock-lambda-poc — CDK + Lambda + Bedrock (Python)
- https://sbstjn.com/blog/aws-cdk-amazon-bedrock-lambda-generative-ai/ — CDK + Lambda + API Gateway + Bedrock (TypeScript)

## Project Structure
```
biosphere2-app/
├── bin/
│   └── app.ts              # CDK app entrypoint
├── lib/
│   └── biosphere2-stack.ts # Single CDK stack
├── lambda/
│   └── ask.ts              # Lambda handler
├── cdk.json
├── tsconfig.json
└── package.json
```

## Testing
After deployment:
1. Upload Biosphere 2 content as a .txt file to the S3 bucket: `aws s3 cp biosphere2.txt s3://<bucket-name>/`
2. Test with: `curl -X POST <api-url>/ask -H "Content-Type: application/json" -d '{"question": "When did construction of Biosphere 2 begin?"}'`

## Additional Notes
This is an educational application, so prioritize simple code and moving fast over production-level security and long-term maintainability.

Deploy to AWS account 536573256536 in us-west-2.

If any instructions are unclear, stop and ask for clarification before proceeding.

# Biosphere 2 Static Website Addition

## Goal
Add a static website frontend to the existing Biosphere 2 Q&A application. The website should be served from a private S3 bucket via CloudFront, with CloudFront also proxying the `/ask` API route so the browser talks to a single domain (no CORS needed).

## Prerequisites
This assumes the Biosphere 2 CDK stack from the first prompt is already built, with:
- S3 documents bucket
- Lambda function with API Gateway v2 HTTP API (`/ask` POST route)
- All deployed and working

## Architecture
```
Browser → CloudFront → S3 Website Bucket (private, OAC)
                ↘
            API Gateway /ask (proxied, same domain)
```

## Requirements

### CDK Stack Changes (add to existing stack)
- New S3 bucket for static website files (private, block all public access, `RemovalPolicy.DESTROY`, `autoDeleteObjects: true`)
- CloudFront distribution with:
  - Default behavior: S3 website bucket origin using `S3BucketOrigin.withOriginAccessControl()` (OAC — bucket stays fully private, no public access)
  - `/ask` additional behavior: API Gateway origin (`HttpOrigin` using `<apiId>.execute-api.<region>.amazonaws.com`), caching disabled, all HTTP methods allowed, `OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER`
  - `defaultRootObject: "index.html"`
  - Viewer protocol policy: redirect to HTTPS on both behaviors
- `BucketDeployment` from `aws-cdk-lib/aws-s3-deployment` to upload the `website/` directory to the website bucket, with CloudFront distribution invalidation (`distributionPaths: ["/*"]`)
- New CfnOutput `WebsiteUrl` with the CloudFront distribution domain name

### Static Website (`website/index.html`)
- Simple single-page HTML file with:
  - Text input and submit button to ask questions
  - Calls `/ask` via relative fetch (no absolute URL needed since CloudFront proxies both the site and API)
  - Displays Q&A history on the page (newest first), in-memory only (no persistence across page refreshes)
  - Each entry shows the question and the response
  - Show "Thinking..." while waiting for a response
  - Handle errors gracefully
- Keep it simple — single HTML file with inline CSS and JS, no build tools

### Important Technical Notes
- Do NOT enable S3 static website hosting on the bucket. CloudFront with OAC reads directly from S3 via the S3 API, not the website endpoint.
- The `/ask` CloudFront behavior must have caching disabled (`CachePolicy.CACHING_DISABLED`) since it's a POST endpoint.
- CloudFront distributions take a few minutes to provision on first deploy.

## Project Structure (additions)
```
biosphere2-app/
├── website/
│   └── index.html          # Static frontend
├── lib/
│   └── biosphere2-stack.ts # Updated with CloudFront + website bucket
└── ... (existing files unchanged)
```

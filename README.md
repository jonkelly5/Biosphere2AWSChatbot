# Biosphere2AWSChatbot
The project created as part of the Amazon AWS HackAZ demo. 
https://hack.arizona.edu/workshops

# Getting started

1. Create AWS account and IAM user and configure access keys in your terminal with `aws configure`
 - https://docs.aws.amazon.com/cli/v1/userguide/cli-authentication-user.html
3. Replace {AWS-Account-id} in the project with your accountId
4. `npm install`
5. `cdk bootstrap`
6. `cdk deploy`

# Testing

Run `curl -X POST {API-Gateway-Invoke-URL}/ask  -H "Content-Type: application/json" -d '{"question": "When did construction of Biosphere 2 begin?"}'` in your terminal
- Get your {API-Gateway-Invoke-URL} from the console in APIGateway -> Deploy -> Stages

Vist https://{CloudfrontDistrbution Domain Id}.cloudfront.net
- Get your CloudfrontDistrbution domain name from the console in Cloudfront -> Distribution -> your distribution -> Distribution domain name

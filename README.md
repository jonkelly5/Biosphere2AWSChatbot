# Biosphere2AWSChatbot
The project created as part of the Amazon AWS HackAZ demo. 
https://hack.arizona.edu/workshops

# Getting started

1. Create AWS account and IAM user
   - https://docs.aws.amazon.com/cli/v1/userguide/cli-authentication-user.html
2. Configure access keys in your terminal with `aws configure`
3. Clone this git repo to your local
4. Go into the code directory `cd Biosphere2AWSChatbot/biosphereAIDemo/`
5. In bin/app.ts replace {AWS-Account-id} with your accountId 
6. `npm install`
7. `cdk bootstrap`
8. `cdk deploy`
 - Confirm the infrstrucutre changes with "Y"
 - This will take 5-10 minutes to deploy


# Testing

Run `curl -X POST {API-Gateway-Invoke-URL}/ask  -H "Content-Type: application/json" -d '{"question": "When did construction of Biosphere 2 begin?"}'` in your terminal
- Get your {API-Gateway-Invoke-URL} from the console in APIGateway -> Deploy -> Stages

Vist https://{CloudfrontDistrbution Domain Id}.cloudfront.net
- Get your CloudfrontDistrbution domain name from the console in Cloudfront -> Distribution -> your distribution -> Distribution domain name

# Debugging

If deployment fails check the "Biosphere2Stack" stack in cloudformation via the aws console (website)

#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { Biosphere2Stack } from "../lib/biosphere2-stack";

const app = new cdk.App();
new Biosphere2Stack(app, "Biosphere2Stack", {
  env: { account: "{AWS-Account-id}", region: "us-west-2" },
});

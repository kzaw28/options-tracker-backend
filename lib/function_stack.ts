import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as iam from "aws-cdk-lib/aws-iam";

import { LambdaIntegration } from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";
import { globals } from "./globals";
import { env } from "process";

interface LambdaStackProps extends cdk.StackProps {
  lambdaRole: iam.IRole;
  userPoolClientId: string;
  userPoolId?: string;
}

export class LambdaStack extends cdk.Stack {
  public readonly lambdaIntegration: LambdaIntegration;

  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);

    let envVariables: Record<string, string> = {
      SNS_TOPIC_ARN: globals.snsTopicArn,
      USER_POOL_CLIENT_ID: props.userPoolClientId,
    };
    if (props.userPoolId) {
      envVariables.USER_POOL_ID = props.userPoolId;
    }

    // API Gateway Lambda ----------------------------------------
    const ApiLambda = new lambda.Function(this, "ApiHandler", {
      functionName: "ApiHandler",
      runtime: lambda.Runtime.NODEJS_22_X,
      code: lambda.Code.fromAsset("lambda/api"), // Assuming your Lambda code is in the 'lambda' directory
      handler: "index.handler",
      environment: envVariables,
      role: props.lambdaRole,
      timeout: cdk.Duration.seconds(60),
    });

    // Lambda integration for API Gateway
    this.lambdaIntegration = new LambdaIntegration(ApiLambda);
  }
}
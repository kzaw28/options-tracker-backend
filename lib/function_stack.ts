import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as iam from "aws-cdk-lib/aws-iam";


import { LambdaIntegration } from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";
import { globals } from "./globals";

interface LambdaStackProps extends cdk.StackProps {
  lambdaRole: iam.IRole;
}

export class LambdaStack extends cdk.Stack {
  public readonly lambdaIntegration: LambdaIntegration;

  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);

    let envVariables = {
      SNS_TOPIC_ARN: globals.snsTopicArn
    };

    // API Gateway Lambda
    const ApiLambda = new lambda.Function(this, "ApiHandler", {
      functionName: "ApiHandler",
      runtime: lambda.Runtime.NODEJS_22_X,
      code: lambda.Code.fromAsset("lambda"), // Assuming your Lambda code is in the 'lambda' directory
      handler: "api_handler.handler",
      environment: envVariables,
      role: props.lambdaRole,
      timeout: cdk.Duration.seconds(60),
    });

    // Create the Lambda integration for API Gateway
    this.lambdaIntegration = new LambdaIntegration(ApiLambda);


    // ----------------------------------------------------------------
    // // Define the Lambda function
    // const brokerLambdaFunction = new lambda.Function(
    //   this,
    //   "brokerLambdaFunction",
    //   {
    //     functionName: "brokerLambdaFunction",
    //     runtime: lambda.Runtime.NODEJS_18_X,
    //     code: lambda.Code.fromAsset("lambda"), // Assuming your Lambda code is in the 'lambda' directory
    //     handler: "index.handler",
    //     role: props.lambdaRole,
    //     environment: envVariables,
    //     timeout: cdk.Duration.seconds(60)
    //   }
    // );
    
  }
}
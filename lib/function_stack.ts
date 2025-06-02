import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import * as iam from "aws-cdk-lib/aws-iam";
import { globals } from "./globals";

interface LambdaStackProps extends cdk.StackProps {
  lambdaRole: iam.IRole;
}

export class LambdaStack extends cdk.Stack {
  public readonly workerLambdaFunction: lambda.Function;
  public readonly workerLambdaFunction2: lambda.Function;

  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);

    let envVariables = {
      SNS_TOPIC_ARN: globals.snsTopicArn
    };

    // Define the Lambda function
    const brokerLambdaFunction = new lambda.Function(
      this,
      "brokerLambdaFunction",
      {
        functionName: "brokerLambdaFunction",
        runtime: lambda.Runtime.NODEJS_18_X,
        code: lambda.Code.fromAsset("lambda"), // Assuming your Lambda code is in the 'lambda' directory
        handler: "index.handler",
        role: props.lambdaRole,
        environment: envVariables,
        reservedConcurrentExecutions: 1,
        timeout: cdk.Duration.seconds(60)
      }
    );
  }
}
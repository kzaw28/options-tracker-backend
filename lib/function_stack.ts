import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as iam from "aws-cdk-lib/aws-iam";

import { LambdaIntegration } from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";
import { globals } from "./globals";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

interface LambdaStackProps extends cdk.StackProps {
  lambdaRole: iam.IRole;
  userTable: dynamodb.Table;
  optionTable: dynamodb.Table;
  userPoolClientId: string; // Optional, if you need to pass the User Pool Client ID
}

export class LambdaStack extends cdk.Stack {
  public readonly lambdaIntegration: LambdaIntegration;

  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);

    let envVariables = {
      SNS_TOPIC_ARN: globals.snsTopicArn,
      USER_POOL_CLIENT_ID: props.userPoolClientId,
      USER_TABLE_NAME: props.userTable.tableName,
      OPTION_TABLE_NAME: props.optionTable.tableName,
    };

    // API Gateway Lambda
    const ApiLambda = new lambda.Function(this, "ApiHandler", {
      functionName: "ApiHandler",
      runtime: lambda.Runtime.NODEJS_22_X,
      code: lambda.Code.fromAsset("lambda/api"), // Assuming your Lambda code is in the 'lambda' directory
      handler: "index.handler",
      environment: envVariables,
      role: props.lambdaRole,
      timeout: cdk.Duration.seconds(60),
    });

    // Grant Lambda permission to read/write from DynamoDB tables
    props.userTable.grantReadWriteData(ApiLambda);
    props.optionTable.grantReadWriteData(ApiLambda);

    // Lambda integration for API Gateway
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

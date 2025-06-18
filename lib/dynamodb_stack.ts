import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";

export class DynamoDBStack extends cdk.Stack {
  public readonly user: dynamodb.Table;
  public readonly option: dynamodb.Table;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.user = new dynamodb.Table(this, "User", {
      partitionKey: { name: "email", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      tableName: "User",
      removalPolicy: cdk.RemovalPolicy.DESTROY, //TODO: Discuss for production
    });

    this.option = new dynamodb.Table(this, "Option", {
      partitionKey: { name: "optionName", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "email", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      tableName: "Option",
      removalPolicy: cdk.RemovalPolicy.DESTROY, //TODO: Discuss for production
    });
  }
}

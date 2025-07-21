import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { User } from "../types/user";

const REGION = "us-east-2";
const client = new DynamoDBClient({ region: REGION });
const dynamo = DynamoDBDocumentClient.from(client);

export async function createUser(user: User, tableName: string): Promise<void> {
  await dynamo.send(
    new PutCommand({
      TableName: tableName,
      Item: user,
    })
  );
}

export async function updateUser(
  email: string,
  tableName: string
): Promise<void> {
  await dynamo.send(
    new UpdateCommand({
      TableName: tableName,
      Key: { email },
      UpdateExpression:
        "SET updatedAt = :updatedAt, lastLoginAt = :lastLoginAt",
      ExpressionAttributeValues: {
        ":updatedAt": new Date().toISOString(),
        ":lastLoginAt": new Date().toISOString(),
      },
    })
  );
}

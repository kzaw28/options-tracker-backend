import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { docClient } from "../utils/dynamoClient";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { jwtDecode } from "jwt-decode";

const TABLE_NAME = process.env.OPTIONS_TABLE_NAME!;

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // 1. Get JWT from Authorization header
    const token = event.headers.Authorization || event.headers.authorization;
    if (!token) return { statusCode: 401, body: "Unauthorized" };

    // 2. Decode JWT to get email (or use a library to verify)
    const decoded: any = jwtDecode(token.replace("Bearer ", ""));
    const email = decoded.email;
    if (!email) return { statusCode: 400, body: "Invalid token" };

    // 3. Parse and validate body
    const option = JSON.parse(event.body || "{}");
    // ...validate fields... Validation logic can be added here

    // 4. Write to DynamoDB
    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          ...option,
          email,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      })
    );

    return {
      statusCode: 201,
      body: JSON.stringify({ message: "Option added" }),
    };
  } catch (err: any) {
    return { statusCode: 500, body: JSON.stringify({ message: err.message }) };
  }
};

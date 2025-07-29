import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { deleteOption } from "../utils/dynamoClient";
import { CognitoJwtVerifier } from "aws-jwt-verify";
import { CognitoIdTokenPayload } from "aws-jwt-verify/jwt-model";

const JSON_HEADERS = {
  'Content-Type': 'application/json',
};

const TABLE_NAME = "Option";
const USER_POOL_ID = process.env.USER_POOL_ID!;
const CLIENT_ID  = process.env.USER_POOL_CLIENT_ID!;

const verifier = CognitoJwtVerifier.create({
  userPoolId: USER_POOL_ID,
  tokenUse: "id",
  clientId: CLIENT_ID,
});

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const token = event.headers.Authorization || event.headers.authorization;
    if (!token) {
      return {
        statusCode: 401,
        headers: JSON_HEADERS,
        body: JSON.stringify({ message: "Unauthorized: No token provided" }),
      };
    }

    const tokenValue = token.replace(/^Bearer\s+/i, "");
    const payload: CognitoIdTokenPayload = await verifier.verify(tokenValue);
    const email = String(payload.email);
    if (!email) {
      return {
        statusCode: 401,
        headers: JSON_HEADERS,
        body: JSON.stringify({ message: "Unauthorized: Invalid email" }),
      };
    }

    const optionName = event.pathParameters?.id;
    if (!optionName) {
      return {
        statusCode: 400,
        headers: JSON_HEADERS,
        body: JSON.stringify({ message: "Missing option ID" }),
      };
    }

    const deleted = await deleteOption(TABLE_NAME, optionName, email);
    if (!deleted) {
      return {
        statusCode: 404,
        headers: JSON_HEADERS,
        body: JSON.stringify({ message: "Option not found" }),
      };
    }

    return {
      statusCode: 200,
      headers: JSON_HEADERS,
      body: JSON.stringify({ message: "Option added successfully" })
    };
  } catch (error: any) {
    console.error("Error deleting option:", error);
    return {
      statusCode: 500,
      headers: JSON_HEADERS,
      body: JSON.stringify({
        message: "Failed to delete option",
        error: error.message || "An unexpected error occurred",
      }),
    };
  }
};

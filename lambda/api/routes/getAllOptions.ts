import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { getAllOptions } from "../utils/dynamoClient";
import { CognitoJwtVerifier } from "aws-jwt-verify";
import { CognitoIdTokenPayload } from "aws-jwt-verify/jwt-model";

const JSON_HEADERS = {
  'Content-Type': 'application/json',
};

const TABLE_NAME = "Option";
// ***************************************************
// const TABLE_NAME = process.env.OPTIONS_TABLE_NAME!;
// ***************************************************

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

    // Fetch all options for this user
    const items = await getAllOptions(TABLE_NAME, email);

    return {
      statusCode: 200,
      headers: JSON_HEADERS,
      body: JSON.stringify({ options: items }),
    };

  } catch (error: any) {
    console.error("Error fetching options:", error);
    return {
      statusCode: 500,
      headers: JSON_HEADERS,
      body: JSON.stringify({
        message: "Failed to fetch options",
        error: error.message || "An unexpected error occurred",
      }),
    };
  }
};

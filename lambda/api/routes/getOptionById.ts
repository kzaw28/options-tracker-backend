import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { getOptionById } from "../utils/dynamoClient";
import { CognitoJwtVerifier } from "aws-jwt-verify";
import { CognitoIdTokenPayload } from "aws-jwt-verify/jwt-model";

const JSON_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Headers": "Content-Type,Authorization"
};
const TABLE_NAME   = "Option";
// const TABLE_NAME = process.env.OPTIONS_TABLE_NAME!;
const USER_POOL_ID = process.env.USER_POOL_ID!;
const CLIENT_ID    = process.env.USER_POOL_CLIENT_ID!;

const verifier = CognitoJwtVerifier.create({
  userPoolId:   USER_POOL_ID,
  tokenUse:     "id",
  clientId:     CLIENT_ID,
});

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // 1) Auth
    const token = event.headers.Authorization || event.headers.authorization;
    if (!token) {
      return { statusCode: 401, headers: JSON_HEADERS, body: JSON.stringify({ message: "No token" }) };
    }
    const payload = await verifier.verify(token.replace(/^Bearer\s+/i, ""));
    const email   = String((payload as CognitoIdTokenPayload).email);
    if (!email) {
      return { statusCode: 401, headers: JSON_HEADERS, body: JSON.stringify({ message: "Invalid email" }) };
    }

    // 2) Pull `id` from pathParameters
    const id = event.pathParameters?.id;
    if (!id) {
      return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ message: "Missing option ID" }) };
    }

    // 3) Fetch and return
    const item = await getOptionById(TABLE_NAME, id, email);
    if (!item) {
      return { statusCode: 404, headers: JSON_HEADERS, body: JSON.stringify({ message: "Not found" }) };
    }

    return {
      statusCode: 200,
      headers: JSON_HEADERS,
      body: JSON.stringify({ option: item }),
    };

  } catch (e: any) {
    console.error("Error fetching option by id:", e);
    return {
      statusCode: 500,
      headers: JSON_HEADERS,
      body: JSON.stringify({ message: "Failed to fetch", error: e.message }),
    };
  }
};

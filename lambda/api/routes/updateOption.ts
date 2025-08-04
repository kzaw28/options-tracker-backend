import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { updateOption } from "../utils/dynamoClient";
import { CognitoJwtVerifier } from "aws-jwt-verify";
import { CognitoIdTokenPayload } from "aws-jwt-verify/jwt-model";

const JSON_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Headers": "Content-Type,Authorization"
};

const TABLE_NAME   = "Option";  // or process.env.OPTION_TABLE_NAME!
const USER_POOL_ID = process.env.USER_POOL_ID!;
const CLIENT_ID    = process.env.USER_POOL_CLIENT_ID!;

const verifier = CognitoJwtVerifier.create({
  userPoolId: USER_POOL_ID,
  tokenUse: "id",
  clientId: CLIENT_ID,
});

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // ─── 1) Auth
    const raw = event.headers.Authorization || event.headers.authorization;
    if (!raw) {
      return { statusCode: 401, headers: JSON_HEADERS, body: JSON.stringify({ message: "No token" }) };
    }
    const payload = await verifier.verify(raw.replace(/^Bearer\s+/i, ""));
    const email   = String((payload as CognitoIdTokenPayload).email);
    if (!email) {
      return { statusCode: 401, headers: JSON_HEADERS, body: JSON.stringify({ message: "Invalid email" }) };
    }

    // ─── 2) Path param
    const id = event.pathParameters?.id;
    if (!id) {
      return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ message: "Missing option ID" }) };
    }

    // ─── 3) Body & update
    const updates = JSON.parse(event.body || "{}");
    if (Object.keys(updates).length === 0) {
      return {
        statusCode: 400,
        headers: JSON_HEADERS,
        body: JSON.stringify({ message: "No fields to update" }),
      };
    }

    const updated = await updateOption(TABLE_NAME, id, email, updates);

    return {
      statusCode: 200,
      headers: JSON_HEADERS,
      body: JSON.stringify({ message: "Updated successfully", option: updated }),
    };
  } catch (e: any) {
    console.error("Error updating option:", e);
    return {
      statusCode: 500,
      headers: JSON_HEADERS,
      body: JSON.stringify({ message: "Failed to update", error: e.message }),
    };
  }
};

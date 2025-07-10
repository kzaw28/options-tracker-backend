import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { putOption } from "../utils/dynamoClient";
import { CognitoJwtVerifier } from "aws-jwt-verify";
import { CognitoIdTokenPayload } from "aws-jwt-verify/jwt-model";

const JSON_HEADERS = {
  'Content-Type': 'application/json',
};

const TABLE_NAME = "Option"; 
// ***************************************************
// const TABLE_NAME = process.env.OPTIONS_TABLE_NAME!;
// Temporary: Change to this when dynamoDb stack is created
// ***************************************************
const USER_POOL_ID = process.env.USER_POOL_ID!;
const CLIENT_ID  = process.env.USER_POOL_CLIENT_ID!;

const verifier = CognitoJwtVerifier.create({
  userPoolId: USER_POOL_ID,
  tokenUse: "id",
  clientId: CLIENT_ID,
});

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const token = event.headers.Authorization || event.headers.authorization;
    if (!token) {
      return {
        statusCode: 401,
        headers: JSON_HEADERS,
        body: JSON.stringify({
          message: "Unauthorized: No token provided",
        }),
      };
    }
    
    const tokenValue = token.replace("Bearer ", "");
    // Verify the JWT token
    const payload: CognitoIdTokenPayload = await verifier.verify(tokenValue);
    const email = String(payload.email); // Cast to string?

    if (!email) {
      return {
        statusCode: 401,
        headers: JSON_HEADERS,
        body: JSON.stringify({
          message: "Unauthorized: Invalid email",
        }),
      };
    }

    const body = JSON.parse(event.body || '{}');
    
    await putOption(TABLE_NAME, body, email);

    return {
      statusCode: 200,
      headers: JSON_HEADERS,
      body: JSON.stringify({
        message: "Option added successfully",
      }),
    }

  } catch (error: any) {
    console.error("Error adding option:", error);
    return {
      statusCode: 500,
      headers: JSON_HEADERS,
      body: JSON.stringify({
        message: "Failed to add option",
        error: error.message || "An unexpected error occurred",
      }),
    }
  }
}
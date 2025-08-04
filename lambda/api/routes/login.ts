/**
 * Login Handler
 *
 * Endpoint: POST /api/auth/login
 *
 * Description:
 * Authenticates a user using AWS Cognito. Validates the user's username and password,
 * sends the credentials to Cognito, and returns tokens (if valid).
 *
 * Request Body:
 * {
 *   "username": "user@example.com",
 *   "password": "securepassword"
 * }
 *
 * Response:
 * 200 OK
 * {
 *   "tokens": { ...Cognito tokens... }
 * }
 *
 * Errors:
 * 400 Bad Request - Missing fields
 * 401 Unauthorized - Invalid credentials
 * 500 Internal Server Error - Server configuration or unexpected error
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { loginUser } from "../utils/cognitoClient";
import { User } from "../types/user";
import { updateUser } from "../utils/userDbClient";

const JSON_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",               // or your exact front-end URL
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Headers": "Content-Type,Authorization"
};

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const { password, email } = JSON.parse(event.body || "{}");

    // Input validation
    if (!password || !email) {
      return {
        statusCode: 400,
        headers: JSON_HEADERS,
        body: JSON.stringify({ message: "Missing password or email" }),
      };
    }

    // Ensyre clientId is set
    const clientId = process.env.USER_POOL_CLIENT_ID!;
    const userTable = process.env.USER_TABLE_NAME;

    if (!clientId || !userTable) {
      return {
        statusCode: 500,
        headers: JSON_HEADERS,
        body: JSON.stringify({
          message:
            "Server configuration error: USER_POOL_CLIENT_ID or USER_TABLE_NAME env variable is not set",
        }),
      };
    }

    // Attempt to log in the user
    const authResult = await loginUser({ email, password, clientId });
    if (!authResult) {
      return {
        statusCode: 401,
        headers: JSON_HEADERS,
        body: JSON.stringify({ message: "Invalid email or password" }),
      };
    }

    // Update user's last login time in DynamoDB
    await updateUser(email, userTable);

    // Successful login
    return {
      statusCode: 200,
      headers: JSON_HEADERS,
      body: JSON.stringify({ tokens: authResult }),
    };
  } catch (error: any) {
    // console.error('Login Error:', error);
    return {
      statusCode: 500,
      headers: JSON_HEADERS,
      body: JSON.stringify({
        message: "Login failed",
        error: error.message || "An unexpected error occurred",
      }),
    };
  }
};

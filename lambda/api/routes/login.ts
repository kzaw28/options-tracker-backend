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
};

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const { username, password } = JSON.parse(event.body || "{}");

    // Input validation
    if (!username || !password) {
      return {
        statusCode: 400,
        headers: JSON_HEADERS,
        body: JSON.stringify({ message: "Missing username or password" }),
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
    const authResult = await loginUser({ username, password, clientId });
    if (!authResult) {
      return {
        statusCode: 401,
        headers: JSON_HEADERS,
        body: JSON.stringify({ message: "Invalid username or password" }),
      };
    }

    // Update user's last login time in DynamoDB
    await updateUser(username, userTable);

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

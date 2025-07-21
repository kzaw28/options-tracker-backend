/**
 * Register Handler
 *
 * Endpoint: POST /api/auth/register
 *
 * Description:
 * Registers a new user using AWS Cognito. Validates the user's username, password, and email,
 * sends the registration data to Cognito, and returns a success message if registration is successful.
 *
 * Request Body:
 * {
 *   "username": "user@example.com",
 *   "password": "securepassword",
 *   "email": "user@example.com"
 * }
 *
 * Response:
 * 200 OK
 * {
 *   "message": "User created"
 * }
 *
 * Errors:
 * 400 Bad Request - Missing fields or user already exists
 * 500 Internal Server Error - Server configuration or unexpected error
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { registerUser } from "../utils/cognitoClient";
import { User } from "../types/user";
import { createUser } from "../utils/userDbClient";

const JSON_HEADERS = {
  "Content-Type": "application/json",
};

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const { username, password, email } = JSON.parse(event.body || "{}");

    // Input validation
    if (!username || !password || !email) {
      return {
        statusCode: 400,
        headers: JSON_HEADERS,
        body: JSON.stringify({
          message: "Missing username, password, or email",
        }),
      };
    }

    const clientId = process.env.USER_POOL_CLIENT_ID;
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

    await registerUser({ username, password, email, clientId });

    const newUser: User = {
      email,
      username,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      profilePictureUrl: "",
    };

    await createUser(newUser, userTable);

    return {
      statusCode: 200,
      headers: JSON_HEADERS,
      body: JSON.stringify({ message: "User created" }),
    };
  } catch (error: any) {
    // console.error('Register Error:', error);
    if (error.name === "UsernameExistsException") {
      return {
        statusCode: 400,
        headers: JSON_HEADERS,
        body: JSON.stringify({ message: "User already exists" }),
      };
    }
    return {
      statusCode: 500,
      headers: JSON_HEADERS,
      body: JSON.stringify({
        message: "Registration failed",
        error: error.message || "An unexpected error occurred",
      }),
    };
  }
};

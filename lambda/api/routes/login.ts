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
 

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { loginUser } from '../utils/cognitoClient';

const JSON_HEADERS = {
  'Content-Type': 'application/json',
};

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const { username, password } = JSON.parse(event.body || '{}');

        // Input validation
        if (!username || !password) {
        return {
            statusCode: 400,
            headers: JSON_HEADERS,
            body: JSON.stringify({ message: 'Missing username or password' }),
        };
        }

        // Ensyre clientId is set
        const clientId = process.env.USER_POOL_CLIENT_ID!;
        if (!clientId) {
            // console.error('USER_POOL_CLIENT_ID is not set');
            return {
                statusCode: 500,
                headers: JSON_HEADERS,
                body: JSON.stringify({ message: 'Server configuration error: USER_POOL_CLIENT_ID is not set' }),
            };
        }

        // Attempt to log in the user
        const authResult = await loginUser({ username, password, clientId });
        if (!authResult) {
            return {
                statusCode: 401,
                headers: JSON_HEADERS,
                body: JSON.stringify({ message: 'Invalid username or password' }),
            };
        }
        

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
            message: 'Login failed',
            error: error.message || 'An unexpected error occurred',
        }),
        };
    }
};

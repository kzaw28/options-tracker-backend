import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { registerUser } from '../utils/cognitoClient';

const JSON_HEADERS = {
    'Content-Type': 'application/json',
 };


export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const { username, password, email } = JSON.parse(event.body || '{}');

        // Input validation
        if (!username || !password || !email) {
        return {
            statusCode: 400,
            headers: JSON_HEADERS,
            body: JSON.stringify({ message: 'Missing username, password, or email' }),
        };
        }

        const clientId = process.env.USER_POOL_CLIENT_ID;
        if (!clientId) {
            // console.error('USER_POOL_CLIENT_ID is not set');
            return {
                statusCode: 500,
                headers: JSON_HEADERS,
                body: JSON.stringify({ message: 'Server configuration error: USER_POOL_CLIENT_ID is not set' }),
            };
        }


        await registerUser({ username, password, email, clientId });

        return {
            statusCode: 200,
            headers: JSON_HEADERS,
            body: JSON.stringify({ message: 'User created' }),
        };
    } catch (error: any) {
        // console.error('Register Error:', error);
        if (error.name === 'UsernameExistsException') {
            return {
                statusCode: 400,
                headers: JSON_HEADERS,
                body: JSON.stringify({ message: 'User already exists' }),
            };
        }
        return {
            statusCode: 500,
            headers: JSON_HEADERS,
            body: JSON.stringify({
                message: 'Registration failed',
                error: error.message || 'An unexpected error occurred',
            }),
        };
    }
};
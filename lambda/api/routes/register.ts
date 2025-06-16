import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { CognitoIdentityServiceProvider } from "aws-sdk";

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const { username, password, email } = JSON.parse(event.body || "{}");
        const cognito = new CognitoIdentityServiceProvider();

        await cognito.signUp(
            {
                ClientId: process.env.USER_POOL_CLIENT_ID!,
                Username: username,
                Password: password,
                UserAttributes: [{ Name: "email", Value: email }],
            }
        ).promise();

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "User created" }),
        };
    } catch (error: any) {
        console.error("Register Error:", error);
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "Registration failed",
                error: error.message || "An unexpected error occurred"
            })
        };
    }
};
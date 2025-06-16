import {
    APIGatewayProxyEvent,
    APIGatewayProxyResult, 
} from "aws-lambda";
import { CognitoIdentityServiceProvider } from "aws-sdk";

export const handler = async (
    event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
    try {
        const { username, password } = JSON.parse(event.body || "{}");
        console.log("Yello USER_POOL_CLIENT_ID =", process.env.USER_POOL_CLIENT_ID);
        const cognito = new CognitoIdentityServiceProvider();
        
        const auth = await cognito.initiateAuth(
            {
                AuthFlow: "USER_PASSWORD_AUTH",
                ClientId: process.env.USER_POOL_CLIENT_ID || "", // Ensure this is set in your environment variables
                AuthParameters: {
                    USERNAME: username,
                    PASSWORD: password,
                },
            }
        ).promise();

        return {
            statusCode: 200,
            body: JSON.stringify({ tokens: auth.AuthenticationResult }),
        };
    } catch (error: any) {
        console.error("Login error:", error);
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "Login failed",
                error: error.message || "An unexpected error occurred"
            })
        };
    }
}
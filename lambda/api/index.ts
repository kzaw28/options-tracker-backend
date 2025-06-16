import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { handler as login } from "./routes/login";
import { handler as register } from "./routes/register";

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {    
    try {
        const path = event.path; // The path of the request, e.g., "/api/auth/login"
        const method = event.httpMethod; // The HTTP method of the request, e.g., "POST"

        console.log("Received request:", { path, method, body: event.body });

        // Public Auth Endpoints
    
        if (path === "/api/auth/register" && method === "POST" ) return await register(event);
        if (path === "/api/auth/login" && method === "POST") return await login(event);

        return {
            statusCode: 404,
            body: JSON.stringify({
                message: "Not Found",
            })
        }

    } catch (error: any) {
        console.error("Error processing request:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Internal Server Error",
                error: error.message || "An unexpected error occurred"})
        };
    }
}
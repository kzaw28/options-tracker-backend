import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { handler as login } from "./routes/login";
import { handler as register } from "./routes/register";
import { handler as addOption } from "./routes/addOption"; // Uncomment if you have this route

import { handler as getAllOptions } from "./routes/getAllOptions";
import { handler as getOptionById } from "./routes/getOptionById";
import { handler as updateOption } from "./routes/updateOption";
import { handler as deleteOption } from "./routes/deleteOption";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const path = event.path; // The path of the request, e.g., "/api/auth/login"
    const method = event.httpMethod; // The HTTP method of the request, e.g., "POST"

    console.log("Received request:", { path, method, body: event.body });

    // Public Auth Endpoints
    // ── Auth ─────────────────────────────────────────────────────
    if (path === "/api/auth/register" && method === "POST")
      return await register(event);
    if (path === "/api/auth/login" && method === "POST")
      return await login(event);

    // ── CREATE ───────────────────────────────────────────────────
    if (path === "/api/options" && method === "POST")
      return await addOption(event);

    // ── READ SINGLE ───────────────────────────────────────────────
    const idMatch = path.match(/^\/api\/options\/([^\/]+)$/);
    if (idMatch && method === "GET") {
      const rawId = idMatch[1];                         
      const id = decodeURIComponent(rawId);          
      event.pathParameters = { id };                    
      return await getOptionById(event);
    }

    // ── UPDATE ───────────────────────────────────────────────────
    if (idMatch && method === "PUT") {
      const id = decodeURIComponent(idMatch[1]);
      event.pathParameters = { id };
      return await updateOption(event);
    }

    // ── DELETE ───────────────────────────────────────────────────
    if (idMatch && method === "DELETE") {
      const id = decodeURIComponent(idMatch[1]);
      event.pathParameters = { id };
      return await deleteOption(event);
    }

    // ── READ ALL ─────────────────────────────────────────────────
    if (path === "/api/options" && method === "GET")
      return await getAllOptions(event);

    return {
      statusCode: 404,
      body: JSON.stringify({
        message: "Path is Not Found",
      }),
    };
  } catch (error: any) {
    console.error("Error processing request:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Internal Server Error",
        error: error.message || "An unexpected error occurred",
      }),
    };
  }
};

import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    let res: APIGatewayProxyResult;
    try {
        switch (event.httpMethod) {
            case "GET":
                res = {
                    statusCode: 200,
                    body: JSON.stringify({ message: "GET success..." })
                };
                break;
            case "POST":
                res = {
                    statusCode: 201,
                    body: JSON.stringify({ message: "POST success..." })
                };
                break;
            case "PUT":
                res = {
                    statusCode: 201,
                    body: JSON.stringify({ message: "PUT success..." })
                };
                break;
            case "DELETE":
                res = {
                    statusCode: 200,
                    body: JSON.stringify({ message: "DELETE success..." })
                };
                break;
            default:
                res = {
                    statusCode: 400,
                    body: JSON.stringify({ message: "HTTP method not implemented..." })
                };
                break;
        }
    } catch (e) {
        res = {
            statusCode: 500,
            body: JSON.stringify({ error: e })
        };
    }
    return new Promise(resolve => resolve(res));
};


// import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
// const client = new SNSClient({region: 'us-east-2'});

// export async function handler (event: any) {
//     console.log('API Handler Lambda function triggered by CloudWatch Events: ');

//     try {    
//         return {
//             statusCode: 200,
//             body: JSON.stringify('SNS messages published successfully'),
//         };
//     } catch (err) {
//         console.log('Error:', JSON.stringify(err));
//         return {
//             statusCode: 500,
//             body: JSON.stringify('Error publishing SNS messages'),
//         };
//     }
// };
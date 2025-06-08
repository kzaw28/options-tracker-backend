import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
const client = new SNSClient({region: 'us-east-2'});

export async function handler (event: any) {
    console.log('API Handler Lambda function triggered by CloudWatch Events: ');

    try {    
        return {
            statusCode: 200,
            body: JSON.stringify('SNS messages published successfully'),
        };
    } catch (err) {
        console.log('Error:', JSON.stringify(err));
        return {
            statusCode: 500,
            body: JSON.stringify('Error publishing SNS messages'),
        };
    }
};
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { table } from "console";

const client = new DynamoDBClient({});
export const docClient = DynamoDBDocumentClient.from(client); // Create a Document Client

export const putOption = async (tableName: string, option: any, email: string) => {
    const timestamp = new Date().toISOString();
    const item = {
        ...option,
        email,
        createdAt: timestamp,
        updatedAt: timestamp,
    };

    await docClient.send(
        new PutCommand({
            TableName: tableName,
            Item: item,
        })
    )

    return item; // Return the item for confirmation
}

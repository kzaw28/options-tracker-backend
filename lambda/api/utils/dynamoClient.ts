import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { 
    DynamoDBDocumentClient, 
    PutCommand,
    GetCommand,
    QueryCommand
} from "@aws-sdk/lib-dynamodb";

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

/**
 * Fetch a single option by its ID and user email.
 */
export const getOptionById = async (
    tableName: string,
    id: string,
    email: string
) => {
    const result = await docClient.send(
        new GetCommand({
            TableName: tableName,
            Key: { email, id },
        })
    );

    return result.Item; // Returns the matched item or undefined
};

/**
 * Query all options belonging to a specific user (email).
 */
export const getAllOptions = async (
    tableName: string,
    email: string
) => {
    const result = await docClient.send(
        new QueryCommand({
            TableName: tableName,
            KeyConditionExpression: 'email = :email',
            ExpressionAttributeValues: {
                ':email': email,
            },
        })
    );

    return result.Items || []; // Returns an array of items
};

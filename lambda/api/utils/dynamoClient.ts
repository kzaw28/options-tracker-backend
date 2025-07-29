import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { 
    DynamoDBDocumentClient, 
    PutCommand,
    GetCommand,
    QueryCommand,
    DeleteCommand
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
  id: string,      // this is really your `optionName`
  email: string     // your sort key
) => {
  const result = await docClient.send(
    new GetCommand({
      TableName: tableName,
      Key: {
        // use the attribute names from your table schema:
        optionName: id,
        email:     email,
      },
    })
  );
  return result.Item; // undefined if not found
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
      TableName:  tableName,
      IndexName:  "ByEmail",               // whatever you named your GSI
      KeyConditionExpression: "email = :e",
      ExpressionAttributeValues: { ":e": email },
    })
  );
  return result.Items || [];
};


/**
 * Delete a single option by optionName (PK) + email (SK).
 * Returns the deleted item (or undefined if not found).
 */
export const deleteOption = async (
  tableName: string,
  id: string,
  email: string
) => {
  const result = await docClient.send(
    new DeleteCommand({
      TableName: tableName,
      Key: {
        optionName: id,
        email: email,
      },
      ReturnValues: "ALL_OLD",
    })
  );
  return result.Attributes;  // the deleted item, or undefined
};

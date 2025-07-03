import * as dotenv from 'dotenv';
dotenv.config(); // Load variables from .env

const accountID = process.env.AWS_ACCOUNT_ID || '';
const accountRegion = process.env.AWS_REGION || 'us-east-1';
const snsTopicName = process.env.SNS_TOPIC_NAME || 'Broker-Topic';
const snsTopicArn = `arn:aws:sns:${accountRegion}:${accountID}:${snsTopicName}`;
const environment = process.env.NODE_ENV || 'dev';


export const globals = {
    accountID, accountRegion, snsTopicName, snsTopicArn, environment
};
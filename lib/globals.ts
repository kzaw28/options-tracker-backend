const accountID = '537622164409';
const accountRegion = 'us-east-2';
const snsTopicName = 'Broker-Topic';
const snsTopicArn = `arn:aws:sns:${accountRegion}:${accountID}:${snsTopicName}`;

export const globals = {
    accountID, accountRegion, snsTopicName, snsTopicArn
};
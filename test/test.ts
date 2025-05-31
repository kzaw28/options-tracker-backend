import { handler } from '../lambda/hello'; // adjust the path as needed

async function test() {
  const event = {
    // simulate API Gateway event shape
    httpMethod: 'GET',
    headers: {},
    queryStringParameters: {},
    pathParameters: {},
    body: null,
  };

  const result = await handler(event as any);
  console.log(result);
}

test();
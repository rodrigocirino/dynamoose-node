import { ConfigService } from '@nestjs/config';
import * as dynamoose from 'dynamoose';

export function aws_config(configService: ConfigService) {
  // Create new DynamoDB instance
  const ddb = new dynamoose.aws.sdk.DynamoDB({
    accessKeyId: configService.get<string>('AWS_ACCESS_KEY_ID'),
    secretAccessKey: configService.get<string>('AWS_SECRET_ACCESS_KEY'),
    region: configService.get<string>('AWS_REGION'),
  });

  // Set DynamoDB instance to the Dynamoose DDB instance
  dynamoose.aws.ddb.set(ddb);
  //dynamoose.aws.ddb.local("http://localhost:1234");

  return dynamoose;
}

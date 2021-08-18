/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as dynamoose from 'dynamoose';
import { AnyDocument } from 'dynamoose/dist/Document';
import { ModelType } from 'dynamoose/dist/General';
import { User } from './user';
import { UserKey } from './user.interface';
import * as operation from './user.model';

@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {}

  config() {
    // Create new DynamoDB instance
    const ddb = new dynamoose.aws.sdk.DynamoDB({
      accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
      region: this.configService.get<string>('AWS_REGION'),
    });

    // Set DynamoDB instance to the Dynamoose DDB instance
    dynamoose.aws.ddb.set(ddb);
    //dynamoose.aws.ddb.local("http://localhost:1234");

    return dynamoose;
  }

  async main(): Promise<any> {
    //Set key values to AWS config
    const dynamoose = this.config();

    //Create a schema to model
    const userSchema = new dynamoose.Schema(
      {
        // fields for schema
        ga_id: {
          type: String,
          hashKey: true, //hashKey is commonly called a partition key in the AWS documentation.
        },
        external_id: String,
        user_email: String,
      },
      {
        // settings for schemma, mantain a timestamp object
        timestamps: {
          createdAt: 'create_at',
          updatedAt: 'update_at',
        },
      },
    );
    //Map model to table
    const tableName = 'usuario';
    const userModel: ModelType<AnyDocument> = dynamoose.model(tableName, userSchema);

    let userKey: any, userData: any, userValue: string, document: AnyDocument, response: UserKey;

    // --------------- CHECK TABLE ---------------
    // Does not change the name of fields already created, except for the timestamp which is a settings
    const created = await userModel.table.create.request();
    console.log(created ? { ...created, log: 'valid table' } : 'table is not valid !');

    // --------------- FIND ---------------
    //Find some value, by default search by partition key
    userData = new User({
      ga_id: 'UA-0',
    });
    document = await operation.findOne(userModel, userData);
    response = operation.transform(document, 'find one');
    console.log('findOne: ', response.gaId);

    // --------------- QUERY WHERE ---------------
    //Find some value, by default search by partition key
    userValue = 'UA-0';
    userKey = 'ga_id';
    document = await operation.queryWhere(userModel, userKey, userValue);
    response = operation.transform(document, 'query where');

    // --------------- FIND ALL---------------
    //Find some value, by default search by partition key
    const scanner = await userModel.scan().exec();
    const scann: any = scanner['count'] ? scanner.toJSON() : undefined;
    operation.transform(scann, 'find all');

    // ---------------  PUT ---------------
    //Create some value
    userData = new User({
      ga_id: 'UA-0',
      external_id: '12345',
      user_email: 'r@ok.com',
    });
    document = await operation.createOne(userModel, userData);
    operation.transform(document, 'create one');

    // ---------------  UPDATE ---------------
    //Update some value
    const search: any = {
      ga_id: 'UA-0',
    };
    const newValue: any = {
      external_id: '012',
      user_email: 'r@ok.co',
    };
    // se criar nao popula o campo createAt
    const doc: any = await operation.updateOrCreateOne(userModel, search, newValue);
    operation.transform(doc, 'update one');

    // --------------- DELETE ---------------
    //Delete some value
    /* userValue = 'UA-0';
    document = await operation.deleteOne(userModel, userValue); */

    return 'Ok';
  }
}

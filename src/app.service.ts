/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as dynamoose from 'dynamoose';
import { AnyDocument } from 'dynamoose/dist/Document';
import { ModelType } from 'dynamoose/dist/General';
import { User } from './user';
import { UserKey } from './user.interface';

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

  async createOne(model: ModelType<AnyDocument>, val: any): Promise<AnyDocument> {
    const userModelNew: AnyDocument = new model(val);
    const document: AnyDocument = await userModelNew.save();
    return document;
  }

  async updateOrCreateOne(model: ModelType<AnyDocument>, search: any, newValue: any) {
    const document = await model.update(search, newValue);
    return document;
  }

  async saveOne(model: AnyDocument): Promise<AnyDocument> {
    const document: AnyDocument = await model.save();
    return document;
  }

  async queryWhere(model: AnyDocument, key: string, val: string): Promise<AnyDocument> {
    const document: any = await model.query(key).eq(val).exec();
    return document['count'] ? document : undefined;
  }

  async findOne(model: AnyDocument, val: any): Promise<AnyDocument> {
    const document: AnyDocument = await model.get(val);
    return document;
  }

  async findByField(model: AnyDocument, obj: any): Promise<AnyDocument> {
    console.log('Searching by ', obj);
    const document: AnyDocument = await model.get({ user_email: 'r@ok.com' });
    return document;
  }

  async deleteOne(model: AnyDocument, val: any): Promise<AnyDocument> {
    const document = await this.findOne(model, val);
    if (!document) {
      console.log('No found to delete ', val);
      return undefined;
    }

    //delete return void
    await document.delete();
    //check if register already exists
    const founded = await this.findOne(model, val);
    if (founded) {
      throw Error(`Error document ${val} is not deleted.`);
    } else {
      console.log('Success to deleted register ', val);
    }
    return founded;
  }

  transform(document: AnyDocument, path = ''): UserKey {
    if (!document) {
      console.log(path + ': \t', 'No value found to transform.');
      return undefined;
    }
    //Ok created or found
    const parse: UserKey = new User({});
    parse.gaId = document.ga_id;
    parse.externalId = document.external_id;
    parse.userEmail = document.user_email;
    parse.createAt = document.create_at;
    parse.updateAt = document.update_at;

    console.log(path, parse);
    return parse;
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
    document = await this.findOne(userModel, userData);
    response = this.transform(document, 'find one');
    //console.log('RESPONSE: ', response.externalId);

    // --------------- QUERY WHERE ---------------
    //Find some value, by default search by partition key
    userValue = 'UA-0';
    userKey = 'ga_id';
    document = await this.queryWhere(userModel, userKey, userValue);
    response = this.transform(document, 'query where');

    // --------------- FIND ALL---------------
    //Find some value, by default search by partition key
    const scanner = await userModel.scan().exec();
    const scann: any = scanner['count'] ? scanner.toJSON() : undefined;
    this.transform(scann, 'find all');

    // ---------------  PUT ---------------
    //Create some value
    userData = new User({
      ga_id: 'UA-0',
      external_id: '12345',
      user_email: 'r@ok.com',
    });
    document = await this.createOne(userModel, userData);
    this.transform(document, 'create one');

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
    const doc: any = await this.updateOrCreateOne(userModel, search, newValue);
    this.transform(doc, 'update one');

    // --------------- DELETE ---------------
    //Delete some value
    /* userValue = 'UA-0';
    document = await this.deleteOne(userModel, userValue); */

    return 'Ok';
  }
}

import { AnyDocument } from 'dynamoose/dist/Document';
import { ModelType } from 'dynamoose/dist/General';
import { User } from './user';
import { UserKey } from './user.interface';

export async function createOne(model: ModelType<AnyDocument>, val: any): Promise<AnyDocument> {
  const userModelNew: AnyDocument = new model(val);
  const document: AnyDocument = await userModelNew.save();
  return document;
}

export async function updateOrCreateOne(model: ModelType<AnyDocument>, search: any, newValue: any) {
  const document = await model.update(search, newValue);
  return document;
}

export async function saveOne(model: AnyDocument): Promise<AnyDocument> {
  const document: AnyDocument = await model.save();
  return document;
}

export async function queryWhere(
  model: AnyDocument,
  key: string,
  val: string,
): Promise<AnyDocument> {
  const document: any = await model.query(key).eq(val).exec();
  return document['count'] ? document : undefined;
}

export async function findOne(model: AnyDocument, val: any): Promise<AnyDocument> {
  const document: AnyDocument = await model.get(val);
  return document;
}

export async function findByField(model: AnyDocument, obj: any): Promise<AnyDocument> {
  console.log('Searching by ', obj);
  const document: AnyDocument = await model.get({ user_email: 'r@ok.com' });
  return document;
}

export async function deleteOne(model: AnyDocument, val: any): Promise<AnyDocument> {
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

export function transform(document: AnyDocument, path = ''): UserKey {
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

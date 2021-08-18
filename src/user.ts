import { UserKey } from './user.interface';

export class User implements UserKey {
  constructor(private readonly _obj: any) {
    Object.assign(this, _obj);
  }

  //Fields
  private _gaId: string;
  private _externalId: string;
  private _userEmail: string;
  private _createAt: string;
  private _updateAt: string;

  //Operations
  get gaId(): string {
    return this._gaId;
  }
  set gaId(value: string) {
    this._gaId = value;
  }
  get externalId(): string {
    return this._externalId;
  }
  set externalId(value: string) {
    this._externalId = value;
  }
  get userEmail(): string {
    return this._userEmail;
  }
  set userEmail(value: string) {
    this._userEmail = value;
  }
  public get createAt(): string {
    return this._createAt;
  }
  public set createAt(value: string) {
    this._createAt = value;
  }
  public get updateAt(): string {
    return this._updateAt;
  }
  public set updateAt(value: string) {
    this._updateAt = value;
  }
}

import { IModelType } from "mobx-state-tree";

// tslint:disable-next-line:no-empty-interface
export interface IAnything extends Object {}

export interface IFieldErrors {
  errors: string[];
  items?: string[] | IFieldErrors;
  properties?: { [key: string]: string[] | IFieldErrors };
}

export type __IModelType = IModelType<any, any>;

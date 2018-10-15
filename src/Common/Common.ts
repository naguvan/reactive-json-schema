import { IModelType } from "mobx-state-tree";

// tslint:disable-next-line:no-empty-interface
export interface IAnything extends Object {}

export interface IFieldErrors {
  errors: string[];
  items?: string[] | IFieldErrors;
  properties?: { [key: string]: string[] | IFieldErrors };
}

export interface IOption<T> {
  label: string;
  value: T;
}

export type ILayout = Array<string | Array<string | Array<string | string[]>>>;

export type __IModelType = IModelType<any, any>;

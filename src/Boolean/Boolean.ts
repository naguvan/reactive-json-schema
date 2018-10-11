import { IModelType, types } from "mobx-state-tree";

import { mappings } from "../Common";

import { createValue, IValue, IValueAttrs, IValueConfig } from "../Value";

import { createMeta, IMeta } from "../Meta";

export type IBooleanComponent = "radio" | "checkbox" | "switch";

export interface IBooleanMeta extends IMeta<IBooleanComponent> {}

export type IBooleanType = "boolean";

export interface IBooleanAttrs extends IValueAttrs<boolean> {}

export interface IBooleanConfig
  extends IValueConfig<boolean, IBooleanType, IBooleanComponent, IBooleanMeta>,
    Partial<IBooleanAttrs> {}

export interface IBoolean
  extends IBooleanAttrs,
    IValue<boolean, IBooleanType, IBooleanComponent, IBooleanMeta> {}

export const BooleanMeta: IModelType<
  Partial<IBooleanMeta>,
  IBooleanMeta
> = types.compose(
  "BooleanMeta",
  createMeta<IBooleanComponent>("radio", "checkbox", "switch"),
  types.model({})
);

// tslint:disable-next-line:variable-name
export const Boolean: IModelType<
  Partial<IBooleanConfig>,
  IBoolean
> = types.compose(
  "Boolean",
  createValue<boolean, IBooleanType, IBooleanComponent, IBooleanMeta>(
    "boolean",
    types.boolean,
    false,
    BooleanMeta
  ),
  types.model({})
);

mappings.boolean = Boolean;

export function createBoolean(): IModelType<Partial<IBooleanConfig>, IBoolean> {
  return Boolean;
}

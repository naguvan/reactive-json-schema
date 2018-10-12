import { IModelType, types } from "mobx-state-tree";

import { mappings } from "../Common";

import { createValue, IValue, IValueAttrs, IValueConfig } from "../Value";

import { createMeta, IMeta, IMetaAttrs, IMetaConfig } from "../Meta";

export type IBooleanComponent = "radio" | "checkbox" | "switch";

export interface IBooleanMetaAttrs
  extends IMetaAttrs<boolean, IBooleanComponent> {}

export interface IBooleanMetaConfig
  extends IMetaConfig<boolean, IBooleanComponent> {}

export interface IBooleanMeta
  extends IMeta<boolean, IBooleanComponent>,
    IBooleanMetaAttrs {}

export type IBooleanType = "boolean";

export interface IBooleanAttrs extends IValueAttrs<boolean> {}

export interface IBooleanConfig
  extends IValueConfig<
      boolean,
      IBooleanType,
      IBooleanComponent,
      IBooleanMetaConfig
    >,
    Partial<IBooleanAttrs> {}

export interface IBoolean
  extends IBooleanAttrs,
    IValue<
      boolean,
      IBooleanType,
      IBooleanComponent,
      IBooleanMetaConfig,
      IBooleanMeta
    > {}

export const BooleanMeta: IModelType<
  Partial<IBooleanMetaConfig>,
  IBooleanMeta
> = types.compose(
  "BooleanMeta",
  createMeta<boolean, IBooleanComponent, IBooleanMetaConfig, IBooleanMeta>(
    types.boolean,
    false,
    "radio",
    "checkbox",
    "switch"
  ),
  types.model({})
);

// tslint:disable-next-line:variable-name
export const Boolean: IModelType<
  Partial<IBooleanConfig>,
  IBoolean
> = types.compose(
  "Boolean",
  createValue<
    boolean,
    IBooleanType,
    IBooleanComponent,
    IBooleanMetaConfig,
    IBooleanMeta
  >("boolean", types.boolean, false, BooleanMeta, { component: "switch" }),
  types.model({})
);

mappings.boolean = Boolean;

export function createBoolean(): IModelType<Partial<IBooleanConfig>, IBoolean> {
  return Boolean;
}

import { IModelType, types } from "mobx-state-tree";

import { mappings } from "../Common";

import { createValue, IValue, IValueAttrs, IValueConfig } from "../Value";

import { createMeta, IMeta, IMetaAttrs, IMetaConfig } from "../Meta";

export type INullComponent = "para";

export interface INullMetaAttrs extends IMetaAttrs<null, INullComponent> {}

export interface INullMetaConfig
  extends IMetaConfig<null, INullComponent>,
    INullMetaAttrs {}

export interface INullMeta
  extends IMeta<null, INullComponent>,
    INullMetaAttrs {}

export type INullType = "null";

export interface INullMetaProps extends INullMetaConfig {
  readonly type: INullType;
}

export interface INullAttrs extends IValueAttrs<null> {}

export interface INullConfig
  extends IValueConfig<null, INullType, INullComponent, INullMetaConfig>,
    Partial<INullAttrs> {}

export interface INull
  extends INullAttrs,
    IValue<null, INullType, INullComponent, INullMetaConfig, INullMeta> {}

export const NullMeta: IModelType<
  Partial<INullMetaConfig>,
  INullMeta
> = types.compose(
  "NullMeta",
  createMeta<null, INullComponent, INullMetaConfig, INullMeta>(
    types.null,
    null,
    "para"
  ),
  types.model({})
);

export const Null: IModelType<Partial<INullConfig>, INull> = types.compose(
  "Null",
  createValue<null, INullType, INullComponent, INullMetaConfig, INullMeta>(
    "null",
    types.null,
    null,
    NullMeta,
    { component: "para", name: "" }
  ),
  types.model({})
);

mappings.null = Null;

export function createNull(): IModelType<Partial<INullConfig>, INull> {
  return Null;
}

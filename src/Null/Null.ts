import { IModelType, Snapshot, types } from "mobx-state-tree";

import { mappings } from "../Common";

import { createValue, IValue, IValueAttrs, IValueConfig } from "../Value";

import { createMeta, IMeta } from "../Meta";

export type INullComponent = "para";

export interface INullMeta extends IMeta<INullComponent> {}

export type INullType = "null";

export interface INullAttrs extends IValueAttrs<null> {}

export interface INullConfig
  extends IValueConfig<null, INullType, INullComponent, INullMeta>,
    Partial<INullAttrs> {}

export interface INull
  extends INullAttrs,
    IValue<null, INullType, INullComponent, INullMeta> {}

export const NullMeta: IModelType<
  Partial<INullMeta>,
  INullMeta
> = types.compose(
  "NullMeta",
  createMeta<INullComponent>("para"),
  types.model({})
);

export const Null: IModelType<Snapshot<INullConfig>, INull> = types.compose(
  "Null",
  createValue<null, INullType, INullComponent, INullMeta>(
    "null",
    types.null,
    null,
    NullMeta
  ),
  types.model({})
);

mappings.null = Null;

export function createNull(): IModelType<Partial<INullConfig>, INull> {
  return Null;
}

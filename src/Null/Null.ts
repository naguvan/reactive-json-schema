import { IModelType, types } from "mobx-state-tree";

import { mappings } from "../Common";

import { createValue, IValue, IValueAttrs, IValueConfig } from "../Value";

export interface INullAttrs extends IValueAttrs<null> {}

export interface INullConfig
  extends IValueConfig<null, "null">,
    Partial<INullAttrs> {}

export interface INull extends INullAttrs, IValue<null, "null"> {}

export const Null: IModelType<Partial<INullConfig>, INull> = types.compose(
  "Null",
  createValue<null, "null">("null", types.null, null),
  types.model({})
);

mappings.null = Null;

export function createNull(): IModelType<Partial<INullConfig>, INull> {
  return Null;
}

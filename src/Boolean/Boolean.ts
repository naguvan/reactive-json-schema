import { IModelType, types } from "mobx-state-tree";

import { mappings } from "../Common";

import { createValue, IValue, IValueAttrs, IValueConfig } from "../Value";

import { createMeta, IMeta, IMetaAttrs, IMetaConfig } from "../Meta";

export type IBooleanComponent = "radios" | "checkbox" | "switch" | "select";

export interface IBooleanMetaAttrs
  extends IMetaAttrs<boolean, IBooleanComponent> {
  readonly step?: number | null;
}

export interface IBooleanMetaConfig
  extends IMetaConfig<boolean, IBooleanComponent>,
    IBooleanMetaAttrs {}

export interface IBooleanMeta
  extends IMeta<boolean, IBooleanComponent>,
    IBooleanMetaAttrs {}

export type IBooleanType = "boolean";

export interface IBooleanMetaProps extends IBooleanMetaConfig {
  readonly type: IBooleanType;
}

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
    "radios",
    "checkbox",
    "switch",
    "select"
  ),
  types.model({
    step: types.maybe(types.number)
  })
);

// tslint:disable-next-line:variable-name
export const Boolean: IModelType<Partial<IBooleanConfig>, IBoolean> = types
  .compose(
    "Boolean",
    createValue<
      boolean,
      IBooleanType,
      IBooleanComponent,
      IBooleanMetaConfig,
      IBooleanMeta
    >("boolean", types.boolean, false, BooleanMeta, { component: "switch" }),
    types.model({})
  )
  .actions(it => ({
    afterCreate() {
      if (it.enum) {
        if (!(it.enum.length === 2)) {
          throw new TypeError(
            `boolean enum should be two values. '${it.enum}' is invalid.`
          );
        }
        if (it.enum[0] !== true && it.enum[0] !== false) {
          throw new TypeError(
            `boolean enum should have either 'true' or 'false'`
          );
        }
        if (it.enum[1] !== true && it.enum[1] !== false) {
          throw new TypeError(
            `boolean enum should have either 'true' or 'false'`
          );
        }
      }
      const { component } = it.meta;
      if (
        (component === "select" || component === "radios") &&
        (!it.enum || it.enum.length === 0)
      ) {
        (it as any).enum = [true, false];
      }
      if (
        it.enum &&
        it.enum.length > 0 &&
        (!it.meta.options || it.meta.options.length === 0)
      ) {
        const options = it.enum.map(option => ({
          label: String(option),
          value: option
        }));
        it.meta.setOptions(options);
      }
    }
  }));

mappings.boolean = Boolean;

export function createBoolean(): IModelType<Partial<IBooleanConfig>, IBoolean> {
  return Boolean;
}

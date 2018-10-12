import { IModelType, types } from "mobx-state-tree";

import { mappings } from "../Common";
import { decimals } from "../utils";

import { createValue, IValue, IValueAttrs, IValueConfig } from "../Value";

import { createMeta, IMeta } from "../Meta";

export type INumberComponent = "text" | "range" | "slide";

export interface INumberMeta extends IMeta<INumberComponent> {}

export type INumberType = "number";

export interface INumberAttrs extends IValueAttrs<number> {
  readonly minimum?: number | null;
  readonly maximum?: number | null;
  readonly multipleOf?: number | null;
}

export interface INumberConfig
  extends IValueConfig<number, INumberType, INumberComponent, INumberMeta>,
    Partial<INumberAttrs> {}

export interface INumber
  extends INumberAttrs,
    IValue<number, INumberType, INumberComponent, INumberMeta> {}

export const NumberMeta: IModelType<
  Partial<INumberMeta>,
  INumberMeta
> = types.compose(
  "NumberMeta",
  createMeta<INumberComponent>("text", "range", "slide"),
  types.model({})
);

// tslint:disable-next-line:variable-name
export const Number: IModelType<Partial<INumberConfig>, INumber> = types
  .compose(
    "Number",
    createValue<number, INumberType, INumberComponent, INumberMeta>(
      "number",
      types.number,
      0,
      NumberMeta,
      { component: "text" }
    ),
    types.model({
      maximum: types.maybe(types.number),
      minimum: types.maybe(types.number),
      multipleOf: types.maybe(types.number)
    })
  )
  .actions(it => ({
    afterCreate() {
      if (it.multipleOf !== null && it.multipleOf <= 0) {
        throw new TypeError(
          `multipleOf can not be ${it.multipleOf === 0 ? "zero" : "negative"}`
        );
      }
    }
  }))
  .actions(it => ({
    syncValidate(value: number): string[] {
      const errors: string[] = it.syncValidateBase(value);
      if (it.minimum !== null && value < it.minimum) {
        errors.push(`should NOT be lesser than ${it.minimum}`);
      }
      if (it.maximum !== null && value > it.maximum) {
        errors.push(`should NOT be greater than ${it.maximum}`);
      }
      if (it.multipleOf !== null && it.multipleOf > 1) {
        const multiplier = Math.pow(
          10,
          Math.max(decimals(value), decimals(it.multipleOf))
        );
        if (
          Math.round(value * multiplier) %
          Math.round(it.multipleOf * multiplier) !==
          0
        ) {
          errors.push(`should be multiple of ${it.multipleOf}`);
        }
      }
      return errors;
    }
  }));

mappings.number = Number;

export function createNumber(): IModelType<Partial<INumberConfig>, INumber> {
  return Number;
}

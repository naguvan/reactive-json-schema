import { detach, IModelType, types } from "mobx-state-tree";

import { observe, toJS } from "mobx";

import { IAnything, IFieldErrors, mappings } from "../Common";
import { createType, IType, ITypeConfig, ITypeMetaProps } from "../Type";
import { isArray, unique } from "../utils";
import { createValue, IValue, IValueAttrs, IValueConfig } from "../Value";

import { createMeta, IMeta, IMetaAttrs, IMetaConfig } from "../Meta";

import { IObject } from "../Object";

export type IArrayComponent = "list" | "layout";

export interface IArrayMetaAttrs
  extends IMetaAttrs<Array<IAnything | null>, IArrayComponent> {}

export interface IArrayMetaConfig
  extends IMetaConfig<Array<IAnything | null>, IArrayComponent>,
    IArrayMetaAttrs {}

export interface IArrayMeta
  extends IMeta<Array<IAnything | null>, IArrayComponent>,
    IArrayMetaAttrs {}

export type IArrayType = "array";

export interface IArrayMetaProps extends IArrayMetaConfig {
  readonly type: IArrayType;
  readonly items?: ITypeMetaProps | ITypeMetaProps[] | null;
}

export interface IArrayAttrs extends IValueAttrs<Array<IAnything | null>> {
  readonly additionalItems?: boolean | null;
  readonly minItems?: number | null;
  readonly maxItems?: number | null;
  readonly uniqueItems?: boolean | null;
  readonly items?: ITypeConfig | ITypeConfig[] | null;
}

export interface IArrayConfig
  extends IValueConfig<
      Array<IAnything | null>,
      IArrayType,
      IArrayComponent,
      IArrayMetaConfig
    >,
    Partial<IArrayAttrs> {}

export interface IArray
  extends IArrayAttrs,
    IValue<
      Array<IAnything | null>,
      IArrayType,
      IArrayComponent,
      IArrayMetaConfig,
      IArrayMeta
    > {
  readonly elements: IType[];
  readonly dynamic: boolean;
  push(): void;
  remove(index: number): void;
  getFieldErrors(): IFieldErrors;
  updateIndexValue(index: number, value: IAnything | null): void;
}

mappings.array = types.late("Array", createArray);

let NArray: IModelType<Partial<IArrayConfig>, IArray>;

export const ArrayMeta: IModelType<
  Partial<IArrayMetaConfig>,
  IArrayMeta
> = types.compose(
  "ArrayMeta",
  createMeta<
    Array<IAnything | null>,
    IArrayComponent,
    IArrayMetaConfig,
    IArrayMeta
  >(types.array(types.frozen), [], "list", "layout"),
  types.model({})
);

export function createArray(): IModelType<Partial<IArrayConfig>, IArray> {
  if (!NArray) {
    const Array: IModelType<Partial<IArrayConfig>, IArray> = types
      .compose(
        "Array",
        createValue<
          Array<IAnything | null>,
          IArrayType,
          IArrayComponent,
          IArrayMetaConfig,
          IArrayMeta
        >("array", types.array(types.frozen), [], ArrayMeta, {
          component: "list"
        }),
        types.model({
          additionalItems: types.maybe(types.boolean),
          elements: types.optional(types.array(types.late(createType)), []),
          items: types.optional(types.frozen, null),
          maxItems: types.maybe(types.number),
          minItems: types.maybe(types.number),
          uniqueItems: types.maybe(types.boolean)
        })
      )
      .views(it => ({
        get dynamic() {
          return !isArray(it.items);
        }
      }))
      .actions(it => ({
        updateIndexValue(index: number, value: IAnything | null): void {
          it.meta.value![index] = value;
          if (it.elements.length > index) {
            // TODO: Need to fix for all types
            (it.elements[index]! as IObject).setValue(value);
          }
        },

        removeIndexValue(index: number): void {
          it.meta.value!.splice(index, 1);
        }
      }))
      .actions(it => ({
        getConfig(value: IAnything | null, index: number, element: any): IType {
          const Type = createType();
          const type = Type.create({
            ...element,
            meta: {
              value: toJS(value)
            }
          } as ITypeConfig);
          observe(type.meta, "value", changes => {
            it.updateIndexValue(index, type.meta.value as any);
          });
          return type;
        }
      }))
      .actions(it => ({
        updateElements(values: Array<IAnything | null> | null) {
          if (values != null && it.items !== null) {
            it.elements.length = 0;
            if (!isArray(it.items)) {
              it.elements.push(
                ...values.map((value, index) =>
                  it.getConfig(value, index, it.items)
                )
              );
            } else {
              it.items.forEach((item, index) => {
                it.elements.push(
                  it.getConfig(
                    values.length > index ? values[index] : null,
                    index,
                    item
                  )
                );
              });
            }
          }
        },

        push(): void {
          if (it.dynamic) {
            const meta = (it.items as IType).meta;
            const value = meta ? meta.default! : undefined;
            const index = it.meta.value!.length;
            it.updateIndexValue(index, value as any);
            it.elements.push(it.getConfig(value as any, index, it.items));
            it.validate();
          }
        },

        remove(index: number): void {
          if (it.dynamic) {
            it.removeIndexValue(index);
            const element = it.elements![index];
            detach(element as any);
            // it.elements.splice(index, 1);
            it.validate();
          }
        }
      }))
      .actions(it => ({
        afterCreate() {
          if (it.minItems !== null && it.minItems < 0) {
            throw new TypeError(`minItems can not be negative`);
          }
          if (it.maxItems !== null && it.maxItems < 0) {
            throw new TypeError(`maxItems can not be negative`);
          }
          it.updateElements(toJS(it.meta.value) as any);
        }
      }))
      .actions(it => ({
        doValidate(value: Array<IAnything | null>): string[] {
          const errors: string[] = it.doValidateBase(value);
          if (value === null) {
            return errors;
          }
          if (it.minItems !== null && value.length < it.minItems) {
            errors.push(`should NOT have less than ${it.minItems} items`);
          }
          if (it.maxItems !== null && value.length > it.maxItems) {
            errors.push(`should NOT have more than ${it.maxItems} items`);
          }
          if (
            it.uniqueItems !== null &&
            it.uniqueItems &&
            value.length !== unique(value).length
          ) {
            errors.push(`should NOT have duplicate items`);
          }
          if (
            isArray(it.items) &&
            it.additionalItems !== null &&
            it.additionalItems === false
          ) {
            if (value.length > it.items.length) {
              errors.push(`should NOT have additional items`);
            }
          }
          if (it.elements !== null) {
            for (const element of it.elements) {
              element.validate();
            }
          }
          return errors;
        },
        setValue(value: Array<IAnything | null>): void {
          it.meta.setValue(value);
          it.updateElements(toJS(value));
        }
      }))
      .views(it => ({
        getFieldErrors(): IFieldErrors {
          return it.elements.reduce(
            (errors: any, element, index) => {
              errors.items[index] = (element! as IObject | IArray)
                .getFieldErrors
                ? (element! as IObject | IArray).getFieldErrors()
                : toJS(element.errors);
              return errors;
            },
            { errors: toJS(it.errors), items: [] }
          );
        },
        get data(): Array<IAnything | null> {
          return it.elements.reduce(
            (data: Array<IAnything | null>, element, index) => {
              data[index] = element!.data;
              return data;
            },
            [...toJS(it.meta.value || [])]
          );
        },
        get valid(): boolean {
          return (
            it.errors!.length === 0 &&
            it.elements.every(element => element!.valid)
          );
        },
        get modified(): boolean {
          return it.elements.some(element => element.modified);
        },
        get validating(): boolean {
          return (
            (it as any)._validating ||
            it.elements.some(element => element.validating)
          );
        }
      }));

    NArray = Array;
  }
  return NArray;
}

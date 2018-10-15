import { IModelType, types } from "mobx-state-tree";

import { toJS } from "mobx";

import { keys, unique } from "../utils";

import { IAnything, IFieldErrors, ILayout, mappings } from "../Common";

import { IArray } from "../Array";

import { createValue, IValue, IValueAttrs, IValueConfig } from "../Value";

import { createType, IType, ITypeConfig } from "../Type";

import { createMeta, IMeta, IMetaAttrs, IMetaConfig } from "../Meta";

export type IObjectComponent = "grid" | "layout" | "list";

export interface IObjectMetaAttrs
  extends IMetaAttrs<object | null, IObjectComponent> {
  readonly layout?: ILayout | null;
}

export interface IObjectMetaConfig
  extends IMetaConfig<object | null, IObjectComponent>,
    IObjectMetaAttrs {}

export interface IObjectMeta
  extends IMeta<object | null, IObjectComponent>,
    IObjectMetaAttrs {}

export type IObjectType = "object";

export interface IObjectAttrs extends IValueAttrs<object | null> {
  readonly required?: string[] | null;
  readonly minProperties?: number | null;
  readonly maxProperties?: number | null;
}

export interface IObjectConfig
  extends IValueConfig<
      object | null,
      IObjectType,
      IObjectComponent,
      IObjectMetaConfig
    >,
    Partial<IObjectAttrs> {
  readonly properties?: { [key: string]: ITypeConfig };
  readonly additionalProperties?: boolean | ITypeConfig | null;
}

export interface IObject
  extends IObjectAttrs,
    IValue<
      object | null,
      IObjectType,
      IObjectComponent,
      IObjectMetaConfig,
      IObjectMeta
    > {
  readonly properties?: ReadonlyMap<string, IType> | null;
  readonly additionalProperties?: boolean | IType | null;
  readonly fields: IType[];
  readonly modified: boolean;
  getProperty(property: string): IType | undefined;
  getProperties(): string[];
  getFieldErrors(): IFieldErrors;
}

mappings.object = types.late("Object", createObject);

let NObject: IModelType<Partial<IObjectConfig>, IObject>;

export const ObjectMeta: IModelType<
  Partial<IObjectMetaConfig>,
  IObjectMeta
> = types.compose(
  "ObjectMeta",
  createMeta<object | null, IObjectComponent, IObjectMetaConfig, IObjectMeta>(
    types.map(types.frozen),
    {},
    "grid",
    "layout",
    "list"
  ),
  types.model({
    layout: types.optional(types.frozen, null)
  })
);

export function createObject(): IModelType<Partial<IObjectConfig>, IObject> {
  if (!NObject) {
    const XObject = types
      .compose(
        "Object",
        createValue<
          object | null,
          IObjectType,
          IObjectComponent,
          IObjectMetaConfig,
          IObjectMeta
        >("object", types.map(types.frozen), {}, ObjectMeta, {
          component: "layout"
        }),
        types.model({
          additionalProperties: types.maybe(
            types.union(types.boolean, types.late(createType))
          ),
          maxProperties: types.maybe(types.number),
          minProperties: types.maybe(types.number),
          properties: types.maybe(
            types.map<any, IType>(types.late(createType))
          ),
          required: types.maybe(types.array(types.string))
        })
      )
      .volatile(it => ({
        getActuals(value: Map<string, object> | null): string[] {
          if (value === null) {
            return [];
          }
          const props: string[] = [];
          value.forEach((v, key) => props.push(key));
          return props;
        }
      }))
      .volatile(it => ({
        getAdditionals(value: Map<string, object> | null): string[] {
          return it
            .getActuals(value)
            .filter(prop => !it.properties || !it.properties.has(prop));
        },

        getProperties(): string[] {
          if (it.properties) {
            return Array.from(it.properties.keys()).slice(0);
          }
          return [];
        },

        getProperty(property: string): IType | undefined {
          return it.properties
            ? (it.properties.get(property) as IType)
            : undefined;
        }
      }))
      .actions(it => ({
        updateProps(value: object | null) {
          if (value) {
            keys(value).forEach(key => {
              const type = it.getProperty(key);
              if (type) {
                return (type as any).setValue((value as any)[key]);
              }
            });
          }
        }
      }))
      .views(it => ({
        get count() {
          return it.properties ? it.properties.size : 0;
        },
        get valid(): boolean {
          return (
            it.errors!.length === 0 &&
            it
              .getProperties()
              .every(property => it.getProperty(property)!.valid)
          );
        },
        get fields(): IType[] {
          return it.properties
            ? (Array.from(it.properties.values()) as IType[])
            : [];
        }
      }))
      .actions(it => ({
        afterCreate() {
          if (it.minProperties !== null && it.minProperties < 0) {
            throw new TypeError(`minProperties can not be negative`);
          }
          if (it.maxProperties !== null && it.maxProperties < 0) {
            throw new TypeError(`maxProperties can not be negative`);
          }
          if (
            it.required !== null &&
            it.required.length !== unique(it.required).length
          ) {
            throw new TypeError(
              `required should not have duplicate properties`
            );
          }

          if (it.properties) {
            for (const [key, field] of it.properties.entries()) {
              field.meta.setName(key);
              if (!field.title) {
                field.setTitle(key);
              }
            }
          }

          if (it.required !== null) {
            for (const required of it.required) {
              const property = it.getProperty(required);
              if (property) {
                property.meta.setMandatory(true);
              }
            }
          }

          it.updateProps(toJS(it.meta.value as IAnything));
        }
      }))
      .actions(it => ({
        async asyncValidate(
          value: Map<string, object> | null
        ): Promise<string[]> {
          const errors = await it.asyncValidateBase(value);
          if (
            value !== null &&
            it.additionalProperties !== null &&
            typeof toJS(it.additionalProperties) !== "boolean"
          ) {
            const additionals = it.getAdditionals(value);
            if (additionals.length > 0) {
              const extratype = it.additionalProperties as IType;
              for (const additional of additionals) {
                for (const error of await extratype.tryValidate(
                  value.get(additional)
                )) {
                  errors.push(
                    `additional property '${additional}' ${error.replace(
                      "Value ",
                      ""
                    )}`
                  );
                }
              }
            }
          }
          for (const property of it.getProperties()) {
            await it.getProperty(property)!.validate();
          }
          return errors;
        },
        syncValidate(value: Map<string, object> | null): string[] {
          const errors: string[] = it.syncValidateBase(value);
          if (value === null) {
            return errors;
          }
          if (it.minProperties !== null && value.size < it.minProperties) {
            errors.push(
              `should NOT have less than ${it.minProperties} properties`
            );
          }
          if (it.maxProperties !== null && value.size > it.maxProperties) {
            errors.push(
              `should NOT have more than ${it.maxProperties} properties`
            );
          }
          // required is handled in respective fields
          // if (it.required !== null) {
          //     const actuals = it.getActuals(value);
          //     const requireds = it.required.filter(
          //         required => !actuals.includes(required)
          //     );
          //     if (requireds.length > 0) {
          //         errors.push(
          //             `should have required properties [${requireds.join(
          //                 ', '
          //             )}]`
          //         );
          //     }
          // }
          if (
            it.additionalProperties !== null &&
            typeof toJS(it.additionalProperties) === "boolean"
          ) {
            const additionals = it.getAdditionals(value);
            if (additionals.length > 0) {
              if (!it.additionalProperties) {
                errors.push(
                  `should NOT have additional properties [${additionals.join(
                    ", "
                  )}]`
                );
              }
            }
          }
          return errors;
        },
        setValue(value: object | null): void {
          it.meta.setValue(value);
          it.updateProps(toJS(value));
        },
        reset(): void {
          it.errors!.length = 0;
          it.fields.forEach(field => field.reset());
        }
      }))
      .views(it => ({
        getFieldErrors(): IFieldErrors {
          const properties = it.getProperties();
          return properties.reduce(
            (errors: any, key: string) => {
              const type = it.getProperty(key)!;
              errors.properties[key] = (type as IObject | IArray).getFieldErrors
                ? (type as IObject | IArray).getFieldErrors()
                : toJS(type.errors);
              return errors;
            },
            { errors: toJS(it.errors), properties: {} }
          );
        },
        get data(): object {
          const properties = it.getProperties();
          return properties.reduce(
            (data: any, key: string) => {
              const type = it.getProperty(key);
              data[key] = type!.data;
              return data;
            },
            {
              ...toJS(it.meta.value || {})
            }
          );
        },
        get modified(): boolean {
          return it.fields.some(field => field.modified);
        },
        get validating(): boolean {
          return (
            (it as any)._validating || it.fields.some(field => field.validating)
          );
        }
      }));

    NObject = XObject as any;
  }
  return NObject as IModelType<Partial<IObjectConfig>, IObject>;
}

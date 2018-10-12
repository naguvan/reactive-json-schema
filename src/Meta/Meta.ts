import { IModelType, ISimpleType, types } from "mobx-state-tree";

export interface IMetaAttrs<T> {
  readonly component?: T | null;
  readonly help?: string | null;
  readonly sequence?: number | null;
}

export interface IMetaConfig<T> extends IMetaAttrs<T> {
  readonly name?: string | null;
  readonly disabled?: boolean | null;
  readonly visible?: boolean | null;
  readonly mandatory?: boolean | null;
}

export interface IMeta<T> extends IMetaAttrs<T> {
  readonly name: string;
  readonly disabled: boolean;
  readonly visible: boolean;
  readonly mandatory: boolean;
  setName(name: string): void;
  setMandatory(mandatory: boolean): void;
  setDisabled(disabled: boolean): void;
  setVisible(visible: boolean): void;
}

export function createMeta<
  T extends string,
  C extends IMetaConfig<T>,
  M extends IMeta<T> & C
>(...components: T[]): IModelType<Partial<C>, M> {
  const Meta: IModelType<Partial<C>, M> = types
    .model("Meta", {
      component: types.maybe(types.enumeration(
        "component",
        components
      ) as ISimpleType<T>),
      disabled: types.optional(types.boolean, false),
      help: types.maybe(types.string),
      mandatory: types.optional(types.boolean, false),
      name: types.optional(types.string, ""),
      sequence: types.maybe(types.number),
      visible: types.optional(types.boolean, true)
    })
    .actions(it => ({
      setName(name: string): void {
        it.name = name;
      },
      setMandatory(mandatory: boolean): void {
        it.mandatory = mandatory;
      },
      setDisabled(disabled: boolean): void {
        it.disabled = disabled;
      },
      setVisible(visible: boolean): void {
        it.visible = visible;
      }
    })) as any;
  return Meta;
}

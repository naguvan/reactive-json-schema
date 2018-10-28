import { IOption } from "../Common";

import { IModelType, ISimpleType, types } from "mobx-state-tree";

export interface IMetaAttrs<V, T> {
  readonly component?: T | null;
  readonly help?: string | null;
  readonly icon?: string | null;
  readonly iconAlign?: "start" | "end" | null;
  readonly error?: string | null;
  readonly row?: boolean | null;
  readonly sequence?: number | null;
  readonly initial?: V | null;
  readonly value?: V | null;
  readonly default?: V | null;
  readonly options?: Array<IOption<V>> | null;
}

export interface IMetaConfig<V, T> extends IMetaAttrs<V, T> {
  readonly name?: string | null;
  readonly disabled?: boolean | null;
  readonly visible?: boolean | null;
  readonly mandatory?: boolean | null;
}

export interface IMeta<V, T> extends IMetaAttrs<V, T> {
  readonly name: string;
  readonly disabled: boolean;
  readonly visible: boolean;
  readonly mandatory: boolean;
  setName(name: string): void;
  setMandatory(mandatory: boolean): void;
  setDisabled(disabled: boolean): void;
  setVisible(visible: boolean): void;
  setInitial(initial: V): void;
  setDefault(defaultV: V): void;
  setValue(value: V): void;
  setOptions(options: Array<IOption<V>>): void;
}

export function createMeta<
  V,
  T extends string,
  C extends IMetaConfig<V, T>,
  M extends IMeta<V, T> & C
>(
  kind: ISimpleType<V>,
  defaultv: V,
  ...components: T[]
): IModelType<Partial<C>, M> {
  const Meta: IModelType<Partial<C>, M> = types
    .model("Meta", {
      component: types.maybe(types.enumeration(
        "component",
        components
      ) as ISimpleType<T>),
      default: types.optional(kind, defaultv),
      disabled: types.optional(types.boolean, false),
      error: types.maybe(types.string),
      help: types.maybe(types.string),
      icon: types.maybe(types.string),
      iconAlign: types.optional(
        types.enumeration("iconAlign", ["start", "end"]),
        "start"
      ),
      initial: types.optional(kind, defaultv),
      mandatory: types.optional(types.boolean, false),
      name: types.optional(types.string, ""),
      options: types.maybe(
        types.array(types.model({ label: types.string, value: kind }))
      ),
      row: types.maybe(types.boolean),
      sequence: types.maybe(types.number),
      value: types.optional(kind, defaultv),
      visible: types.optional(types.boolean, true)
    })
    .actions(it => ({
      afterCreate() {
        it.initial = it.value;
      }
    }))
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
      },
      setInitial(initial: V): void {
        it.initial = initial;
      },
      setValue(value: V): void {
        it.value = value;
      },
      setDefault(defaultV: V): void {
        it.default = defaultV;
      },
      setOptions(options: Array<IOption<V>>): void {
        it.options = options as any;
      }
    })) as any;
  return Meta;
}

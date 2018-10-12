import { IModelType, ISimpleType, types } from "mobx-state-tree";

export interface IMetaAttrs<V, T> {
  readonly component?: T | null;
  readonly help?: string | null;
  readonly sequence?: number | null;
  readonly errors?: string[] | null;
  readonly initial?: V | null;
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
  readonly valid: boolean;
  setName(name: string): void;
  setMandatory(mandatory: boolean): void;
  setDisabled(disabled: boolean): void;
  setVisible(visible: boolean): void;
  addError(error: string): void;
  addErrors(errors: string[]): void;
  clearErrors(): void;
  setInitial(initial: V): void;
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
      disabled: types.optional(types.boolean, false),
      errors: types.optional(types.array(types.string), []),
      help: types.maybe(types.string),
      initial: types.optional(kind, defaultv),
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
      },
      addError(error: string): void {
        it.errors.push(error);
      },
      addErrors(errors: string[]): void {
        it.errors.push(...errors);
      },
      clearErrors(): void {
        it.errors.length = 0;
      },
      setInitial(initial: V): void {
        it.initial = initial;
      }
    }))
    .views(it => ({
      get valid(): boolean {
        return it.errors!.length === 0;
      }
    })) as any;
  return Meta;
}

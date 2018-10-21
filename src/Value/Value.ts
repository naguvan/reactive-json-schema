import { toJS } from "mobx";
import { IModelType, types } from "mobx-state-tree";
import { ISimpleType } from "mobx-state-tree";

import { IAnything } from "../Common";

import { IMeta, IMetaConfig } from "../Meta";

export interface IValueAttrs<V> {
  readonly title?: string | null;
  readonly enum?: V[] | null;
  readonly const?: V | null;
}

export interface IValueConfig<V, T, C, M extends IMetaConfig<V, C>>
  extends Partial<IValueAttrs<V>> {
  readonly type: T;
  readonly meta?: M | null;
}

export interface IValue<
  V,
  T,
  C,
  M extends IMetaConfig<V, C>,
  F extends M & IMeta<V, C>
> extends IValueAttrs<V> {
  readonly type: T;
  readonly meta: F;
  readonly modified: boolean;
  readonly validating: boolean;
  readonly syncing: boolean;
  readonly data: V;
  readonly valid: boolean;
  readonly errors: string[];

  setValue(value: V): void;
  setTitle(title: string): void;

  reset(): void;
  validate(): void;

  addError(error: string): void;
  addErrors(errors: string[]): void;
  clearErrors(): void;

  sync(value: V): void;

  tryValue(value: IAnything): boolean;
  tryValidate(value: IAnything | undefined | null): string[];

  doValidate(value: V): string[];
  doValidateBase(value: V): string[];
}

export function createValue<
  V,
  T,
  C,
  M extends IMetaConfig<V, C>,
  F extends M & IMeta<V, C>
>(
  type: T,
  kind: ISimpleType<V>,
  defaultv: V,
  meta: IModelType<Partial<M>, F>,
  defaultMeta: M
): IModelType<Partial<IValueConfig<V, T, C, M>>, IValue<V, T, C, M, F>> {
  const Value: IModelType<
    Partial<IValueConfig<V, T, C, M>>,
    IValue<V, T, C, M, F>
  > = types
    .compose(
      types.model("Meta", {
        meta: types.optional(meta, defaultMeta)
      }),
      types.model("Value", {
        const: types.maybe(kind),
        enum: types.maybe(types.array(kind)),
        errors: types.optional(types.array(types.string), []),
        title: types.maybe(types.string),
        type: types.literal(type)
      })
    )
    .volatile(it => ({ _validating: false, syncing: false }))
    .actions(it => ({
      afterCreate() {
        if (it.errors.length > 0) {
          throw new Error(
            `errors property can not be configured for field ${it.title}`
          );
        }

        if (it.meta.name === "" && it.title) {
          const { title } = it;
          it.meta.setName(title.toLowerCase().replace(" ", "-"));
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
      },
      setTitle(title: string): void {
        it.title = title;
      },
      tryValue(value: IAnything): boolean {
        return kind.is(value);
      }
    }))
    .actions(it => ({
      doValidateBase(value: V): string[] {
        const errors: string[] = [];
        if (
          it.meta.mandatory !== null &&
          it.meta.mandatory &&
          (value === null || value === defaultv)
        ) {
          errors.push(`Field is required`);
        }
        if (it.const !== null && value !== it.const) {
          errors.push(`should be equal to ${it.const}`);
        }
        if (
          it.enum &&
          it.enum.length > 0 &&
          it.enum.findIndex(en => en === value) === -1
        ) {
          errors.push(
            `should be equal to one of the allowed values [${it.enum.join(
              ", "
            )}]`
          );
        }
        return errors;
      }
    }))
    .volatile(it => ({
      doValidate(value: V): string[] {
        return it.doValidateBase(value);
      }
    }))
    .volatile(it => ({
      tryValidate(value: IAnything | undefined | null): string[] {
        const validities = kind.validate(value, []);
        const errors: string[] = validities
          .map(validity => validity.message!)
          .filter(message => !!message);
        if (errors.length === 0) {
          errors.push(...it.doValidate(value as V));
        }
        return errors;
      }
    }))
    .views(it => ({
      get modified(): boolean {
        return it.meta.value !== it.meta.initial;
      },
      get valid(): boolean {
        return it.errors!.length === 0;
      },
      get data(): V {
        return toJS(it.meta.value) as V;
      },
      get validating(): boolean {
        return it._validating;
      }
    }))
    .actions(it => ({
      addError(error: string): void {
        it.errors.push(error);
      },
      addErrors(errors: string[]): void {
        it.errors.push(...errors);
      },
      clearErrors(): void {
        it.errors.length = 0;
      }
    }))
    .actions(it => ({
      reset(): void {
        it.meta.setValue(it.meta.initial as V);
        it.clearErrors();
      },
      validate() {
        if (it.syncing /*|| it.validating*/) {
          return [];
        }
        it.clearErrors();
        it._validating = true;
        it.addErrors(it.tryValidate(it.meta.value));
        it._validating = false;
      }
    }))
    .actions(it => ({
      // protected only method
      setValue(value: V): void {
        it.meta.setValue(value);
      }
    }))
    .actions(it => ({
      sync(value: V): void {
        if (!it.syncing) {
          it.syncing = true;
          it.setValue(value);
          it.syncing = false;
          it.validate();
        }
      }
    }));

  return Value;
}

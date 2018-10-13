import { toJS } from "mobx";
import { flow, IModelType, types } from "mobx-state-tree";
import { ISimpleType } from "mobx-state-tree";

import { IAnything } from "../Common";

import { IMeta, IMetaConfig } from "../Meta";

export interface IValueAttrs<V> {
  readonly title?: string | null;
  readonly enum?: V[] | null;
  readonly const?: V | null;
  readonly options?: Array<{ label: string; value: V }> | null;
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

  setValue(value: V): void;
  setTitle(title: string): void;

  reset(): void;
  validate(): Promise<void>;

  sync(value: V): Promise<void>;

  tryValue(value: IAnything): boolean;
  tryValidate(value: IAnything | undefined | null): Promise<string[]>;

  asyncValidate(value: V): Promise<string[]>;
  syncValidate(value: V): string[];
  asyncValidateBase(value: V): Promise<string[]>;
  syncValidateBase(value: V): string[];
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
        options: types.maybe(
          types.array(types.model({ label: types.string, value: kind }))
        ),
        title: types.maybe(types.string),
        type: types.literal(type)
      })
    )
    .volatile(it => ({ _validating: false, syncing: false }))
    .actions(it => ({
      afterCreate() {
        if (it.meta.name === "" && it.title) {
          const { title } = it;
          it.meta.setName(title.toLowerCase().replace(" ", "-"));
        }
        if (
          it.enum != null &&
          it.enum.length > 0 &&
          (it.options == null || it.options.length === 0)
        ) {
          const options = it.enum.map(option => ({
            label: String(option),
            value: option
          }));
          (it.options as any) = options;
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
      async asyncValidateBase(value: V): Promise<string[]> {
        return [];
      },
      syncValidateBase(value: V): string[] {
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
          it.enum != null &&
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
      async asyncValidate(value: V): Promise<string[]> {
        return await it.asyncValidateBase(value);
      },
      syncValidate(value: V): string[] {
        return it.syncValidateBase(value);
      }
    }))
    .volatile(it => ({
      async tryValidate(
        value: IAnything | undefined | null
      ): Promise<string[]> {
        const validities = kind.validate(value, []);
        const errors: string[] = validities
          .map(validity => validity.message!)
          .filter(message => !!message);
        if (errors.length === 0) {
          errors.push(...it.syncValidate(value as V));
          errors.push(...(await it.asyncValidate(value as V)));
        }
        return errors;
      }
    }))
    .views(it => ({
      get modified(): boolean {
        return it.meta.value !== it.meta.initial;
      },
      get valid(): boolean {
        return it.meta.valid;
      },
      get data(): V {
        return toJS(it.meta.value) as V;
      },
      get validating(): boolean {
        return it._validating;
      }
    }))
    .actions(it => ({
      reset(): void {
        it.meta.setValue(it.meta.initial as V);
        it.meta.clearErrors();
      },
      validate: flow<void>(function*() {
        if (it.syncing /*|| it.validating*/) {
          return [];
        }
        it.meta.clearErrors();
        it._validating = true;
        it.meta.addErrors(yield it.tryValidate(it.meta.value));
        it._validating = false;
      })
    }))
    .actions(it => ({
      // protected only method
      setValue(value: V): void {
        it.meta.setValue(value);
      }
    }))
    .actions(it => ({
      async sync(value: V): Promise<void> {
        if (!it.syncing) {
          it.syncing = true;
          it.setValue(value);
          it.syncing = false;
          await it.validate();
        }
      }
    }));

  return Value;
}

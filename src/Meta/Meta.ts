import { IModelType, ISimpleType, types } from "mobx-state-tree";

// tslint:disable-next-line:no-empty-interface
export interface IMeta<T> {
  readonly component?: T;
  readonly help?: string | null;
}

export function createMeta<T extends string>(
  ...components: T[]
): IModelType<Partial<IMeta<T>>, IMeta<T>> {
  const Meta: IModelType<Partial<IMeta<T>>, IMeta<T>> = types.model("Meta", {
    component: types.optional(
      types.enumeration("component", components) as ISimpleType<T>,
      undefined
    ),
    help: types.maybe(types.string)
  });
  return Meta;
}

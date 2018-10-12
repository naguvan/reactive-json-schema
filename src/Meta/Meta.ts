import { IModelType, ISimpleType, types } from "mobx-state-tree";

// tslint:disable-next-line:no-empty-interface
export interface IMeta<T> {
  readonly component?: T | null;
  readonly help?: string | null;
  readonly sequence?: number | null;
}

export function createMeta<T extends string>(
  ...components: T[]
): IModelType<Partial<IMeta<T>>, IMeta<T>> {
  const Meta: IModelType<Partial<IMeta<T>>, IMeta<T>> = types.model("Meta", {
    component: types.maybe(types.enumeration(
      "component",
      components
    ) as ISimpleType<T>),
    help: types.maybe(types.string),
    sequence: types.maybe(types.number)
  });
  return Meta;
}

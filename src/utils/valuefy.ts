import { ITypeConfig } from "../Type";

import { isArray, isUndefined, keys } from "./common";

export function valuefy(type: ITypeConfig, value: any): ITypeConfig {
  if (isUndefined(value)) {
    return type;
  }
  switch (type.type) {
    case "object": {
      const { properties = {} } = type;
      return {
        ...type,
        properties: keys(properties).reduce(
          (props, prop) => {
            props[prop] = valuefy(
              properties[prop],
              isUndefined(value) ? undefined : value[prop]
            );
            return props;
          },
          {} as { [key: string]: ITypeConfig }
        )
      };
    }
    case "array": {
      const { items } = type;
      if (isArray(items)) {
        return {
          ...type,
          items: items.map((item, index) =>
            valuefy(item, isUndefined(value) ? undefined : value[index])
          )
        };
      }
    }
    case "null":
    case "number":
    case "boolean":
    case "string":
      return { ...type, meta: { ...type.meta, value } } as ITypeConfig;
  }
}

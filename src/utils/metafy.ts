import { IArrayMetaProps } from "../Array";
import { IObjectMetaProps } from "../Object";
import { ITypeConfig, ITypeMetaProps } from "../Type";

import { isArray, keys } from "./common";

export function metafy(type: ITypeConfig, meta: ITypeMetaProps): ITypeConfig {
  if (!meta) {
    return type;
  }
  if (type.type !== meta.type) {
    throw new Error(`types not matching for type : ${type.title}`);
  }
  switch (type.type) {
    case "object": {
      const { properties = {} } = type;
      const {
        properties: mproperties,
        type: _,
        ...others
      } = meta as IObjectMetaProps;
      return {
        ...type,
        meta: { ...type.meta, ...others },
        properties: keys(properties).reduce(
          (props, prop) => {
            props[prop] = metafy(properties[prop], mproperties![prop]);
            return props;
          },
          {} as { [key: string]: ITypeConfig }
        )
      };
    }
    case "array": {
      const { items } = type;
      const { items: mitems, type: _, ...others } = meta as IArrayMetaProps;
      if (isArray(items) && mitems) {
        return {
          ...type,
          items: items.map((item, index) =>
            metafy(item, (mitems as ITypeMetaProps[])[index])
          ),
          meta: { ...type.meta, ...others }
        };
      } else if (items && mitems) {
        return {
          ...type,
          items: metafy(items as ITypeConfig, mitems as ITypeMetaProps),
          meta: { ...type.meta, ...others }
        } as ITypeConfig;
      } else {
        return { ...type, meta: { ...type.meta, ...others } } as ITypeConfig;
      }
    }
    case "null":
    case "number":
    case "boolean":
    case "string": {
      const { type: _, ...others } = meta;
      return { ...type, meta: { ...type.meta, ...others } } as ITypeConfig;
    }
  }
}

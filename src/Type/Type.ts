import { IComplexType as IMobxType, types } from "mobx-state-tree";

import { IArray, IArrayConfig, IArrayMetaProps } from "../Array";
import { IBoolean, IBooleanConfig, IBooleanMetaProps } from "../Boolean";
import { INull, INullConfig, INullMetaProps } from "../Null";
import { INumber, INumberConfig, INumberMetaProps } from "../Number";
import { IObject, IObjectConfig, IObjectMetaProps } from "../Object";
import { IString, IStringConfig, IStringMetaProps } from "../String";

export type ITypeMetaProps =
  | IStringMetaProps
  | INumberMetaProps
  | IBooleanMetaProps
  | INullMetaProps
  | IObjectMetaProps
  | IArrayMetaProps;

export type ITypeConfig =
  | IStringConfig
  | INumberConfig
  | IBooleanConfig
  | INullConfig
  | IObjectConfig
  | IArrayConfig;

export type IType = IString | INumber | IBoolean | INull | IObject | IArray;

let Type: IMobxType<Partial<ITypeConfig>, IType>;

import { mappings } from "../Common";

export function createType(): IMobxType<Partial<ITypeConfig>, IType> {
  if (!Type) {
    Type = types.union(
      snapshot =>
        snapshot && typeof snapshot === "object" && "type" in snapshot
          ? mappings[snapshot.type]
          : mappings.null,
      mappings.string,
      mappings.number,
      mappings.boolean,
      mappings.null,
      mappings.object,
      mappings.array
    );
  }
  return Type;
}

// Required for Mapping to work

import "../String";

import "../Number";

import "../Boolean";

import "../Null";

import "../Object";

import "../Array";

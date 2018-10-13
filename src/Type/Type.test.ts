import { IArray } from "../Array";
import { INumber } from "../Number";
import { IObject, IObjectConfig } from "../Object";
import { IString } from "../String";
import { IType } from "./Type";

import { createType } from "./Type";

import { toJS } from "mobx";
import { keys } from "../utils";

import { getSnapshot } from "mobx-state-tree";

const Type = createType();

test("create string type ", () => {
  const type = Type.create({
    meta: {
      value: "sk"
    },
    minLength: 4,
    title: "naguvan",
    type: "string"
  }) as IString;
  expect(type.type).toBe("string");
  expect(type.title).toBe("naguvan");
  expect(type.data).toBe("sk");
  expect(type.minLength).toBe(4);
});

test("create number type ", () => {
  const type = Type.create({
    meta: {
      value: 50
    },
    title: "naguvan",
    type: "number"
  }) as INumber;
  expect(type.type).toBe("number");
  expect(type.title).toBe("naguvan");
  expect(type.data).toBe(50);
});

test("create boolean type ", () => {
  const type = Type.create({
    meta: {
      value: true
    },
    title: "naguvan",
    type: "boolean"
  });
  expect(type.type).toBe("boolean");
  expect(type.title).toBe("naguvan");
  expect(type.meta.name).toBe(type.title);
  expect(type.data).toBe(true);
});

test("create null type ", () => {
  const type = Type.create({
    meta: {
      value: null
    },
    title: "naguvan",
    type: "null"
  });
  expect(type.type).toBe("null");
  expect(type.title).toBe("naguvan");
  expect(type.data).toBe(null);
});

test("create object type", () => {
  const type = Type.create({
    properties: {
      age: {
        meta: {
          value: 1
        },
        title: "age",
        type: "number"
      },
      name: {
        meta: {
          length: 100,
          value: "naguvan"
        },
        title: "name",
        type: "string"
      }
    },
    title: "naguvan",
    type: "object"
  } as IObjectConfig) as IObject;
  expect(type.type).toBe("object");
  expect(type.title).toBe("naguvan");
  expect(type.data).toEqual({ name: "naguvan", age: 1 });
  expect(type.additionalProperties).toBeNull();
  expect(type.maxProperties).toBeNull();
  expect(type.minProperties).toBeNull();

  expect(type.properties).not.toBeNull();

  expect(keys(toJS(type.properties!)).length).toBe(2);
  expect(keys(toJS(type.properties!))).toEqual(["age", "name"]);

  expect(type.properties!.get("name")!.title).toBe("name");
  expect(type.properties!.get("name")!.data).toBe("naguvan");
  expect(type.properties!.get("name")!.type).toBe("string");
});

test("create array type", () => {
  const type = Type.create({
    items: {
      type: "number"
    },
    title: "naguvan",
    type: "array"
  }) as IArray;
  expect(type.type).toBe("array");
  expect(type.title).toBe("naguvan");
  expect(type.data).toEqual([]);
  expect(type.additionalItems).toBeNull();
  expect(type.maxItems).toBeNull();
  expect(type.minItems).toBeNull();
  expect(type.uniqueItems).toBeNull();

  expect(type.items).not.toBeNull();
  expect((type.items as IType)!.type).toBe("number");
});

test("test snapshot create", () => {
  const config: IObjectConfig = {
    additionalProperties: null,
    maxProperties: null,
    meta: {
      disabled: false,
      mandatory: false,
      name: "",
      visible: true
    },
    minProperties: null,
    properties: {
      age: {
        meta: {
          default: 0,
          disabled: false,
          initial: 0,
          mandatory: false,
          name: "",
          value: 0,
          visible: true
        },
        multipleOf: 2,
        title: "age",
        type: "number"
      },
      name: {
        meta: {
          disabled: false,
          mandatory: false,
          name: "",
          value: "",
          visible: true
        },
        minLength: 3,
        title: "name",
        type: "string"
      }
    },
    required: null,
    title: "snapshot",
    type: "object"
  };

  const type = Type.create(config) as IObject;
  expect(type.type).toBe("object");
  expect(type.title).toBe("snapshot");
});

test("form sample schema", async () => {
  const config: IObjectConfig = {
    properties: {
      agree: {
        const: true,
        meta: {
          value: false
        },
        title: "I agree with your terms",
        type: "boolean"
      },
      array: {
        items: {
          properties: {
            age: {
              meta: {
                value: 0
              },
              minimum: 2,
              multipleOf: 2,
              title: "age",
              type: "number"
            },
            name: {
              minLength: 3,
              title: "name",
              type: "string"
            }
          },
          type: "object"
        },
        maxItems: 4,
        minItems: 2,
        title: "Array",
        type: "array"
      },
      color: {
        format: "color",
        meta: {
          component: "color"
        },
        title: "In which color",
        type: "string"
      },
      ipv4: {
        format: "ipv4",
        maxLength: 20,
        minLength: 5,
        title: "ipv4",
        type: "string"
      },
      name: {
        properties: {
          age: {
            maximum: 10,
            meta: {
              sequence: 2,
              value: 5
            },
            minimum: 3,
            title: "Age",
            type: "number"
          },
          first: {
            meta: {
              sequence: 1,
              value: "naguvan"
            },
            minLength: 5,
            title: "First",
            type: "string"
          },
          last: {
            meta: {
              sequence: 2,
              value: "sk"
            },
            minLength: 5,
            title: "Last",
            type: "string"
          },
          middle: {
            meta: {
              sequence: 1,
              value: "sk"
            },
            minLength: 5,
            title: "Middle",
            type: "string"
          }
        },
        type: "object"
        // layout: [["first", "last"], "middle", "age"]
      },
      size: {
        maximum: 10,
        meta: {
          value: 5
        },
        minimum: 3,
        multipleOf: 3,
        title: "Size",
        type: "number"
      },
      title: {
        meta: {
          value: "sk"
        },
        minLength: 5,
        title: "Title",
        type: "string"
      },
      type: {
        enum: [1, 2],
        meta: {
          options: [{ label: "One", value: 1 }, { label: "Two", value: 2 }]
        },
        title: "Select a type",
        type: "number"
      }
    },
    title: "form schema",
    type: "object"
  };

  const type = Type.create(config) as IObject;
  expect(type.type).toBe("object");
  expect(type.title).toBe("form schema");

  expect(type.data).toEqual({
    agree: false,
    array: [],
    color: "",
    ipv4: "",
    name: {
      age: 5,
      first: "naguvan",
      last: "sk",
      middle: "sk"
    },
    size: 5,
    title: "sk",
    type: 0
  });

  const color = type.getProperty("color") as IString;
  color.setValue("#ffffff");

  expect(type.data).toEqual({
    agree: false,
    array: [],
    color: "#ffffff",
    ipv4: "",
    name: {
      age: 5,
      first: "naguvan",
      last: "sk",
      middle: "sk"
    },
    size: 5,
    title: "sk",
    type: 0
  });

  await type.validate();

  expect(type.valid).toBe(false);

  const errors = type.getFieldErrors();

  expect(errors.errors).toEqual([]);

  const properties = errors.properties!;

  expect(properties.agree).toEqual(["should be equal to true"]);
  expect((properties.array as any).errors).toEqual([
    "should NOT have less than 2 items"
  ]);
  expect(properties.color).toEqual([]);
  expect(properties.ipv4).toEqual([
    "should NOT be shorter than 5 characters",
    "should match format ipv4"
  ]);
  expect(properties.name).toEqual({
    errors: [],
    properties: {
      age: [],
      first: [],
      last: ["should NOT be shorter than 5 characters"],
      middle: ["should NOT be shorter than 5 characters"]
    }
  });
  expect(properties.size).toEqual(["should be multiple of 3"]);
  expect(properties.type).toEqual([
    "should be equal to one of the allowed values [1, 2]"
  ]);

  await type.sync({ agree: true, size: 6, name: { last: "kannapiran" } });

  expect(type.getProperty("size")!.valid).toBe(true);
  expect(type.getProperty("agree")!.valid).toBe(true);

  const name = type.getProperty("name")! as IObject;
  expect(name.getFieldErrors()).toEqual({
    errors: [],
    properties: {
      age: [],
      first: [],
      last: [],
      middle: ["should NOT be shorter than 5 characters"]
    }
  });

  await type.sync({ title: "senthilnathan", type: 2 });

  const options = type.getProperty("type")!.meta.options;
  expect(options).not.toBeFalsy();
  expect(options!.length).toBe(2);

  expect(type.getProperty("title")!.valid).toBe(true);
  expect(type.getProperty("type")!.valid).toBe(true);

  const ipv4 = type.getProperty("ipv4")! as IString;
  await ipv4.sync("12.45.67.70");

  expect(type.getProperty("ipv4")!.valid).toBe(true);

  await type.sync({ array: [{}] });

  const array = type.getProperty("array")! as IArray;

  await array.push();

  const item = array.elements[0] as IObject;

  expect(item.valid).toBe(false);

  expect(array.getFieldErrors()).toEqual({
    errors: [],
    items: [
      {
        errors: [],
        properties: {
          age: ["should NOT be lesser than 2"],
          name: ["should NOT be shorter than 3 characters"]
        }
      },
      {
        errors: [],
        properties: {
          age: ["should NOT be lesser than 2"],
          name: ["should NOT be shorter than 3 characters"]
        }
      }
    ]
  });

  await type.sync({
    name: { middle: "senthilnathan" }
  });

  array.updateIndexValue(0, { age: 4, name: "naguvan" } as any);
  array.updateIndexValue(1, { age: 5, name: "naguvan" } as any);

  expect(item.valid).toBe(false);

  await type.validate();

  expect(item.valid).toBe(true);

  expect(type.data).toEqual({
    agree: true,
    array: [
      {
        age: 4,
        name: "naguvan"
      },
      {
        age: 5,
        name: "naguvan"
      }
    ],
    color: "#ffffff",
    ipv4: "12.45.67.70",
    name: {
      age: 5,
      first: "naguvan",
      last: "kannapiran",
      middle: "senthilnathan"
    },
    size: 6,
    title: "senthilnathan",
    type: 2
  });
});

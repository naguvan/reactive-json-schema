import { IObjectConfig } from "../Object";

import { valuefy } from "./valuefy";

test("test valuefy", () => {
  const config: IObjectConfig = {
    properties: {
      agree: {
        const: true,
        title: "I agree with your terms",
        type: "boolean"
      },
      array: {
        items: {
          properties: {
            age: {
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
        meta: {
          layout: [["first", "last"], "middle", "age"]
        },
        properties: {
          age: {
            maximum: 10,
            meta: {
              sequence: 2,
              value: 10
            },
            minimum: 3,
            title: "Age",
            type: "number"
          },
          first: {
            meta: {
              sequence: 1
            },
            minLength: 5,
            title: "First",
            type: "string"
          },
          last: {
            meta: {
              sequence: 2
            },
            minLength: 5,
            title: "Last",
            type: "string"
          },
          middle: {
            meta: {
              sequence: 1,
              value: "sks"
            },
            minLength: 5,
            title: "Middle",
            type: "string"
          }
        },
        type: "object"
      },
      size: {
        maximum: 10,
        meta: {
          value: 20
        },
        minimum: 3,
        multipleOf: 3,
        title: "Size",
        type: "number"
      },
      title: {
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

  const value = {
    agree: true,
    array: [],
    name: {
      first: "naguvan",
      last: "sk"
    },
    title: "sk"
  };

  const type = valuefy(config, value) as IObjectConfig;

  expect(type.properties!.agree.meta!.value).toBe(true);
  expect(type.properties!.array.meta!.value).toEqual([]);
  expect(type.properties!.size.meta!.value).toBe(20);
  expect(type.properties!.title.meta!.value).toBe("sk");

  const name = type.properties!.name as IObjectConfig;
  expect(name.properties!.age.meta!.value).toBe(10);
  expect(name.properties!.first.meta!.value).toBe("naguvan");
  expect(name.properties!.last.meta!.value).toBe("sk");
  expect(name.properties!.middle.meta!.value).toBe("sks");
});

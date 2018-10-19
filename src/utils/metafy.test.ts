import { IObject, IObjectConfig, IObjectMetaProps } from "../Object";

import { metafy } from "./metafy";

test("test metafy", () => {
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
            minimum: 3,
            title: "Age",
            type: "number"
          },
          first: {
            minLength: 5,
            title: "First",
            type: "string"
          },
          last: {
            minLength: 5,
            title: "Last",
            type: "string"
          },
          middle: {
            minLength: 5,
            title: "Middle",
            type: "string"
          }
        },
        type: "object"
      },
      size: {
        maximum: 10,
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
        title: "Select a type",
        type: "number"
      }
    },
    title: "form schema",
    type: "object"
  };

  const meta: IObjectMetaProps = {
    properties: {
      agree: {
        type: "boolean",
        value: true
      },
      color: {
        component: "color",
        type: "string"
      },
      name: {
        layout: [["first", "last"], "middle", "age"],
        properties: {
          age: {
            sequence: 2,
            type: "number"
          },
          first: {
            sequence: 1,
            type: "string"
          },
          last: {
            component: "select",
            sequence: 2,
            type: "string"
          },
          middle: {
            sequence: 1,
            type: "string"
          }
        },
        type: "object"
      },
      size: {
        component: "range",
        type: "number"
      },
      type: {
        options: [{ label: "One", value: 1 }, { label: "Two", value: 2 }],
        type: "number"
      }
    },
    type: "object"
  };

  const type = metafy(config, meta) as IObjectConfig;

  expect(type.properties!.agree.meta!.value).toBe(true);
  expect(type.properties!.color.meta!.component).toBe("color");
  expect(type.properties!.size.meta!.component).toBe("range");
  expect(type.properties!.type.meta!.options).toEqual([
    { label: "One", value: 1 },
    { label: "Two", value: 2 }
  ]);

  const name = type.properties!.name as IObjectConfig;
  expect(name.meta!.layout).toEqual([["first", "last"], "middle", "age"]);
  expect(name.properties!.age.meta!.sequence).toBe(2);
  expect(name.properties!.first.meta!.sequence).toBe(1);
  expect(name.properties!.last.meta!.component).toBe("select");
  expect(name.properties!.last.meta!.sequence).toBe(2);
  expect(name.properties!.middle.meta!.sequence).toBe(1);
});

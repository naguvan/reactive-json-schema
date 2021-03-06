// tslint:disable:max-file-line-count

import { createObject } from "./Object";

import { IObject, IObjectConfig } from "./Object";

import { toJS } from "mobx";
import { keys } from "../utils";

describe("Object testing", () => {
  const config: IObjectConfig = {
    meta: {
      component: "grid",
      help: "personal info",
      layout: ["age", "name", ["age", ["name"]]],
      sequence: 5
    },
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
          value: "naguvan"
        },
        title: "name",
        type: "string"
      }
    },
    title: "naguvan",
    type: "object"
  };

  const Object = createObject();

  test("check object default meta", () => {
    const type = Object.create();
    expect(type.meta).not.toBeNull();
    expect(type.meta.component).toBe("layout");
    expect(type.meta.sequence).toBeNull();
    expect(type.meta.help).toBeNull();
    expect(type.meta.layout).toBeNull();
  });

  test("test object meta", () => {
    const type = Object.create(config);
    expect(type.meta).not.toBeNull();
    expect(type.meta.component).toBe("grid");
    expect(type.meta.help).toBe("personal info");
    expect(type.meta.sequence).toBe(5);
    expect(type.meta.layout).toEqual(["age", "name", ["age", ["name"]]]);
  });

  test("create object type", () => {
    const type = Object.create(config);
    expect(type.type).toBe("object");
    expect(type.title).toBe("naguvan");
    expect(type.data).toEqual({ age: 1, name: "naguvan" });
    expect(type.additionalProperties).toBeNull();
    expect(type.maxProperties).toBeNull();
    expect(type.minProperties).toBeNull();

    expect(type.properties).not.toBeNull();
    expect(keys(toJS(type.properties!)).length).toBe(2);
    expect(keys(toJS(type.properties!))).toEqual(["age", "name"]);

    expect(type.properties!.get("name")!.title).toBe("name");
    expect(type.properties!.get("name")!.data).toBe("naguvan");
    expect(type.properties!.get("name")!.type).toBe("string");

    expect(type.properties!.get("age")!.title).toBe("age");
    expect(type.properties!.get("age")!.data).toBe(1);
    expect(type.properties!.get("age")!.type).toBe("number");
  });

  test("nested object type", () => {
    const type = Object.create({
      properties: {
        city: {
          properties: {
            name: {
              meta: {
                value: "chennai"
              },
              title: "name",
              type: "string"
            }
          },
          title: "city",
          type: "object"
        }
      },
      title: "naguvan",
      type: "object"
    });

    const city: IObject = type.properties!.get("city")! as IObject;
    expect(city).not.toBeNull();
    expect(city.title).toBe("city");
    expect(city.properties!.get("name")!.title).toBe("name");
    expect(city.properties!.get("name")!.data).toBe("chennai");
    expect(city.properties!.get("name")!.type).toBe("string");
  });

  test("validate config object value", () => {
    const type = Object.create({ ...config });
    expect(type.data).toEqual({ age: 1, name: "naguvan" });
  });

  test("test invalid minProperties configuration", () => {
    expect(() =>
      Object.create({
        ...config,
        minProperties: -10
      })
    ).toThrowError(`minProperties can not be negative`);
  });

  test("test invalid maxProperties configuration", () => {
    expect(() =>
      Object.create({
        ...config,
        maxProperties: -10
      })
    ).toThrowError(`maxProperties can not be negative`);
  });

  test("test duplicate required properties configuration", () => {
    expect(() =>
      Object.create({
        ...config,
        required: ["name", "age", "name"]
      })
    ).toThrowError(`required should not have duplicate properties`);
  });

  test("validate minProperties valid", () => {
    const type = Object.create({ ...config, minProperties: 2 });

    type.setValue({ name: "naguvan", age: 1 });
    expect(type.data).toEqual({ name: "naguvan", age: 1 });

    type.validate();

    expect(type.valid).toBe(true);
    expect(type.errors!.slice(0)).toEqual([]);
  });

  test("validate minProperties invalid", () => {
    const type = Object.create({ ...config, minProperties: 2 });

    type.setValue({ name: "naguvan" });
    expect(type.data).toEqual({ name: "naguvan", age: 1 });

    type.validate();

    expect(type.valid).toBe(false);
    expect(type.errors!.slice(0)).toEqual([
      "should NOT have less than 2 properties"
    ]);
  });

  test("validate maxProperties valid", () => {
    const type = Object.create({ ...config, maxProperties: 1 });

    type.setValue({ name: "naguvan" });
    expect(type.data).toEqual({ name: "naguvan", age: 1 });

    type.validate();

    expect(type.valid).toBe(true);
    expect(type.errors!.slice(0)).toEqual([]);
  });

  test("validate maxProperties invalid", () => {
    const type = Object.create({ ...config, maxProperties: 1 });

    type.setValue({ name: "naguvan", age: 1 });
    expect(type.data).toEqual({ name: "naguvan", age: 1 });

    type.validate();

    expect(type.valid).toBe(false);
    expect(type.errors!.slice(0)).toEqual([
      "should NOT have more than 1 properties"
    ]);
  });

  test("validate required valid", () => {
    const type = Object.create({
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
            value: "naguvan"
          },
          title: "name",
          type: "string"
        }
      },

      required: ["name", "age"],
      title: "naguvan",

      type: "object"
    });

    type.setValue({ name: "naguvan", age: 3 });
    expect(type.data).toEqual({ name: "naguvan", age: 3 });

    type.validate();

    expect(type.valid).toBe(true);
    expect(type.errors!.slice(0)).toEqual([]);
  });

  test("validate missing required properties", () => {
    const type = Object.create({
      properties: {
        age: {
          title: "age",
          type: "number"
        },
        name: {
          meta: {
            value: "naguvan"
          },
          title: "name",
          type: "string"
        }
      },
      required: ["name", "age"],
      title: "naguvan",
      type: "object"
    });

    type.setValue({ name: "naguvan" });
    expect(toJS(type.meta.value)).toEqual({ name: "naguvan" });

    type.validate();

    expect(type.valid).toBe(false);
    expect(type.errors!.slice(0)).toEqual([]);
    expect(type.getProperty("age")!.errors!.slice(0)).toEqual([
      "Field is required"
    ]);
  });

  test("validate allowing additionalProperties", () => {
    const type = Object.create({ ...config, additionalProperties: true });

    type.setValue({
      age: 1,
      city: "chennai",
      country: "india",
      name: "naguvan"
    });
    expect(type.data).toEqual({
      age: 1,
      city: "chennai",
      country: "india",
      name: "naguvan"
    });

    type.validate();

    expect(type.valid).toBe(true);
    expect(type.errors!.slice(0)).toEqual([]);
  });

  test("validate not allowing additionalProperties", () => {
    const type = Object.create({ ...config, additionalProperties: false });

    type.setValue({
      age: 1,
      city: "chennai",
      country: "india",
      name: "naguvan"
    });
    expect(type.data).toEqual({
      age: 1,
      city: "chennai",
      country: "india",
      name: "naguvan"
    });

    type.validate();

    expect(type.valid).toBe(false);
    expect(type.errors!.slice(0)).toEqual([
      `should NOT have additional properties [city, country]`
    ]);
  });

  test("validate additionalProperties allowed types", () => {
    const type = Object.create({
      ...config,
      additionalProperties: { type: "string" }
    });

    type.setValue({
      age: 1,
      city: "chennai",
      country: "india",
      name: "naguvan"
    });
    expect(type.data).toEqual({
      age: 1,
      city: "chennai",
      country: "india",
      name: "naguvan"
    });

    type.validate();

    expect(type.valid).toBe(true);
    expect(type.errors!.slice(0)).toEqual([]);
  });

  test("validate additionalProperties not allowed types", () => {
    const type = Object.create({
      ...config,
      additionalProperties: { type: "number" }
    });

    type.setValue({
      age: 1,
      city: "chennai",
      country: "india",
      name: "naguvan"
    });
    expect(type.data).toEqual({
      age: 1,
      city: "chennai",
      country: "india",
      name: "naguvan"
    });

    type.validate();

    expect(type.valid).toBe(false);
    expect(type.errors!.slice(0)).toEqual([
      `additional property 'city' is not a number`,
      `additional property 'country' is not a number`
    ]);
  });

  test("validate additionalProperties allowed types with valid format", () => {
    const type = Object.create({
      ...config,
      additionalProperties: { type: "string", format: "email" }
    });

    type.setValue({
      age: 1,
      contact: "naguvan@sk.com",
      name: "naguvan"
    });
    expect(type.data).toEqual({
      age: 1,
      contact: "naguvan@sk.com",
      name: "naguvan"
    });

    type.validate();

    expect(type.valid).toBe(true);
    expect(type.errors!.slice(0)).toEqual([]);
  });

  test("get configured property", () => {
    const type = Object.create({
      ...config,
      additionalProperties: { type: "string", format: "email" }
    });

    type.setValue({
      age: 2,
      contact: "naguvan0sk.com",
      name: "naguvan"
    });

    expect(type.getProperty("name")).not.toBeUndefined();
    expect(type.getProperty("age")).not.toBeUndefined();
    expect(type.getProperty("contact")).toBeUndefined();

    expect(type.getProperty("name")!.data).toBe("naguvan");
    expect(type.getProperty("age")!.data).toBe(2);
  });

  test("get configured property data", () => {
    const type = Object.create({
      ...config,
      additionalProperties: { type: "string", format: "email" }
    });

    expect(type.getProperty("name")!.data).toBe("naguvan");
    expect(type.getProperty("age")!.data).toBe(1);

    type.setValue({
      age: 32,
      contact: "naguvan0sk.com",
      name: "skclusive"
    });

    expect(type.getProperty("name")!.data).toBe("skclusive");
    expect(type.getProperty("age")!.data).toBe(32);
  });

  test("get configured property data", () => {
    const type = Object.create({
      properties: {
        age: {
          maximum: 15,
          meta: {
            value: 1
          },
          minimum: 5,
          title: "age",
          type: "number"
        },
        name: {
          meta: {
            value: "naguvan"
          },
          minLength: 5,
          title: "name",
          type: "string"
        }
      },
      title: "naguvan",
      type: "object"
    });

    expect(type.getProperty("name")!.data).toBe("naguvan");
    expect(type.getProperty("age")!.data).toBe(1);

    expect(type.getProperty("name")!.valid).toBe(true);
    expect(type.getProperty("age")!.valid).toBe(true);

    type.setValue({
      age: 32,
      name: "sk"
    });

    expect(type.getProperty("name")!.data).toBe("sk");
    expect(type.getProperty("age")!.data).toBe(32);

    type.validate();

    expect(type.getProperty("name")!.valid).toBe(false);
    expect(type.getProperty("age")!.valid).toBe(false);
  });

  test("nested object type validation", () => {
    const type = Object.create({
      properties: {
        city: {
          properties: {
            name: {
              maxLength: 7,
              meta: {
                value: "madurai"
              },
              title: "name",
              type: "string"
            }
          },
          title: "city",
          type: "object"
        }
      },
      title: "naguvan",
      type: "object"
    });

    const city: IObject = type.properties!.get("city")! as IObject;
    expect(city).not.toBeNull();
    expect(city.title).toBe("city");

    type.setValue({ city: { name: "manamadurai" } });

    type.validate();

    expect(type.valid).toBe(false);

    expect(city.properties!.get("name")!.data).toBe("manamadurai");
    expect(city.properties!.get("name")!.valid).toBe(false);
    expect(toJS(city.properties!.get("name")!.errors)).toEqual([
      "should NOT be longer than 7 characters"
    ]);
  });

  test("nested object type modification and validation", () => {
    const type = Object.create({
      properties: {
        city: {
          properties: {
            name: {
              maxLength: 7,
              meta: {
                value: "madurai"
              },
              title: "name",
              type: "string"
            }
          },
          title: "city",
          type: "object"
        }
      },
      title: "naguvan",
      type: "object"
    });

    const city: IObject = type.properties!.get("city")! as IObject;
    expect(city).not.toBeNull();
    expect(city.title).toBe("city");

    city.sync({ name: "manamadurai" });

    expect(city.properties!.get("name")!.data).toBe("manamadurai");
    expect(city.properties!.get("name")!.valid).toBe(false);
    expect(toJS(city.properties!.get("name")!.errors)).toEqual([
      "should NOT be longer than 7 characters"
    ]);
  });
});

import { types } from "mobx-state-tree";
import { createValue, IValueConfig } from "./Value";

import { createMeta, IMeta, IMetaConfig } from "../Meta";

describe("value test cases", () => {
  const config: IValueConfig<
    number,
    "number",
    "range",
    IMetaConfig<number, "range">
  > = {
    meta: {
      component: "range",
      value: 10
    },
    title: "naguvan",
    type: "number"
  };

  const ValueMeta = createMeta<
    number,
    "range",
    IMetaConfig<number, "range">,
    IMeta<number, "range">
  >(types.number, 0, "range");

  const Value = createValue<
    number,
    "number",
    "range",
    IMetaConfig<number, "range">,
    IMeta<number, "range">
  >("number", types.number, 0, ValueMeta, {
    component: "range",
    value: 0
  });

  test("check type meta", () => {
    const type = Value.create(config);
    expect(type.meta).not.toBeNull();
    expect(type.meta.component).toBe("range");
    expect(type.meta.sequence).toBeNull();
    expect(type.meta.help).toBeNull();
  });

  test("createValue type type", () => {
    const type = Value.create(config);
    expect(type.type).toBe("number");
    expect(type.title).toBe("naguvan");
    expect(type.meta.value).toBe(10);
    expect(type.meta.initial).toBe(10);
    expect(type.modified).toBe(false);

    expect(type.meta.name).toBe(type.title);
    expect(type.meta.mandatory).toBe(false);
    expect(type.meta.disabled).toBe(false);
    expect(type.meta.visible).toBe(true);

    expect(type.validating).toBe(false);
    expect(type.errors!.length).toBe(0);
  });

  test("change type value", () => {
    const type = Value.create({
      ...config,
      meta: {
        value: 20
      }
    });

    expect(type.meta.value).toBe(20);
    expect(type.meta.initial).toBe(20);
    expect(type.modified).toBe(false);

    type.setValue(30);
    expect(type.meta.value).toBe(30);
    expect(type.meta.initial).toBe(20);
    expect(type.modified).toBe(true);

    type.reset();
    expect(type.meta.value).toBe(20);
    expect(type.modified).toBe(false);
  });

  test("change type name", () => {
    const type = Value.create(config);

    type.meta.setName("skclusive");
    expect(type.meta.name).toBe("skclusive");
  });

  test("change mandatory property", () => {
    const type = Value.create(config);

    expect(type.meta.mandatory).toBe(false);

    type.meta.setMandatory(true);
    expect(type.meta.mandatory).toBe(true);
  });

  test("change disabled property", () => {
    const type = Value.create({
      ...config,
      meta: {
        disabled: true
      }
    });

    expect(type.meta.disabled).toBe(true);

    type.meta.setDisabled(false);
    expect(type.meta.disabled).toBe(false);
  });

  test("change visible property", () => {
    const type = Value.create({
      ...config,
      meta: {
        visible: false
      }
    });

    expect(type.meta.visible).toBe(false);

    type.meta.setDisabled(false);
    expect(type.meta.visible).toBe(false);

    type.meta.setVisible(true);
    expect(type.meta.visible).toBe(true);
  });

  test("change error property", () => {
    const type = Value.create(config);

    expect(type.errors!.length).toBe(0);
    expect(type.valid).toBe(true);

    type.addError("this type has some error");
    expect(type.errors!.slice(0)).toEqual(["this type has some error"]);
    expect(type.valid).toBe(false);

    type.reset();
    expect(type.errors!.length).toBe(0);
    expect(type.valid).toBe(true);
  });

  test("check validating property", () => {
    const type = Value.create(config);

    expect(type.validating).toBe(false);

    type.validate();

    // expect(type.validating).toBe(true);
    expect(type.validating).toBe(false);
  });

  test("validate const valid", () => {
    const type = Value.create({ ...config, const: 5 });

    type.setValue(5);
    expect(type.meta.value).toBe(5);

    type.validate();

    expect(type.valid).toBe(true);
    expect(type.errors!.slice(0)).toEqual([]);
  });

  test("validate const invalid", () => {
    const type = Value.create({ ...config, const: 5 });

    type.setValue(10);
    expect(type.meta.value).toBe(10);

    type.validate();

    expect(type.valid).toBe(false);
    expect(type.errors!.slice(0)).toEqual(["should be equal to 5"]);
  });

  test("validate enum valid", () => {
    const type = Value.create({ ...config, enum: [5, 10] });

    type.setValue(5);
    expect(type.meta.value).toBe(5);

    type.validate();

    expect(type.valid).toBe(true);
    expect(type.errors!.slice(0)).toEqual([]);
  });

  test("validate enum invalid", () => {
    const type = Value.create({ ...config, enum: [5, 20] });

    type.setValue(10);
    expect(type.meta.value).toBe(10);

    type.validate();

    expect(type.valid).toBe(false);
    expect(type.errors!.slice(0)).toEqual([
      "should be equal to one of the allowed values [5, 20]"
    ]);
  });
});

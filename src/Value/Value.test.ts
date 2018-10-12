import { types } from "mobx-state-tree";
import { createValue, IValueConfig } from "./Value";

import { createMeta, IMeta, IMetaConfig } from "../Meta";

const config: IValueConfig<
  number,
  "number",
  "range",
  IMeta<number, "range">
> = {
  title: "naguvan",
  type: "number",
  value: 10
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
>("number", types.number, 0, ValueMeta, { component: "range" });

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
  expect(type.value).toBe(10);
  expect(type.meta.initial).toBe(10);
  expect(type.modified).toBe(false);

  expect(type.meta.name).toBe(type.title);
  expect(type.meta.mandatory).toBe(false);
  expect(type.meta.disabled).toBe(false);
  expect(type.meta.visible).toBe(true);

  expect(type.validating).toBe(false);
  expect(type.meta.errors!.length).toBe(0);
});

test("change type value", () => {
  const type = Value.create({ ...config, value: 20 });

  expect(type.value).toBe(20);
  expect(type.meta.initial).toBe(20);
  expect(type.modified).toBe(false);

  type.setValue(30);
  expect(type.value).toBe(30);
  expect(type.meta.initial).toBe(20);
  expect(type.modified).toBe(true);

  type.reset();
  expect(type.value).toBe(20);
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

  expect(type.meta.errors!.length).toBe(0);
  expect(type.valid).toBe(true);

  type.meta.addError("this type has some error");
  expect(type.meta.errors!.slice(0)).toEqual(["this type has some error"]);
  expect(type.valid).toBe(false);

  type.reset();
  expect(type.meta.errors!.length).toBe(0);
  expect(type.valid).toBe(true);
});

test("check validating property", async () => {
  const type = Value.create(config);

  expect(type.validating).toBe(false);

  const validate = type.validate();
  expect(type.validating).toBe(true);

  await validate;
  expect(type.validating).toBe(false);
});

test("validate const valid", async () => {
  const type = Value.create({ ...config, const: 5 });

  type.setValue(5);
  expect(type.value).toBe(5);

  await type.validate();

  expect(type.valid).toBe(true);
  expect(type.meta.errors!.slice(0)).toEqual([]);
});

test("validate const invalid", async () => {
  const type = Value.create({ ...config, const: 5 });

  type.setValue(10);
  expect(type.value).toBe(10);

  await type.validate();

  expect(type.valid).toBe(false);
  expect(type.meta.errors!.slice(0)).toEqual(["should be equal to 5"]);
});

test("validate enum valid", async () => {
  const type = Value.create({ ...config, enum: [5, 10] });

  type.setValue(5);
  expect(type.value).toBe(5);

  await type.validate();

  expect(type.valid).toBe(true);
  expect(type.meta.errors!.slice(0)).toEqual([]);
});

test("validate enum invalid", async () => {
  const type = Value.create({ ...config, enum: [5, 20] });

  type.setValue(10);
  expect(type.value).toBe(10);

  await type.validate();

  expect(type.valid).toBe(false);
  expect(type.meta.errors!.slice(0)).toEqual([
    "should be equal to one of the allowed values [5, 20]"
  ]);
});

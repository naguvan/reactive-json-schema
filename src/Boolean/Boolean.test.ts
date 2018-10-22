import { Boolean, IBooleanConfig } from "./Boolean";

describe("Boolean testing", () => {
  const config: IBooleanConfig = {
    meta: {
      component: "radios",
      sequence: 40,
      step: 5,
      value: true
    },
    title: "naguvan",
    type: "boolean"
  };

  test("check boolean default meta", () => {
    const type = Boolean.create();
    expect(type.meta).not.toBeNull();
    expect(type.meta.component).toBe("switch");
    expect(type.meta.sequence).toBeNull();
    expect(type.meta.help).toBeNull();
  });

  test("test boolean meta", () => {
    const type = Boolean.create(config);
    expect(type.meta).not.toBeNull();
    expect(type.meta.component).toBe("radios");
    expect(type.meta.help).toBeNull();
    expect(type.meta.sequence).toBe(40);
    expect(type.enum).toEqual([true, false]);
    expect(type.meta.options).toEqual([
      { label: "true", value: true },
      { label: "false", value: false }
    ]);
  });

  test("create boolean type", () => {
    const type = Boolean.create(config);
    expect(type.type).toBe("boolean");
    expect(type.title).toBe("naguvan");
    expect(type.data).toBe(true);
    expect(type.meta.value).toBe(true);
    expect(type.meta.step).toBe(5);
  });

  test("change boolean name type", () => {
    const type = Boolean.create(config);
    type.meta.setName("senthilnathan");
    expect(type.meta.name).toBe("senthilnathan");
  });
});

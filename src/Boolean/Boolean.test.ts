import { Boolean, IBooleanConfig } from "./Boolean";

describe("Boolean testing", () => {
  const config: IBooleanConfig = {
    meta: {
      component: "radio",
      sequence: 40
    },
    title: "naguvan",
    type: "boolean",
    value: true
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
    expect(type.meta.component).toBe("radio");
    expect(type.meta.help).toBeNull();
    expect(type.meta.sequence).toBe(40);
  });

  test("create boolean type", () => {
    const type = Boolean.create(config);
    expect(type.type).toBe("boolean");
    expect(type.title).toBe("naguvan");
    expect(type.data).toBe(true);
  });

  test("change boolean name type", () => {
    const type = Boolean.create(config);
    type.setName("senthilnathan");
    expect(type.name).toBe("senthilnathan");
  });
});

import { INullConfig, Null } from "./Null";

describe("Null testing", () => {
  const config: INullConfig = {
    meta: {
      component: "para",
      help: "null type test"
    },
    title: "naguvan",
    type: "null",
    value: null
  };

  test("check null default meta", () => {
    const type = Null.create();
    expect(type.meta).not.toBeNull();
    expect(type.meta.component).toBe("para");
    expect(type.meta.sequence).toBeNull();
    expect(type.meta.help).toBeNull();
  });

  test("test null meta", () => {
    const type = Null.create(config);
    expect(type.meta).not.toBeNull();
    expect(type.meta.component).toBe("para");
    expect(type.meta.help).toBe("null type test");
    expect(type.meta.sequence).toBeNull();
  });

  test("create null type", () => {
    const type = Null.create(config);
    expect(type.type).toBe("null");
    expect(type.title).toBe("naguvan");
    expect(type.value).toBe(null);
  });

  test("change null name type", () => {
    const type = Null.create(config);
    type.setName("skclusive");
    expect(type.name).toBe("skclusive");
  });
});

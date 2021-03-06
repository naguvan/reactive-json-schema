import { IStringConfig, String } from "./String";

const config: IStringConfig = {
  maxLength: 6,
  meta: {
    component: "password",
    help: "testing",
    value: "sk.sk"
  },
  minLength: 4,
  title: "naguvan",
  type: "string"
};

describe("type string test cases", () => {
  test("create string type", () => {
    const type = String.create(config);

    expect(type.type).toBe("string");
    expect(type.title).toBe("naguvan");
    expect(type.data).toBe("sk.sk");
    expect(type.minLength).toBe(4);
  });

  test("test string meta", () => {
    const type = String.create(config);

    expect(type.meta).not.toBeNull();
    expect(type.meta.component).toBe("password");
    expect(type.meta.help).toBe("testing");
    expect(type.minLength).toBe(4);
  });

  test("check string default meta", () => {
    const type = String.create();
    expect(type.meta).not.toBeNull();
    expect(type.meta.component).toBe("text");
    expect(type.meta.sequence).toBeNull();
    expect(type.meta.help).toBeNull();
  });

  test("change string value", () => {
    const type = String.create(config);

    type.setValue("rust");
    expect(type.data).toBe("rust");
  });

  test("validate minLength valid", () => {
    const type = String.create(config);

    type.setValue("java");
    expect(type.data).toBe("java");

    type.validate();

    expect(type.valid).toBe(true);
    expect(type.errors!.slice(0)).toEqual([]);
  });

  test("validate minLength invalid", () => {
    const type = String.create(config);

    type.setValue("js");
    expect(type.data).toBe("js");

    type.validate();

    expect(type.valid).toBe(false);
    expect(type.errors!.slice(0)).toEqual([
      "should NOT be shorter than 4 characters"
    ]);
  });

  test("validate maxLength valid", () => {
    const type = String.create(config);

    type.setValue("java");
    expect(type.data).toBe("java");

    type.validate();

    expect(type.valid).toBe(true);
    expect(type.errors!.slice(0)).toEqual([]);
  });

  test("validate maxLength invalid", () => {
    const type = String.create(config);

    type.setValue("typescript");
    expect(type.data).toBe("typescript");

    type.validate();

    expect(type.valid).toBe(false);
    expect(type.errors!.slice(0)).toEqual([
      "should NOT be longer than 6 characters"
    ]);
  });

  test("test invalid pattern configuration", () => {
    expect(() =>
      String.create({
        ...config,
        pattern: "$%#%^%"
      })
    ).toThrowError(`pattern '$%#%^%' is invalid.`);
  });

  test("test valid pattern", () => {
    const type = String.create({
      ...config,
      maxLength: 8,
      minLength: 8,
      pattern: "/^(2[0-4]|[01][0-9]):([0-5][0-9]):(60|[0-5][0-9])$/"
    });

    type.setValue("23:05:56");
    expect(type.data).toBe("23:05:56");

    type.validate();

    expect(type.valid).toBe(true);
    expect(type.errors!.slice(0)).toEqual([]);
  });

  test("test invalid pattern", () => {
    const type = String.create({
      ...config,
      maxLength: 8,
      minLength: 8,
      pattern: "/^(2[0-4]|[01][0-9]):([0-5][0-9]):(60|[0-5][0-9])$/"
    });

    type.setValue("26:25:56");
    expect(type.data).toBe("26:25:56");

    type.validate();

    expect(type.valid).toBe(false);
    expect(type.errors!.slice(0)).toEqual([
      "should match pattern /^(2[0-4]|[01][0-9]):([0-5][0-9]):(60|[0-5][0-9])$/"
    ]);
  });

  test("validate format/meta component", () => {
    const type = String.create({
      format: "date",
      meta: {
        component: "date"
      },
      type: "string"
    });

    expect(type.format).toBe("date");
    expect(type.meta.component).toBe("date");
  });
});

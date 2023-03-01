import { expectTypeOf } from "expect-type";

import { generateHelpers } from "./generateHelpers";

const theme = {
	colors: {
		surface: {
			primary: "red",
			secondary: "blue",
		},
	},
	spacing: {
		0: 0,
		1: "4px",
		2: "8px",
		3: "12px",
		4: "16px",
	},
	typography: {
		heading: {
			fontSize: "12px",
			lineHeight: "14px",
		},
	},
	transitionTime: "1s",
};

describe("generateHelpers", () => {
	it("should create an object matching", () => {
		const helpers = generateHelpers(theme);

		expect(Object.keys(helpers)).toEqual([
			"colors",
			"spacing",
			"typography",
			"transitionTime",
		]);
	});

	it("should create helper with typed arguments", () => {
		const { colors } = generateHelpers(theme);

		expect(colors("surface.primary")({ theme })).toBe("red");

		expectTypeOf(colors("surface.primary")({ theme })).toBeString();
		// @ts-expect-error -- this is not a scalar value
		expectTypeOf(colors("surface")({ theme })).toBeString();
		// @ts-expect-error -- this path doesn't exist
		expectTypeOf(colors("this.does.not.exit")({ theme })).toBeString();
	});

	it("should create special spacing function", () => {
		const { spacing } = generateHelpers(theme);

		expect(spacing(0)({ theme })).toBe("0");

		expectTypeOf(spacing(0)({ theme })).toBeString();
	});

	it("should allow creating spacing helper with different name", () => {
		const customTheme = { space: theme.spacing };
		const { space } = generateHelpers(customTheme, { spacingName: "space" });

		expect(space(0)({ theme: customTheme })).toBe("0");

		expectTypeOf(space(0)({ theme: customTheme })).toBeString();
	});

	it("should allow specifying object helper types", () => {
		const { typography } = generateHelpers(theme, {
			objectKeys: ["typography"],
		});

		expect(typography("heading")({ theme })).toEqual({
			fontSize: "12px",
			lineHeight: "14px",
		});

		expectTypeOf(typography("heading")({ theme })).toEqualTypeOf<{
			fontSize: string;
			lineHeight: string;
		}>();
	});

	it("should generate argumentless helpers", () => {
		const { transitionTime } = generateHelpers(theme);

		expect(transitionTime()({ theme })).toBe("1s");
	});
});

import { expectTypeOf } from "expect-type";

import { generateHelpers } from "./generateHelpers";

const theme = {
	colors: {
		surface: {
			primary: "red",
			secondary: "blue",
		},
	},
	boxShadow: {
		0: 0,
		1: "4px",
	},
	spacing: [0, "4px", "8px", "12px", "16px"],
	typography: {
		heading: {
			fontSize: "12px",
			lineHeight: "14px",
		},
	},
	transitionTime: "1s",
};

const themeWithBreakpoints = {
	...theme,
	breakpoints: { sm: "400px", md: "700px" },
};

describe("generateHelpers", () => {
	it("should create an object matching", () => {
		const helpers = generateHelpers(theme);

		expect(Object.keys(helpers)).toEqual([
			"colors",
			"boxShadow",
			"spacing",
			"typography",
			"transitionTime",
			"value",
			"valueFromProp",
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

	it("should number arguments", () => {
		const { boxShadow } = generateHelpers(theme);

		expect(boxShadow(1)({ theme })).toBe("4px");

		// @ts-expect-error -- this is not a valid path
		expectTypeOf(boxShadow(2)({ theme })).toBeString();
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

	it("should generate breakpoint helper", () => {
		const { breakpoints } = generateHelpers(themeWithBreakpoints);

		expect(breakpoints("sm")({ theme: themeWithBreakpoints })).toBe("400px");
	});

	it("should generate mediaQuery helper", () => {
		const { mediaQuery } = generateHelpers(themeWithBreakpoints);

		expect(mediaQuery.min("sm")({ theme: themeWithBreakpoints })).toBe(
			"@media (min-width: 400px)",
		);

		expect(mediaQuery.max("md")({ theme: themeWithBreakpoints })).toBe(
			"@media (max-width: 700px)",
		);

		expect(
			// @ts-expect-error -- should error on non-existent breakpoint
			mediaQuery.max("does not exist")({ theme: themeWithBreakpoints }),
		).toBe("@media (max-width: undefined)");
	});

	it("should generate value helper for any scalar value", () => {
		const { value } = generateHelpers(theme);

		expect(value("typography.heading.lineHeight")({ theme })).toBe("14px");

		// @ts-expect-error -- should complain about invalid paths
		expect(value("invalid.path")({ theme })).toBeUndefined();
	});

	describe("valueFromProp", () => {
		const { valueFromProp } = generateHelpers(theme);

		it("returns value with key from prop", () => {
			expect(
				valueFromProp(
					"background",
					"colors.surface",
				)({ theme, background: "primary" }),
			).toBe("red");
		});

		it("returns value with fallback", () => {
			expect(
				valueFromProp("background", "colors.surface", "primary")({ theme }),
			).toBe("red");
		});

		it("requires prop to be provided when no fallback is provided", () => {
			expect(
				// @ts-expect-error -- Should complain that background wasn't provided
				valueFromProp("background", "colors.surface")({ theme }),
			).toBeUndefined();
		});

		it("complains when incorrect theme path is used", () => {
			expect(
				// @ts-expect-error -- Should complain when incorrect path was provided
				valueFromProp("background", "incorrect")({ theme }),
			).toBeUndefined();
		});

		it("complains when incorrect value is used", () => {
			expect(
				valueFromProp(
					"background",
					"colors.surface",
					// @ts-expect-error -- Should complain when incorrect path was provided
				)({ theme, background: "incorrect" }),
			).toBeUndefined();
		});

		it("return value for array", () => {
			expect(valueFromProp("spacing", "spacing", 0)({ theme })).toBe(0);
			expect(
				valueFromProp("spacing", "spacing", 0)({ theme, spacing: 1 }),
			).toBe("4px");
		});
	});
});

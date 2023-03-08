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

const themeWithBreakpoints = {
	...theme,
	breakpoints: { sm: "400px", md: "700px" },
};

describe("generateHelpers", () => {
	it("should create an object matching", () => {
		const helpers = generateHelpers(theme);

		expect(Object.keys(helpers)).toEqual([
			"colors",
			"spacing",
			"typography",
			"transitionTime",
			"value",
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
});

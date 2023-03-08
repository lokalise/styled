import { valueFromProp } from "./valueFromProp";

const theme = {
	colors: {
		surface: {
			primary: "red",
			secondary: "blue",
		},
	},
};

type Theme = typeof theme;

declare module "../types" {
	// eslint-disable-next-line @typescript-eslint/no-empty-interface
	interface DefaultTheme extends Theme {}
}

describe("valueFromProp", () => {
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
});

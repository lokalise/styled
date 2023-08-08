import { expectTypeOf } from "expect-type";

import { css } from "..";
import { type StyleFunction } from "../types";

import { variants } from "./variants";

type VariantsReturn<P extends object> = ReturnType<StyleFunction<P>>;

const primary = css`
	background: green;
`;
const secondary = css`
	background: yellow;
`;

const withProp = css<{ $color: string }>`
	background: ${(props) => props.$color};
`;

const withPropAndTheme = css<{ $text: string; $background: string }>`
	color: ${(props) => props.$text};
	background: ${(props) => props.$background};
`;

const theme = {};

describe("variants", () => {
	it("requires prop and variants to be provided", () => {
		const variant = variants("$variant", { primary, secondary });

		expectTypeOf(variant)
			.branded.parameter(0)
			.toMatchTypeOf<{ $variant: "primary" | "secondary" }>();
		expectTypeOf(variant).branded.returns.toEqualTypeOf<
			VariantsReturn<{ $variant: "primary" | "secondary" }>
		>();

		expect(variant({ $variant: "primary", theme })).toEqual(primary);
		expect(variant({ $variant: "secondary", theme })).toEqual(secondary);

		// @ts-expect-error Requires `variant` parameter
		variant({});
		// @ts-expect-error Checks if `variant` matches one of the keys
		variant({ $variant: "other" });
	});

	it("allows fallback variant", () => {
		const variant = variants("$variant", { primary, secondary }, "primary");

		expectTypeOf(variant)
			.branded.parameter(0)
			.toMatchTypeOf<{ $variant?: "primary" | "secondary" }>();
		expectTypeOf(variant).branded.returns.toEqualTypeOf<
			VariantsReturn<{ $variant?: "primary" | "secondary" }>
		>();

		expect(variant({ $variant: "primary", theme })).toEqual(primary);
		expect(variant({ $variant: "secondary", theme })).toEqual(secondary);
		expect(variant({ theme })).toEqual(primary);

		// @ts-expect-error Checks if `variant` matches one of the keys
		variant({ $variant: "other" });

		// @ts-expect-error Checks if `fallback` uses one of the variant keys
		variants("$variant", { primary, secondary }, "other");
	});

	it("allows null as fallback", () => {
		const variant = variants("$variant", { primary, secondary }, null);

		expectTypeOf(variant)
			.branded.parameter(0)
			.toMatchTypeOf<{ $variant?: "primary" | "secondary" }>();
		expectTypeOf(variant).branded.returns.toEqualTypeOf<
			VariantsReturn<{ $variant?: "primary" | "secondary" }>
		>();

		expect(variant({ $variant: "primary", theme })).toEqual(primary);
		expect(variant({ $variant: "secondary", theme })).toEqual(secondary);
		expect(variant({ theme })).toBeUndefined();
	});

	it("allows function as prop", () => {
		const variant = variants(
			(props: { $variant?: "primary" | "secondary" }) => props.$variant,
			{
				primary,
				secondary,
			},
		);

		expectTypeOf(variant)
			.parameter(0)
			.toMatchTypeOf<{ $variant?: "primary" | "secondary" }>();
		expectTypeOf(variant).returns.toEqualTypeOf<
			VariantsReturn<{ $variant?: "primary" | "secondary" }>
		>();

		expect(variant({ $variant: "primary", theme })).toEqual(primary);
		expect(variant({ $variant: "secondary", theme })).toEqual(secondary);
		expect(variant({ theme })).toBeUndefined();
	});

	it("allows css with props", () => {
		const variant = variants("$variant", { withProp });

		expectTypeOf(variant)
			.branded.parameter(0)
			.toMatchTypeOf<{ $variant: "withProp"; $color: string }>();
		// eslint-disable-next-line @typescript-eslint/no-unsafe-call -- no idea why this appeared
		expectTypeOf(variant).branded.returns.toEqualTypeOf<
			VariantsReturn<{ $variant: "withProp"; $color: string }>
		>();

		expect(variant({ $variant: "withProp", $color: "red", theme })).toEqual(
			withProp,
		);
	});

	it("allows css with multiple sets of props", () => {
		const variant = variants("$variant", { withProp, withPropAndTheme });

		expectTypeOf(variant).branded.parameter(0).toMatchTypeOf<{
			$variant: "withProp" | "withPropAndTheme";
			$color: string;
			$text: string;
			$background: string;
		}>();
		// eslint-disable-next-line @typescript-eslint/no-unsafe-call -- no idea why this appeared
		expectTypeOf(variant).branded.returns.toEqualTypeOf<
			VariantsReturn<{
				$variant: "withProp" | "withPropAndTheme";
				$color: string;
				$text: string;
				$background: string;
			}>
		>();

		expect(
			variant({
				$variant: "withProp",
				$color: "red",
				$text: "white",
				$background: "red",
				theme,
			}),
		).toEqual(withProp);
		expect(
			variant({
				$variant: "withPropAndTheme",
				$color: "red",
				$text: "white",
				$background: "red",
				theme,
			}),
		).toEqual(withPropAndTheme);
	});
});

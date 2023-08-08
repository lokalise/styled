import { expectTypeOf } from "expect-type";

import { css } from "..";
import { type CssDeclaration } from "../types";

import { variants } from "./variants";

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

describe("variants", () => {
	it("requires prop and variants to be provided", () => {
		const variant = variants("$variant", { primary, secondary });

		expectTypeOf(variant)
			.branded.parameter(0)
			.toEqualTypeOf<{ $variant: "primary" | "secondary" }>();
		expectTypeOf(variant).branded.returns.toEqualTypeOf<
			CssDeclaration<{ $variant: "primary" | "secondary" }> | undefined
		>();

		expect(variant({ $variant: "primary" })).toEqual(primary);
		expect(variant({ $variant: "secondary" })).toEqual(secondary);

		// @ts-expect-error Requires `variant` parameter
		variant({});
		// @ts-expect-error Checks if `variant` matches one of the keys
		variant({ $variant: "other" });
	});

	it("allows fallback variant", () => {
		const variant = variants("$variant", { primary, secondary }, "primary");

		expectTypeOf(variant)
			.branded.parameter(0)
			.toEqualTypeOf<{ $variant?: "primary" | "secondary" }>();
		expectTypeOf(variant).branded.returns.toEqualTypeOf<
			CssDeclaration<{ $variant?: "primary" | "secondary" }> | undefined
		>();

		expect(variant({ $variant: "primary" })).toEqual(primary);
		expect(variant({ $variant: "secondary" })).toEqual(secondary);
		expect(variant({})).toEqual(primary);

		// @ts-expect-error Checks if `variant` matches one of the keys
		variant({ $variant: "other" });

		// @ts-expect-error Checks if `fallback` uses one of the variant keys
		variants("$variant", { primary, secondary }, "other");
	});

	it("allows null as fallback", () => {
		const variant = variants("$variant", { primary, secondary }, null);

		expectTypeOf(variant)
			.branded.parameter(0)
			.toEqualTypeOf<{ $variant?: "primary" | "secondary" }>();
		expectTypeOf(variant).branded.returns.toEqualTypeOf<
			CssDeclaration<{ $variant?: "primary" | "secondary" }> | undefined
		>();

		expect(variant({ $variant: "primary" })).toEqual(primary);
		expect(variant({ $variant: "secondary" })).toEqual(secondary);
		expect(variant({})).toBeUndefined();
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
			.toEqualTypeOf<{ $variant?: "primary" | "secondary" }>();
		expectTypeOf(variant).returns.toEqualTypeOf<
			CssDeclaration<{ $variant?: "primary" | "secondary" }> | undefined
		>();

		expect(variant({ $variant: "primary" })).toEqual(primary);
		expect(variant({ $variant: "secondary" })).toEqual(secondary);
		expect(variant({})).toBeUndefined();
	});

	it("allows css with props", () => {
		const variant = variants("$variant", { withProp });

		expectTypeOf(variant)
			.branded.parameter(0)
			.toEqualTypeOf<{ $variant: "withProp"; $color: string }>();
		// eslint-disable-next-line @typescript-eslint/no-unsafe-call -- no idea why this appeared
		expectTypeOf(variant).branded.returns.toEqualTypeOf<
			CssDeclaration<{ $variant: "withProp"; $color: string }> | undefined
		>();

		expect(variant({ $variant: "withProp", $color: "red" })).toEqual(withProp);
	});

	it("allows css with multiple sets of props", () => {
		const variant = variants("$variant", { withProp, withPropAndTheme });

		expectTypeOf(variant).branded.parameter(0).toEqualTypeOf<{
			$variant: "withProp" | "withPropAndTheme";
			$color: string;
			$text: string;
			$background: string;
		}>();
		// eslint-disable-next-line @typescript-eslint/no-unsafe-call -- no idea why this appeared
		expectTypeOf(variant).branded.returns.toEqualTypeOf<
			| CssDeclaration<{
					$variant: "withProp" | "withPropAndTheme";
					$color: string;
					$text: string;
					$background: string;
			  }>
			| undefined
		>();

		expect(
			variant({
				$variant: "withProp",
				$color: "red",
				$text: "white",
				$background: "red",
			}),
		).toEqual(withProp);
		expect(
			variant({
				$variant: "withPropAndTheme",
				$color: "red",
				$text: "white",
				$background: "red",
			}),
		).toEqual(withPropAndTheme);
	});
});

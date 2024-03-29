import { css } from "..";
import { type StyleFunction } from "../types";

import { modifier } from "./modifier";

type ModifierReturn<P extends object> = ReturnType<StyleFunction<P>>;

const style = css`
	background: green;
`;
const withProp = css<{ $color: string }>`
	background: ${(props) => props.$color};
`;

const theme = {};

describe("modifier", () => {
	it("has correct types for simple case", () => {
		const mod = modifier("$prop", style);

		expectTypeOf(mod).toMatchTypeOf<StyleFunction<{ $prop?: boolean }>>();

		expect(mod({ $prop: true, theme })).toEqual(style);
		expect(mod({ theme })).toBeUndefined();
	});

	it("infers css props", () => {
		const mod = modifier("$prop", withProp);

		// eslint-disable-next-line @typescript-eslint/no-unsafe-call
		expectTypeOf(mod).parameter(0).toMatchTypeOf<{
			$prop?: boolean;
			$color: string;
		}>();

		expectTypeOf(mod).returns.toMatchTypeOf<
			ModifierReturn<{ $prop?: boolean; $color: string }>
		>();

		expect(mod({ $prop: true, $color: "", theme })).toEqual(withProp);
		expect(mod({ $color: "", theme })).toBeUndefined();
	});

	it("allows function as prop", () => {
		const mod = modifier((props: { $prop?: boolean }) => props.$prop, style);

		expectTypeOf(mod).parameter(0).toMatchTypeOf<{ $prop?: boolean }>();
		expectTypeOf(mod).returns.toMatchTypeOf<
			ModifierReturn<{ $prop?: boolean }>
		>();

		expect(mod({ $prop: true, theme })).toEqual(style);
		expect(mod({ theme })).toBeUndefined();
	});
});

import { expectTypeOf } from "expect-type";

import { css, type CssDeclaration } from "..";
import { modifier } from "./modifier";

const style = css`
	background: green;
`;
const withProp = css`
	background: ${(props: { color: string }) => props.color};
`;

describe("modifier", () => {
	it("has correct types for simple case", () => {
		const mod = modifier("prop", style);

		expectTypeOf(mod).parameter(0).toEqualTypeOf<{ prop?: boolean }>();
		expectTypeOf(mod).returns.toEqualTypeOf<
			CssDeclaration<{ prop?: boolean }> | undefined
		>();

		expect(mod({ prop: true })).toEqual(style);
		expect(mod({})).toBeUndefined();
	});

	it("infers css props", () => {
		const mod = modifier("prop", withProp);

		expectTypeOf(mod)
			.parameter(0)
			.toEqualTypeOf<{ prop?: boolean; color: string }>();
		expectTypeOf(mod).returns.toEqualTypeOf<
			CssDeclaration<{ prop?: boolean; color: string }> | undefined
		>();

		expect(mod({ prop: true, color: "" })).toEqual(withProp);
		expect(mod({ color: "" })).toBeUndefined();
	});

	it("allows function as prop", () => {
		const mod = modifier((props: { prop?: boolean }) => props.prop, style);

		expectTypeOf(mod).parameter(0).toEqualTypeOf<{ prop?: boolean }>();
		expectTypeOf(mod).returns.toEqualTypeOf<
			CssDeclaration<{ prop?: boolean }> | undefined
		>();

		expect(mod({ prop: true })).toEqual(style);
		expect(mod({})).toBeUndefined();
	});
});

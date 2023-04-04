/* eslint-disable jest/expect-expect */
/* eslint-disable @typescript-eslint/ban-types */
import { expectTypeOf } from "expect-type";

import { type ObjectPaths, type ScalarPaths, type ObjectPathValue } from ".";

describe("ScalarPaths", () => {
	it("should resolve to never when object is empty", () => {
		expectTypeOf<ScalarPaths<{}>>().toBeNever();
	});

	it("should resolve to never when object has no scalar values", () => {
		expectTypeOf<ScalarPaths<{ a: {} }>>().toBeNever();
	});

	it("should resolve scalar paths", () => {
		expectTypeOf<
			ScalarPaths<{ a1: string; a2: { b: number; c: { s: string } }; a3: {} }>
		>().toEqualTypeOf<"a1" | "a2.b" | "a2.c.s">();
	});
});

describe("ObjectPaths", () => {
	it("should resolve to never when object is empty", () => {
		expectTypeOf<ObjectPaths<{}>>().toBeNever();
	});

	it("should resolve to never when object has only scalar values", () => {
		expectTypeOf<ObjectPaths<{ a: string }>>().toBeNever();
	});

	it("should resolve scalar paths", () => {
		expectTypeOf<
			// eslint-disable-next-line @typescript-eslint/naming-convention
			ObjectPaths<{
				a: { s: string; 10: string };
				b: { d: { s: string } };
				100: {};
				e: {};
			}>
		>().toEqualTypeOf<"a" | "b" | "b.d" | "100" | "e">();
	});
});

describe("ObjectPathValue", () => {
	it("should resolve simple scalar type", () => {
		expectTypeOf<ObjectPathValue<{ a: string }, "a">>().toBeString();
	});

	it("should resolve to never for non-existent type", () => {
		expectTypeOf<ObjectPathValue<{ a: string }, "b">>().toBeNever();
	});

	it("should resolve object type", () => {
		expectTypeOf<ObjectPathValue<{ a: { b: string } }, "a">>().toEqualTypeOf<{
			b: string;
		}>();
	});

	it("should resolve deep scalar type", () => {
		expectTypeOf<ObjectPathValue<{ a: { b: string } }, "a.b">>().toBeString();
	});

	it("should resolve arbitrary deep type", () => {
		type Obj = {
			a: {
				b: {
					c: { d: { e: { f: { g: { h: { i: { j: { k: string } } } } } } } };
				};
			};
		};
		expectTypeOf<ObjectPathValue<Obj, "a.b.c.d.e.f.g.h.i.j.k">>().toBeString();
	});
});

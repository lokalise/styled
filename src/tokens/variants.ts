import { type CssDeclaration, type StyleFunction } from "../types";

type AnyProps = object;
type VariantsMap<P extends AnyProps> = Record<string, CssDeclaration<P>>;
type Return<Props extends AnyProps> = StyleFunction<Props>;
type Callback<Variants extends VariantsMap<Props>, Props extends AnyProps> = (
	props: Props,
) => keyof Variants | undefined;
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- to infer properly, we need the `any`
type PropsFromVMap<VMap extends VariantsMap<any>> = VMap extends VariantsMap<
	infer Props
>
	? Props
	: never;

/**
 * Reason we use interface this way is because we basically need to define
 * three types of signatures – one with fallback, one without and one with callback for determining variant
 * When fallback provided, the prop is optional.
 * When fallback is not provided, the prop is required.
 * This means that one variant will always be selected - either explicitly or by default.
 */
interface Variants {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- any needed for proper inferring
	<Prop extends string, VMap extends VariantsMap<any>>(
		prop: Prop,
		allVariants: VMap,
		fallback: keyof VMap | null,
	): Return<Partial<Record<Prop, keyof VMap>> & PropsFromVMap<VMap>>;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- `any` required to properly infer props
	<Prop extends string, VMap extends VariantsMap<any>>(
		prop: Prop,
		allVariants: VMap,
	): Return<Record<Prop, keyof VMap> & PropsFromVMap<VMap>>;
	// Index types like `Record` don't work here
	<Props extends AnyProps, VMap extends VariantsMap<Props>>(
		prop: Callback<VMap, Props>,
		allVariants: VMap,
	): Return<Props>;
}

// Types here don't particularly mean much so we can use any as it's overwritten by the interface above anyway
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const variants: Variants =
	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- guarded by Variants interface above
	(prop: any, allVariants: any, fallback?: any) => (props: any) =>
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-return -- guarded by Variants interface above
		allVariants[
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call -- guarded by Variants interface above
			typeof prop === "function" ? prop(props) : props[prop] ?? fallback
		];

import { type CssDeclaration, type StyleFunction } from "../types";

// We can't use `Record` here since we can't use types with index signature.
type AnyProps = object;
type PropsCallback<Props extends AnyProps> = (
	props: Props,
) => boolean | undefined;

interface Modifier {
	<Prop extends string, CssProps extends AnyProps>(
		prop: Prop,
		trueCss: CssDeclaration<CssProps>,
	): StyleFunction<Partial<Record<Prop, boolean | undefined>> & CssProps>;
	<Props extends AnyProps, CssProps extends AnyProps>(
		prop: PropsCallback<Props>,
		trueCss: CssDeclaration<CssProps>,
	): StyleFunction<Props & CssProps>;
}

// These types are irrelevant. The real types are defined by the interface above. We just need
// `any` here in order for the whole expression to be assignable to `Modifier` interface type.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const modifier: Modifier = (prop: any, trueCss: any) => (props: any) =>
	// eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
	(typeof prop === "function" ? prop(props) : props[prop])
		? trueCss
		: undefined;

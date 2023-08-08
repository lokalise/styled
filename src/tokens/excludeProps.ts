export const excludeProps =
	<Props>(props: readonly unknown[]) =>
	(prop: keyof Props) =>
		!props.includes(prop);

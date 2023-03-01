export const excludeProps =
	<Props>(props: readonly unknown[]) =>
	(prop: keyof Props, defaultValidatorFn: (prop: keyof Props) => boolean) =>
		!props.includes(prop) && defaultValidatorFn(prop);

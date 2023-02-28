import { resolve } from "path";
import { defineConfig } from "vitest/config";
import dts from "vite-plugin-dts";

export default defineConfig({
	build: {
		lib: {
			entry: {
				index: resolve(__dirname, "src/index.ts"),
			},
			name: "styled",
		},
		commonjsOptions: {
			esmExternals: true,
		},
	},
	test: {
		globals: true,
	},
	plugins: [dts()],
});

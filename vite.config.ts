import { resolve } from "path";
import { defineConfig } from "vitest/config";
import dts from "vite-plugin-dts";
import packageJson from "./package.json";

export default defineConfig({
	build: {
		target: "esnext",
		lib: {
			entry: {
				index: resolve(__dirname, "src/index.ts"),
				"testing-setup": resolve(__dirname, "src/testing-setup.ts"),
			},
		},
		rollupOptions: {
			external: Object.keys(packageJson.dependencies).flatMap((dep) => [
				dep,
				// Include all dependency paths, not just root
				new RegExp(`^${dep}/`),
			]),
			output: {
				// Ensure we can tree-shake properly
				preserveModules: true,
				// Ensures import/require works in all environments
				interop: "auto",
			},
		},
		commonjsOptions: {
			// Assumes all external dependencies are ESM dependencies. Just ensures
			// we then import those dependencies correctly in CJS as well.
			esmExternals: true,
		},
	},
	test: {
		globals: true,
	},
	plugins: [dts({ include: ["src"] })],
});

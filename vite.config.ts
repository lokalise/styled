import { resolve } from "path";

import dts from "vite-plugin-dts";
import { defineConfig } from "vitest/config";

import packageJson from "./package.json";

// eslint-disable-next-line import/no-default-export
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
			onwarn(warning) {
				throw Object.assign(new Error(), warning);
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
	plugins: [
		dts({
			afterDiagnostic: (diagnosis) => {
				if (diagnosis.length > 0) {
					throw new Error("Issue while generating declaration files", {
						cause: diagnosis,
					});
				}
			},
			include: ["src"],
		}),
	],
});

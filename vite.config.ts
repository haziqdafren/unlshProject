import { defineConfig, type ViteDevServer, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

function apiDevPlugin(): Plugin {
	return {
		name: "api-dev",
		apply: "serve",
		configureServer(server: ViteDevServer) {
			server.middlewares.use(async (req, res, next) => {
				if (!req.url?.startsWith("/api")) return next();
				try {
					const mod = await server.ssrLoadModule("/src/server/entry.ts");
					const handler = mod.default;
					handler(req, res, next);
				} catch (err) {
					if (err instanceof Error) server.ssrFixStacktrace(err);
					next(err);
				}
			});
		},
	};
}

export default defineConfig(({ isSsrBuild }) => ({
	envPrefix: ["VITE_", "SITE_"],

	plugins: [
		react(),
		apiDevPlugin(),
	],

	resolve: {
		dedupe: ["react", "react-dom", "react-router-dom"],
		alias: {
			nothing: "/src/fallbacks/missingModule.ts",
			"@/api": path.resolve(__dirname, "./src/server/api"),
			"@": path.resolve(__dirname, "./src"),
		},
	},

	optimizeDeps: {
		include: ["react", "react-dom", "react-router-dom", "motion/react"],
	},

	ssr: {
		noExternal: isSsrBuild ? true : undefined,
	},

	server: {
		host: "0.0.0.0",
		port: 5173,
		hmr: { overlay: false },
	},

	build: isSsrBuild
		? {
				outDir: "dist",
				emptyOutDir: false,
				copyPublicDir: false,
				ssr: "src/server/entry.ts",
				rollupOptions: {
					output: {
						format: "es",
						entryFileNames: "server.bundle.mjs",
						chunkFileNames: "bin/[name]-[hash].js",
						banner: "import { createRequire } from 'module';\nconst require = createRequire(import.meta.url);",
					},
				},
			}
		: {
				outDir: "dist/client",
				emptyOutDir: true,
				copyPublicDir: true,
			},
}));

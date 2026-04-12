import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

// Parent folder may contain another lockfile; pin tracing to this app so `.next` layout
// matches dev/start and avoids missing `pages/_app/build-manifest.json` style errors.
const configDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  outputFileTracingRoot: configDir,
};

export default nextConfig;

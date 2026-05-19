import {
  defineConfig
} from "./chunk-BOJLF3L6.mjs";
import "./chunk-ZHD6U6WT.mjs";
import "./chunk-ED4YJFD3.mjs";
import "./chunk-USHNXJ63.mjs";
import "./chunk-IB4V73K4.mjs";
import {
  init_esm
} from "./chunk-244PAGAH.mjs";

// trigger.config.ts
init_esm();
var trigger_config_default = defineConfig({
  project: process.env.TRIGGER_PROJECT_REF,
  runtime: "node",
  dirs: ["trigger"],
  maxDuration: 3600,
  retries: {
    enabledInDev: false,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1e3,
      maxTimeoutInMs: 1e4,
      factor: 2
    }
  },
  build: {}
});
var resolveEnvVars = void 0;
export {
  trigger_config_default as default,
  resolveEnvVars
};
//# sourceMappingURL=trigger.config.mjs.map

"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const launchpad_1 = __importDefault(require("./lib/launchpad"));
const github = __importStar(require("./lib/github"));
const docker_1 = __importDefault(require("./lib/docker"));
const environment_1 = require("./lib/environment");
async function run() {
    try {
        const serviceAccountKey = core.getInput('service_account_key');
        const directory = core.getInput('directory');
        const apiKey = core.getInput('api_key');
        const name = core.getInput('name');
        // Update description that a deploy is in flight
        if (github.isPullRequest()) {
            await github.prependToPullDescription(github.getRunningDescription());
        }
        const launchpad = new launchpad_1.default({
            name,
            apiKey,
            envVars: environment_1.parseEnvVars(process.env)
        });
        await launchpad.setup();
        throw new Error('THIS IS A TEST');
        // Build & Push Image to LaunchPad repository
        const docker = new docker_1.default({
            serviceAccountKey,
            name,
            directory,
            projectId: launchpad.projectId,
            slug: launchpad.slugId,
            apiKey: apiKey
        });
        await docker.setup();
        await docker.buildAndPush();
        // Deploy built image to LaunchPad Cloud
        const result = await launchpad.createDeployment();
        // Add Preview URL to PR
        if (github.isPullRequest()) {
            await github.prependToPullDescription(github.getFinishedDescription(result.url));
        }
    }
    catch (error) {
        await github.addComment(`
### LaunchPad Error

LaunchPad failed to deploy, please contact support at 
[support@bluenova.io](mailto:support@bluenova.io?subject=LaunchPad Error&body=Error Message: ${error.message}).

<details>
  <summary>Error Message</summary>
  \`${error.message}\` 
</details>
    `);
        core.setFailed(error.message);
    }
}
run();
//# sourceMappingURL=main.js.map
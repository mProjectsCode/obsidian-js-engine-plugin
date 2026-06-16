# JS Engine API

Types and helper functions for integrating with the JS Engine Obsidian plugin API.

```sh
bun add -d https://github.com/mProjectsCode/obsidian-js-engine-plugin/releases/latest/download/obsidian-js-engine-api.tgz
```

```ts
import { getJsEngineInternalApi } from '@lemons_dev/obsidian-js-engine-api';

const jsEngine = getJsEngineInternalApi(this.app);

await jsEngine?.executeFileSimple('Scripts/example.js');
```

This package only describes the cross-plugin integration surface. JS Engine keeps the runtime implementation inside the Obsidian plugin.

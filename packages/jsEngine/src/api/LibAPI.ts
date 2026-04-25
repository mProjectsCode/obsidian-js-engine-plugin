import * as ParsiNOM from '@lemons_dev/parsinom';
import * as IterTools from 'itertools-ts';
import type { API } from 'packages/jsEngine/src/api/API';

/**
 * The lib API provides in interface to some external libraries packaged into js engine.
 */
export class LibAPI {
	private readonly apiInstance: API;

	constructor(apiInstance: API) {
		this.apiInstance = apiInstance;
	}

	/**
	 * Get the [ParsiNOM](https://github.com/mProjectsCode/parsiNOM) library.
	 */
	public parsinom(): typeof ParsiNOM {
		return ParsiNOM;
	}

	/**
	 * Get the [itertools-ts](https://github.com/Smoren/itertools-ts) library.
	 */
	public itertools(): typeof IterTools {
		return IterTools;
	}
}

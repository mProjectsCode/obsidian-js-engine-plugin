import { type API } from 'jsEngine/api/API';
import { P } from '@lemons_dev/parsinom/lib/ParsiNOM';
import { P_UTILS } from '@lemons_dev/parsinom/lib/ParserUtils';
import { Parser } from '@lemons_dev/parsinom/lib/Parser';
import { createParsingErrorMessage, ParsingError } from '@lemons_dev/parsinom/lib/ParserError';
import { ParserContext } from '@lemons_dev/parsinom/lib/ParserContext';
import * as IterTools from 'itertools-ts';

export interface LibParsiNOM {
	P: typeof P;
	P_UTILS: typeof P_UTILS;
	Parser: typeof Parser;
	createParsingErrorMessage: typeof createParsingErrorMessage;
	ParsingError: typeof ParsingError;
	ParserContext: typeof ParserContext;
}

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
	public parsinom(): LibParsiNOM {
		return {
			P: P,
			P_UTILS: P_UTILS,
			Parser: Parser,
			createParsingErrorMessage: createParsingErrorMessage,
			ParsingError: ParsingError,
			ParserContext: ParserContext,
		};
	}

	/**
	 * Get the [itertools-ts](https://github.com/Smoren/itertools-ts) library.
	 */
	public itertools(): typeof IterTools {
		return IterTools;
	}
}

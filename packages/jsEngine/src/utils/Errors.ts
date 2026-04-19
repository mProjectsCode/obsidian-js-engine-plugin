export enum ErrorLevel {
	CRITICAL = 'CRITICAL',
	ERROR = 'ERROR',
	WARNING = 'WARNING',
}

export enum ErrorType {
	INTERNAL = 'JSE_INTERNAL',
	VALIDATION = 'JSE_VALIDATION',

	OTHER = 'OTHER',
}

interface JSEngineErrorParams {
	errorLevel: ErrorLevel;
	effect: string;
	cause: string | Error;
	tip?: string;
	docs?: string[];
	context?: Record<string, unknown>;
	positionContext?: string;
}

export abstract class JSEngineError extends Error {
	abstract getErrorType(): ErrorType;

	errorLevel: ErrorLevel;
	effect: string;
	cause: string | Error;
	tip?: string;
	docs?: string[];
	context?: Record<string, unknown>;
	positionContext?: string;

	constructor(params: JSEngineErrorParams) {
		super('');

		this.errorLevel = params.errorLevel;
		this.effect = params.effect;
		this.cause = params.cause;
		this.tip = params.tip;
		this.docs = params.docs;
		this.context = params.context;
		this.positionContext = params.positionContext;

		this.updateMessage();
	}

	protected updateMessage(): void {
		if (this.cause instanceof Error) {
			this.message = `[${this.getErrorType()}] "${this.effect}" caused by error "${this.cause.message}"`;
		} else {
			this.message = `[${this.getErrorType()}] "${this.effect}" caused by "${this.cause}"`;
		}
	}

	public log(): void {
		console.log(this.message, this.stack, this.context);
	}
}

export class JSEngineInternalError extends JSEngineError {
	public getErrorType(): ErrorType {
		return ErrorType.INTERNAL;
	}
}

export class JSEngineValidationError extends JSEngineError {
	public getErrorType(): ErrorType {
		return ErrorType.VALIDATION;
	}
}

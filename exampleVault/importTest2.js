export class UserError extends Error {
    constructor(message) {
        super(message);
        this.name = "UserError";
    }
}

export function foo() {
    throw new UserError("UserError message");
}
import { UserError } from "./importTest2.js";

export function foo() {
    throw new UserError("UserError message");
}
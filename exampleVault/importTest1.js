import {UserError} from "./importTest2.js";

export async function bar(engine) {
    const {foo} = await engine.importJs("importTest2.js");
    try {
        foo();
    } catch (e) {
        if (e instanceof UserError) {
            return "Caught UserError";
        } else {
            return "Caught other error";
        }
    }
}
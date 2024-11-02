import { greet } from "./importFromFolder2.js";

export function test() {
    greet();
    console.log('Hello from folder/importFromFolder1.js');
    console.log(import.meta);
}
import { expect } from "chai";
import { humanSize } from "./output.ts";

describe("humanSize", () => {
    it("should return ERROR for null size", () => {
        const result = humanSize(null);
        expect(result.innerText).to.equal("ERROR");
    });

    it("should format 0 B correctly", () => {
        const result = humanSize(0);
        expect(result.innerText).to.equal("0.00 B");
    });

    it("should format kiB correctly", () => {
        const result = humanSize(1024);
        expect(result.innerText).to.equal("1.00 kiB");
    });

    it("should format MiB correctly", () => {
        const result = humanSize(3.14 * 1024 * 1024);
        expect(result.innerText).to.equal("3.14 MiB");
    });
});

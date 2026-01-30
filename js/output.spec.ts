import { expect } from "chai";
import { humanSize, approxDurationSince } from "./output.ts";

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

describe("approxDurationSince", () => {
    it("should return ISO format for future dates", () => {
        const result = approxDurationSince(
            new Date("2023-11-14T12:34:56Z"),
            new Date(2021, 1, 14, 12, 34, 56),
        );
        expect(result).to.equal("2023-11-14T12:34:56.000Z");
    });

    it("should return 'now' for matching dates", () => {
        const result = approxDurationSince(
            new Date(2021, 1, 14, 12, 34, 56),
            new Date(2021, 1, 14, 12, 34, 56),
        );
        expect(result).to.equal("now");
    });

    it("should return 'now' for diff < 5s", () => {
        const result = approxDurationSince(
            new Date(2021, 1, 14, 12, 34, 52),
            new Date(2021, 1, 14, 12, 34, 56),
        );
        expect(result).to.equal("now");
    });

    it("should return seconds for diff below 1 minute", () => {
        const result = approxDurationSince(
            new Date(2021, 1, 14, 12, 33, 59),
            new Date(2021, 1, 14, 12, 34, 56),
        );
        expect(result).to.equal("seconds ago");
    });

    it("should return minutes for diff below 1 hour", () => {
        const result = approxDurationSince(
            new Date(2021, 1, 14, 12, 9, 30),
            new Date(2021, 1, 14, 12, 34, 56),
        );
        expect(result).to.equal("25min ago");
    });

    it("should return hours for diff below 1 day", () => {
        const result = approxDurationSince(
            new Date(2021, 1, 14, 3, 9, 30),
            new Date(2021, 1, 14, 12, 34, 56),
        );
        expect(result).to.equal("9h ago");
    });

    it("should return 1 day for diff equal 1 day", () => {
        const result = approxDurationSince(
            new Date(2021, 5, 13, 3, 9, 30),
            new Date(2021, 5, 14, 12, 34, 56),
        );
        expect(result).to.equal("yesterday");
    });

    it("should return days for diff above 1 day", () => {
        const result = approxDurationSince(
            new Date(2021, 3, 2, 3, 9, 30),
            new Date(2021, 5, 14, 12, 34, 56),
        );
        expect(result).to.equal("73 days ago");
    });
});

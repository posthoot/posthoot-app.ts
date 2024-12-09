import { getApiDocs } from "@/lib/swagger";
import { describe, expect, it } from "@jest/globals";

describe("Swagger Configuration", () => {
  it("should generate valid swagger documentation", () => {
    const docs: any = getApiDocs();
    expect(docs).toHaveProperty("openapi", "3.0.0");
    expect(docs).toHaveProperty("info.title", "SailMail API Documentation");
    expect(docs.servers[0].url).toBeDefined();
  });
});

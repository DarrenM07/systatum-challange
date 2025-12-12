import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createProduct,
  deleteProduct,
  getProduct,
  listProducts,
  updateProduct,
} from "../lib/api";

describe("api client", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates a product and returns JSON", async () => {
    const mockResponse = { id: 1, fields: { name: "Test" } };
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await createProduct({ name: "Test" });
    expect(result).toEqual(mockResponse);
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:8000/api/products/",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("throws an error on non-OK responses", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ detail: "Bad data" }),
    });

    await expect(listProducts()).rejects.toThrow("Bad data");
  });

  it("returns null on 204 delete", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 204,
      json: () => Promise.resolve({}),
    });

    const result = await deleteProduct(5);
    expect(result).toBeNull();
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:8000/api/products/5/",
      expect.objectContaining({ method: "DELETE" })
    );
  });

  it("gets and updates a product with correct URLs", async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ id: 2 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ id: 2, fields: { price: 10 } }),
      });

    await getProduct(2);
    await updateProduct(2, { price: 10 });

    expect(fetch).toHaveBeenNthCalledWith(1, "http://localhost:8000/api/products/2/", expect.any(Object));
    expect(fetch).toHaveBeenNthCalledWith(2, "http://localhost:8000/api/products/2/", expect.objectContaining({ method: "PUT" }));
  });
});

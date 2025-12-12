import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, beforeEach, vi } from "vitest";
import Page from "../app/page";
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../lib/api";

vi.mock("../lib/api", () => ({
  fetchProducts: vi.fn(),
  createProduct: vi.fn(),
  updateProduct: vi.fn(),
  deleteProduct: vi.fn(),
}));

describe("Product Registry page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchProducts.mockResolvedValue([
      { id: 1, fields: { name: "Ultramie Goreng", price: 25000 } },
    ]);
  });

  it("renders header and sections", async () => {
    render(<Page />);

    await waitFor(() => expect(fetchProducts).toHaveBeenCalled());

    expect(screen.getByText(/Product Registry/i)).toBeInTheDocument();
    expect(screen.getByText("Products")).toBeInTheDocument();
    expect(screen.getByText(/Create new product/i)).toBeInTheDocument();
  });

  it("shows search input and JSON textarea", async () => {
    render(<Page />);

    await waitFor(() => expect(fetchProducts).toHaveBeenCalled());

    expect(screen.getByPlaceholderText(/Search by name/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/"name": ""/)).toBeInTheDocument();
  });
});

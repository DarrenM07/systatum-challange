"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchProducts, createProduct, updateProduct, deleteProduct } from "../lib/api";
import "./styles.css";

const defaultFields = { name: "", price: 0 };
const pretty = (value) => JSON.stringify(value, null, 2);

export default function Page() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [fieldsText, setFieldsText] = useState(pretty(defaultFields));
  const [lastResponse, setLastResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return products;
    return products.filter((p) => {
      const name = (p.fields?.name || "").toString().toLowerCase();
      return name.includes(term);
    });
  }, [products, searchTerm]);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProducts();
      setProducts(Array.isArray(data) ? data : []);
      setLastResponse(data);
    } catch (err) {
      const msg = err?.message || "Failed to load products";
      setError(msg);
      setLastResponse({ error: msg });
    } finally {
      setLoading(false);
    }
  };

  const parseFields = () => {
    if (!fieldsText.trim()) {
      const msg = "Please provide a JSON object for fields.";
      setError(msg);
      setLastResponse({ error: msg });
      return null;
    }
    try {
      const parsed = JSON.parse(fieldsText);
      if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
        const msg = "fields must be a JSON object.";
        setError(msg);
        setLastResponse({ error: msg });
        return null;
      }
      setError(null);
      return parsed;
    } catch (err) {
      const msg = `Invalid JSON: ${err.message}`;
      setError(msg);
      setLastResponse({ error: msg });
      return null;
    }
  };

  const handleSelect = (product) => {
    setSelectedProduct(product);
    setFieldsText(pretty(product.fields || {}));
    setError(null);
  };

  const handleNew = () => {
    setSelectedProduct(null);
    setFieldsText(pretty(defaultFields));
    setError(null);
  };

  const handleSave = async () => {
    const parsed = parseFields();
    if (!parsed) return;
    setLoading(true);
    try {
      if (!selectedProduct) {
        const created = await createProduct(parsed);
        setLastResponse(created);
        await loadProducts();
        handleNew();
      } else {
        const updated = await updateProduct(selectedProduct.id, parsed);
        setLastResponse(updated);
        await loadProducts();
        setSelectedProduct(updated);
        setFieldsText(pretty(updated.fields || {}));
      }
    } catch (err) {
      const msg = err?.message || "Save failed";
      setError(msg);
      setLastResponse({ error: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await deleteProduct(id);
      setLastResponse({ deleted: id });
      await loadProducts();
      if (selectedProduct && selectedProduct.id === id) {
        handleNew();
      }
    } catch (err) {
      const msg = err?.message || "Delete failed";
      setError(msg);
      setLastResponse({ error: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-root" suppressHydrationWarning>
      <header className="page-header">
        <h1>Product Registry</h1>
        <p>
          This UI talks to a Django backend where each product is stored as a JSON <code>fields</code> object.
          PUT requests only overwrite the keys you send inside <code>fields</code>.
        </p>
        <div className="actions">
          <button className="button button-secondary" disabled={loading} onClick={loadProducts}>
            Refresh
          </button>
          <button className="button button-primary" disabled={loading} onClick={handleNew}>
            New product
          </button>
        </div>
      </header>

      <div className="columns">
        <section className="card">
          <div className="card-header">
            <div>
              <h3>Products</h3>
              <p className="muted">Select to edit, delete to remove.</p>
            </div>
            <input
              className="search-input"
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: 60 }}>ID</th>
                  <th>Name</th>
                  <th style={{ width: 90 }}>Price</th>
                  <th style={{ width: 140 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="muted">
                      Loading...
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="muted">
                      No products found.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr
                      key={product.id}
                      className={selectedProduct?.id === product.id ? "selected" : ""}
                      onClick={() => handleSelect(product)}
                      style={{ cursor: "pointer" }}
                    >
                      <td>{product.id}</td>
                      <td>{product.fields?.name || "—"}</td>
                      <td>{product.fields?.price ?? "—"}</td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            className="button button-secondary"
                            disabled={loading}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelect(product);
                            }}
                          >
                            Select
                          </button>
                          <button
                            className="button button-danger"
                            disabled={loading}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(product.id);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card">
          <div className="card-header">
            <div>
              <h3>{selectedProduct ? `Editing product #${selectedProduct.id}` : "Create new product"}</h3>
              <p className="muted">Edit the JSON below. Save will create or update depending on selection.</p>
            </div>
            <button className="button button-secondary" disabled={loading} onClick={handleNew}>
              New product
            </button>
          </div>

          <textarea
            className="textarea"
            value={fieldsText}
            onChange={(e) => setFieldsText(e.target.value)}
            aria-label="Product fields JSON"
          />

          <div className="actions">
            <button className="button button-primary" disabled={loading} onClick={handleSave}>
              Save
            </button>
          </div>

          {error ? (
            <p className="muted" style={{ color: "#dc2626", marginTop: 8 }}>
              {error}
            </p>
          ) : null}
        </section>
      </div>

      <section className="card">
        <div className="card-header">
          <h3>Last response</h3>
          <p className="muted">API responses or errors appear here.</p>
        </div>
        {lastResponse === null ? (
          <p className="muted">No response yet.</p>
        ) : typeof lastResponse === "string" ? (
          <pre className="last-response">{lastResponse}</pre>
        ) : (
          <pre className="last-response">{pretty(lastResponse)}</pre>
        )}
      </section>
    </main>
  );
}

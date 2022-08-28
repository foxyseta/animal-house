import { h, useState, useEffect } from "../h";

import { navigate } from "../router";
import fetch, { withOptions } from "shared/fetch";
import req from "../async";

import SelectCategory from "../components/select-category";
import SelectSubcategory from "../components/select-subcategory";

const ProductWrapper = () => {
  const id = window.location.pathname.match(
    /^\/products\/([0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12})$/
  )[1];
  const {
    data,
    loading: fetching,
    err: fetchErr,
  } = req(`store/products/${id}`, fetch);
  return h(
    "main",
    {},
    fetching
      ? h("progress", { className: "progress is-primary" })
      : fetchErr
      ? h("div", { className: "notification is-danger" }, "Error: ", fetchErr)
      : h(Product, { id, data })
  );
};

const Product = ({ id, data }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState(data.category);
  const [subcategory, setSubcategory] = useState(data.subcategory);

  const patch = async (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const description = document.getElementById("description").value;
    const price = parseFloat(document.getElementById("price").value);
    setLoading(true);
    setError(null);
    try {
      const {
        name: newName,
        description: newDescription,
        price: newPrice,
        category: newCategory,
        subcategory: newSubcategory,
      } = await fetch(
        `store/products/${id}`,
        withOptions("PATCH", {
          name,
          description,
          price,
          category: category?._id,
          subcategory: subcategory?._id,
        })
      );
      data.name = newName;
      data.description = newDescription;
      data.price = newPrice;
      if (newCategory != category) setCategory(newCategory);

      if (newSubcategory != subcategory) setSubcategory(newSubcategory);
    } catch (err) {
      setError(err.message || "An error occourred while adding a new product");
    }
    setLoading(false);
  };
  const del = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await fetch(`store/products/${id}`, withOptions("DELETE"));
      navigate("/products");
    } catch (err) {
      setError("Error while deleting: " + (err.message || "Could not rename"));
    }
    setLoading(false);
  };
  return h(
    "main",
    {},
    h("h1", { className: "is-size-3" }, "Product #", data._id),
    h(
      "form",
      { onSubmit: patch },
      h(
        "div",
        { className: "field my-2" },
        h("label", { for: "name", className: "label" }, "Name"),
        h(
          "div",
          { className: "control" },
          h("input", {
            id: "name",
            type: "text",
            className: "input",
            value: data.name,
            disabled: loading,
          })
        )
      ),
      h(
        "div",
        { className: "field my-2" },
        h("label", { for: "description", className: "label" }, "Description"),
        h(
          "div",
          { className: "control" },
          h(
            "textarea",
            {
              id: "description",
              type: "text",
              className: "textarea",
              placeholder: "Type in a description...",
              disabled: loading,
            },
            data.description
          )
        )
      ),
      h(
        "div",
        { className: "field my-2" },
        h("label", { for: "price", className: "label" }, "Price"),
        h(
          "div",
          { className: "control" },
          h("input", {
            id: "price",
            type: "number",
            step: "0.01",
            className: "input",
            value: data.price,
            disabled: loading,
          })
        )
      ),
      h(SelectCategory, {
        selected: category,
        onSelect: (c) => setCategory(c),
      }),
      category != undefined
        ? h(SelectSubcategory, {
            selected: subcategory,
            category,
            onSelect: (c) => setSubcategory(c),
          })
        : null,
      h(
        "div",
        {
          className:
            "is-flex is-flex-direction-row is-justify-content-space-between py-2",
        },
        h(
          "button",
          {
            className: "button is-danger",
            action: "none",
            onClick: del,
            disabled: loading,
          },
          "Delete"
        ),
        h(
          "button",
          {
            action: "submit",
            className: "button is-primary",
            disabled: loading,
          },
          "Update"
        )
      ),
      error && h("div", { className: "notification is-danger" }, error)
    )
  );
};

export default ProductWrapper;

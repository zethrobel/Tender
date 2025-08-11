import React, { useState, useEffect } from "react";
import axios from "axios";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import Find from "./Find";
import SimpleExcelReader from './Excel';
function LibraryTender(props) {
  const baseUrl = "http://localhost:4000";
  const [editingProduct, setEditingProduct] = useState(null); //this set the id of the clicked company and it's specific product
  const [editFormData, setEditFormData] = useState({
    // This is for the new input (the update or the edit)
    companyName: "",
    item: "",
    price: "",
    note: "",
  });

  const [library, setLibrary] = useState([]);
  const [formData, setFormData] = useState({
    companyName: "",
    item: "",
    price: "",
    note: "",
  });

  const handleEditClick = (company, product) => {
    // on the click of the edit button everything will set
    setEditingProduct({
      companyId: company._id,
      productId: product._id,
    });
    setEditFormData({
      companyName: company.companyName,
      item: company.item,
      price: company.price,
      note: company.note,
    });
  };

  const handleEditFormChange = (e) => {
    // this will track the changes made in the input(update or edit part)
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(baseUrl + "/library", {
        companyId: editingProduct.companyId,
        productId: editingProduct.productId,
        updates: editFormData,
      });
      console.log(response);

      setLibrary((prev) =>
        prev.map((company) => {
          if (company._id === editingProduct.companyId) {
            return {
              ...company,
              products: company.products.map((product) =>
                product._id === editingProduct.productId
                  ? { ...product, ...editFormData }
                  : product
              ),
            };
          }
          return company;
        })
      );
      setEditingProduct(null);
      showToast("Product updated Successfully");
    } catch (error) {
      console.error("Failed to Update", error);
      showToast("Failed To Update");
    }
  };

  const showToast = async (toastValue) => {
    // Show success toast
    const toast = document.createElement("div");
    toast.className = "fixed-top mt-4 alert alert-success fade show";
    toast.style = "max-width: 300px; margin: 0 auto; right: 0; left: 0;";
    toast.innerHTML = toastValue;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  // Fetch library data on component mount
  useEffect(() => {
    const fetchLibrary = async () => {
      try {
        const response = await axios.get(baseUrl + "/library");
        setLibrary(response.data);
        console.log("Library data:", response.data);
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };
    fetchLibrary();
  }, []);

  

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDeleteButton = async (companyId, productId) => {
    try {
      // Send delete request to backend
      await axios.delete(`${baseUrl}/library`, {
        data: {
          companyId,
          productId,
        },
      });

      // Update UI by filtering out the deleted product
      setLibrary((prev) =>
        prev.map((company) => {
          if (company._id === companyId) {
            return {
              ...company,
              products: company.products.filter((p) => p._id !== productId),
            };
          }
          return company;
        })
      );

      // Show success toast
      showToast("Product deleted successfully!");
    } catch (error) {
      console.error("Delete error:", error);
      showToast("Failed to delete product");
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    //e.preventDefault();

    try {
      // Send data to backend
      const response = await axios.post(baseUrl + "/library", formData);
      console.log("Data added:", response.data);

      // Update UI with new data
      setLibrary((prev) => [...prev, response.data]);

      // Clear form
      setFormData({
        companyName: "",
        item: "",
        price: "",
        note: "",
      });

      // Toast notification instead of alert
      showToast("Product added successfully!");
    } catch (error) {
      console.error("Submission error:", error);
      showToast("Failed to add product");
    }
  };

  return (
    <div>
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="products m-0">Add products here</h4> 
          
          <div className="btn-group">
            <button className="btn btn-primary me-2">
              <a href="/rfq" className="text-decoration-none whitner">
                RFQ
              </a>
            </button>
            <button className="btn btn-success">
              <a href="/openTender" className="text-decoration-none whitner">
                Open Tender
              </a>
            </button>
            <Find 
             LibrayValue={library}
             identity="search for a product ..."
             />
          </div>
        </div>
        {/* Add Product Form */}
        <form onSubmit={handleSubmit} className="card p-4 mb-4 shadow-sm">
          <div className="row g-3">
            <div className="col-md-6">
              <input
                type="text"
                className="form-control"
                placeholder="Company Name"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                // required
              />
            </div>
            <div className="col-md-6">
              <input
                type="text"
                className="form-control"
                placeholder="Item"
                name="item"
                value={formData.item}
                onChange={handleInputChange}
                // required
              />
            </div>
            <div className="col-md-6">
              <input
                type="number"
                className="form-control"
                placeholder="Price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                // required
              />
            </div>
            <div className="col-md-12">
              <textarea
                className="form-control"
                placeholder="Note"
                name="note"
                value={formData.note}
                onChange={handleInputChange}
                rows="3"
              />
            </div>
            <div className="col-md-12">
              <button type="submit" className="btn btn-outline-success">
                Add Product
              </button>
              
            </div>
          </div>
        </form>

     
    {editingProduct && (
  <div className="modal fade show" style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)', fontSize:"initial"}}>
    <div className="modal-dialog modal-lg">
      <div className="modal-content">
        <div className="modal-header bg-primary text-white">
          <h5 className="modal-title">Edit Company Product</h5>
          <button 
            type="button" 
            className="btn-close btn-close-white" 
            onClick={() => setEditingProduct(null)}
            aria-label="Close"
          ></button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleEditSubmit}>
            <div className="row g-3">
              <div className="col-md-12">
                <label className="form-label">Company Name</label>
                <input
                      type="text"
                      className="form-control"
                      placeholder="Company Name"
                      name="companyName"
                      value={editFormData.companyName}
                      onChange={handleEditFormChange}
                      disabled
                />
              </div>

              <div className="col-md-6">
                <label className="form-label" style={{fontWeight:"bold"}}>Item</label>
                <input
                      type="text"
                      className="form-control"
                      placeholder={editFormData.item || "Items"}
                      name="item"
                      value={editFormData.item}
                      onChange={handleEditFormChange}
                  
                />
              </div>

              <div className="col-md-6">
                <label className="form-label" style={{fontWeight:"bold"}}>Price</label>
                <input
                      type="number"
                      className="form-control"
                      placeholder={formData.price || "Price"}
                      name="price"
                      value={editFormData.price}
                      onChange={handleEditFormChange}
                      min="0"
                />
              </div>

              <div className="col-12">
                <label className="form-label" style={{fontWeight:"bold"}}>Notes</label>
                <textarea
                      className="form-control"
                      placeholder={editFormData.note || "notes"}
                      name="note"
                      value={editFormData.note}
                      onChange={handleEditFormChange}
                      rows="3"
                />
              </div>
            </div>
          </form>
        </div>
        <div className="modal-footer">
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={() => setEditingProduct(null)}
          >
            Close
          </button>
          <button 
            type="button" 
            className="btn btn-primary"
            onClick={handleEditSubmit}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  </div>
)}

        <div className="product-list">
          <h4 className="mb-3 products">Saved Products</h4>
          {library.length === 0 ? (
            <div className="alert alert-info">
              No products found. Add some products to see them here.
            </div>
          ) : (
            library.map((company) => (
              <div key={company._id} className="card mb-3 shadow-sm">
                <div className="card-header bg-light d-flex justify-content-between align-items-center mb-4">
                  <h4 className="mb-0 card-bodyTitle">{company.companyName}</h4>
                  <SimpleExcelReader 
                  id={company._id}
                  companyName={company.companyName} />
                </div>
                <div className="card-body">
                  <div className="row">
                    {company.products.map((product, index) => (
                      <div key={index} className="col-md-3 mb-3">
                        <div className="card h-100">
                          <div className="card-body card-bodySize">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <h5 className="m-0 card-title text-truncate pe-2">
                                {product.item}
                              </h5>

                              <div className="btn-group btn-group-sm">
                                <button
                                  onClick={() =>
                                    handleEditClick(company, product)
                                  }
                                  className="btn btn-outline-primary btn-sm p-1 me-1"
                                  style={{ minWidth: "32px" }}
                                >
                                  <EditIcon fontSize="small" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteButton(company._id, product._id)
                                  }
                                  className="btn btn-outline-success btn-sm p-1"
                                  style={{ minWidth: "32px" }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </button>
                              </div>
                            </div>

                            <p className="card-text">
                              <strong>Price:</strong> ETB {product.price}
                              <br />
                              <strong>Note:</strong> {product.note}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default LibraryTender;

import React, { useState, useEffect } from "react";
import axios from "axios";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import Find from "./Find";
import SimpleExcelReader from "./Excel";
function OpenTender() {
  const baseUrl = "http://localhost:4000";
  const [editingProduct, setEditingProduct] = useState(null);
  const [editFormData, setEditFormData] = useState({
    BidRequest: "",
    bidItem: "",
    bidPrice: "",
    bidNote: "",
  });
  const [tenders, setTenders] = useState([]);
  const [formData, setFormData] = useState({
    BidRequest: "",
    bidItem: "",
    bidPrice: "",
    bidNote: "",
  });

  const handleEditClick = (tender, bid) => {
    setEditingProduct({
      tenderId: tender._id,
      bidId: bid._id,
    });
    setEditFormData({
      BidRequest: tender.BidRequest,
      bidItem: tender.bidItem,
      bidPrice: tender.bidPrice,
      bidNote: tender.bidNote,
    });
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(baseUrl + "/open", {
        tenderId: editingProduct.tenderId,
        bidId: editingProduct.bidId,
        updates: editFormData,
      });
      console.log(response);

      setTenders((prev) =>
        prev.map((tender) => {
          if (tender._id === editingProduct.tenderId) {
            return {
              ...tender,
              bids: tender.bids.map((bid) =>
                bid._id === editingProduct.bidId
                  ? { ...bid, editFormData }
                  : bid
              ),
            };
          }
          return tender;
        })
      );
      setEditingProduct(null);
      showToast("Product Updated Successfully");
    } catch (error) {
      console.error("Failed to Update", error);
      showToast("Failed To Update");
    }
  };

  const showToast = async (toastValue) => {
    const toast = document.createElement("div");
    toast.className = "fixed-top mt-4 alert alert-success fade show";
    toast.style = "max-width: 300px; margin: 0 auto; right: 0; left: 0;";
    toast.innerHTML = toastValue;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  useEffect(() => {
    const fetchTenders = async () => {
      try {
        const response = await axios.get(`${baseUrl}/open`);
        setTenders(response.data);
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };
    fetchTenders();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDeleteButton = async (tenderId, bidId) => {
    try {
      await axios.delete(baseUrl + "/open", {
        data: {
          tenderId,
          bidId,
        },
      });

      setTenders((prev) =>
        prev.map((tender) => {
          if (tender._id === tenderId) {
            return {
              ...tender,
              bids: tender.bids.filter((p) => p._id !== bidId),
            };
          }
          return tender;
        })
      );

      showToast("Bid Deleted Successfully!");
    } catch (error) {
      console.error("Delete error: ", error);
      showToast("Failed to Delete Bid");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${baseUrl}/open`, {
        BidRequest: formData.BidRequest,
        bidItem: formData.bidItem,
        bidPrice: formData.bidPrice,
        bidNote: formData.bidNote,
      });

      setTenders((prev) => [...prev, response.data]);
      setFormData({
        BidRequest: "",
        bidItem: "",
        bidPrice: "",
        bidNote: "",
      });
      // Toast notification instead of alert
      showToast("Bid added successfully!");
    } catch (error) {
      console.error("Submission error:", error);
      showToast("Failed to add Bid");
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="products m-0">Add Open tenders here</h4>
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
          identity="search for a bids ..."
          tenderValue={tenders}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card p-4 mb-4 shadow-sm">
        <div className="row g-3">
          <div className="col-md-6">
            <input
              type="text"
              className="form-control"
              placeholder="Bid Request"
              name="BidRequest"
              value={formData.BidRequest}
              onChange={handleInputChange}
              // required
            />
          </div>
          <div className="col-md-6">
            <input
              type="text"
              className="form-control"
              placeholder="Bid Item"
              name="bidItem"
              value={formData.bidItem}
              onChange={handleInputChange}
              // required
            />
          </div>
          <div className="col-md-6">
            <input
              type="number"
              className="form-control"
              placeholder="Bid Price"
              name="bidPrice"
              value={formData.bidPrice}
              onChange={handleInputChange}
              // required
            />
          </div>
          <div className="col-md-12">
            <textarea
              className="form-control"
              placeholder="Bid Note"
              name="bidNote"
              value={formData.bidNote}
              onChange={handleInputChange}
              rows="3"
            />
          </div>
          <div className="col-md-12">
            <button type="submit" className="btn btn-outline-success">
              Add Tender
            </button>
          </div>
        </div>
      </form>

    

{/* Modal Component */}
{editingProduct && (
  <div className="modal fade show" style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)', fontSize:"initial"}}>
    <div className="modal-dialog modal-lg">
      <div className="modal-content">
        <div className="modal-header bg-primary text-white">
          <h5 className="modal-title">Edit Bid</h5>
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
                <label className="form-label">Bid Request</label>
                <input
                  type="text"
                  className="form-control"
                  name="BidRequest"
                  value={editFormData.BidRequest}
                  onChange={handleEditFormChange}
                  disabled
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Item</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder={formData.bidItem || "Bid Item"}
                  name="bidItem"
                  value={editFormData.bidItem}
                  onChange={handleEditFormChange}
                  
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Price</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder={formData.bidPrice || "Bid Price"}
                  name="bidPrice"
                  value={editFormData.bidPrice}
                  onChange={handleEditFormChange}
                  required
                  min="0"
                />
              </div>

              <div className="col-12">
                <label className="form-label">Notes</label>
                <textarea
                  className="form-control"
                  placeholder={formData.bidNote || "Notes"}
                  name="bidNote"
                  value={editFormData.bidNote}
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
        <h4 className="mb-3 products">Saved Tenders</h4>
        {tenders.length === 0 ? (
          <div className="alert alert-info">No tenders found.</div>
        ) : (
          tenders.map((tender) => (
            <div key={tender._id} className="card mb-3 shadow-sm">
              <div className="card-header bg-light d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0 card-bodyTitle">{tender.BidRequest}</h4>
                  <SimpleExcelReader 
                    id={tender._id}
                    companyName={tender.BidRequest} />
              </div>
              <div className="card-body">
                <div className="row">
                  {tender.bids?.map((bid, index) => (
                    <div key={index} className="col-md-3 mb-3">
                      <div className="card h-100">
                        <div className="card-body card-bodySize">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <h5 className="m-0 card-title text-truncate pe-2">
                              {bid.bidItem}
                            </h5>
                            <div className="btn-group btn-group-sm">
                              <button
                                onClick={()=>handleEditClick(tender,bid)}
                                className="btn btn-outline-primary btn-sm p-1 me-1"
                                style={{ minWidth: "32px" }}
                              >
                                <EditIcon fontSize="small" />
                              </button>
                              <button
                                onClick={()=>handleDeleteButton(tender._id, bid._id)}
                                className="btn btn-outline-success btn-sm p-1"
                                style={{ minWidth: "32px" }}
                              >
                                <DeleteIcon fontSize="small" />
                              </button>
                            </div>
                          </div>
                          <p className="card-text">
                            <strong>Price:</strong> ETB {bid.bidPrice}
                            <br />
                            <strong>Note:</strong> {bid.bidNote}
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
  );
}

export default OpenTender;

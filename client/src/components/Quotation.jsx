


import React, {useState, useEffect} from "react";
import axios from "axios";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Find from "./Find";
import SimpleExcelReader from "./Excel";
function Quotation() {
  const baseUrl = "http://localhost:4000";

  const [editingProduct, setEditingProduct] = useState(null)
  const [editFormData,setEditFormData] = useState({
    QuoteRequest: "",
    quotedItem: "",
    quotedPrice: "",
    quotedNote: ""
  });

  const [quotations, setQuotations] = useState([]);
  const [formData, setFormData] = useState({
    QuoteRequest: "",
    quotedItem: "",
    quotedPrice: "",
    quotedNote: ""
  });

const handleEditClick=(quote,item)=>{
  setEditingProduct({
    quoteId:quote._id,
    itemId:item._id
  })
  setEditFormData({
    QuoteRequest: quote.QuoteRequest,
    quotedItem: quote.quotedItem,
    quotedPrice: quote.quotedPrice,
    quotedNote: quote.quotedNote
  })
}

const handleEditFormChange=(e)=>{
  const {name,value}=e.target
  setEditFormData(prev =>({
    ...prev,
    [name]:value
  }))
}

const handleEditSubmit = async(e)=>{
  e.preventDefault();

  try{
     const response= await axios.put(baseUrl+"/rfq",{
      quoteId:editingProduct.quoteId,
      itemId:editingProduct.itemId,
      updates:editFormData
     })
     console.log(response)

     setQuotations(prev=>prev.map(quote=>{
      if(quote._id===editingProduct.quoteId){
        return{
          ...quote,
          quotation:quote.quotation.map(item=>item._id===editingProduct.itemId?{...item,...editFormData}:item)
        }
      }
      return quote
     }))
     setEditingProduct(null)
     showToast("Quotation Updated Successfully")
  }
  catch(error){
      console.error("failed to Update",error)
      showToast("Failed to Update")
  }
}

const showToast=async(toastValue)=>{
      const toast = document.createElement("div");
      toast.className = "fixed-top mt-4 alert alert-success fade show";
      toast.style = "max-width: 300px; margin: 0 auto; right: 0; left: 0;";
      toast.innerHTML = toastValue;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
}

  useEffect(() => {
    const fetchQuotations = async () => {
      try {
        const response = await axios.get(`${baseUrl}/rfq`);
        setQuotations(response.data);
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };
    fetchQuotations();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

const handleDeleteButton = async(quoteId,itemId)=>{
  try{
    await axios.delete(baseUrl+"/rfq",{
      data:{
        quoteId,
        itemId
      }
    })
    setQuotations(prev =>prev.map(quote=>{
      if(quote._id===quoteId){
        return {
          ...quote,
          quotation:quote.quotation.filter(p=>p._id !==itemId)
        }
      }
      return quote
    }))
    showToast("Quotation Deleted Successfully")
  }

  catch(error){
  console.error("Delete Error:",error);
  showToast("Failed to delete Quotation")
  }
}


  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post(`${baseUrl}/rfq`, {
        QuoteRequest: formData.QuoteRequest,
        quotedItem: formData.quotedItem,
        quotedPrice: formData.quotedPrice,
        quotedNote: formData.quotedNote
      });
      
      setQuotations(prev => [...prev, response.data]);
      setFormData({
        QuoteRequest: "",
        quotedItem: "",
        quotedPrice: "",
        quotedNote: ""
      });
      
      showToast("Quotation added successfully!");
      
     
    } catch (error) {
      console.error("Submission error:", error);
      showToast("Failed to add quotation");
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="products m-0">Add RFQ here</h4>
        
        <div className="btn-group">
          <button className="btn btn-primary me-2">
            <a href="/rfq" className="text-decoration-none whitner">RFQ</a>
          </button>
          <button className="btn btn-success">
            <a href="/openTender" className="text-decoration-none whitner">Open Tender</a>
          </button>
          <Find 
          identity="search for a quote ..."
          quoteValue={quotations}
          />
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="card p-4 mb-4 shadow-sm">
        <div className="row g-3">
          <div className="col-md-6">
            <input
              type="text"
              className="form-control"
              placeholder="Quote Request"
              name="QuoteRequest"
              value={formData.QuoteRequest}
              onChange={handleInputChange}
              // required
            />
          </div>
          <div className="col-md-6">
            <input
              type="text"
              className="form-control"
              placeholder="Quoted Item"
              name="quotedItem"
              value={formData.quotedItem}
              onChange={handleInputChange}
              // required
            />
          </div>
          <div className="col-md-6">
            <input
              type="number"
              className="form-control"
              placeholder="Quoted Price"
              name="quotedPrice"
              value={formData.quotedPrice}
              onChange={handleInputChange}
              // required
            />
          </div>
          <div className="col-md-12">
            <textarea
              className="form-control"
              placeholder="Quoted Note"
              name="quotedNote"
              value={formData.quotedNote}
              onChange={handleInputChange}
              rows="3"
            />
          </div>
          <div className="col-md-12">
            <button type="submit" className="btn btn-outline-success">
              Add Quotation
            </button>
          </div>
        </div>
      </form>
    
       
       {editingProduct && (
  <div className="modal fade show" style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)', fontSize:"initial"}}>
    <div className="modal-dialog modal-lg">
      <div className="modal-content">
        <div className="modal-header bg-primary text-white">
          <h5 className="modal-title">Edit Quotation</h5>
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
                <label className="form-label">Quotation Request</label>
                <input
              type="text"
              className="form-control"
              placeholder="Quote Request"
              name="QuoteRequest"
              value={editFormData.QuoteRequest}
              onChange={handleEditFormChange}
              disabled
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Item</label>
                <input
              type="text"
              className="form-control"
              placeholder="Quoted Item"
              name="quotedItem"
              value={editFormData.quotedItem}
             onChange={handleEditFormChange}
                  
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Price</label>
                <input
              type="number"
              className="form-control"
              placeholder="Quoted Price"
              name="quotedPrice"
              value={editFormData.quotedPrice}
              onChange={handleEditFormChange}
              
                  min="0"
                />
              </div>

              <div className="col-12">
                <label className="form-label">Notes</label>
                <textarea
            className="form-control"
              placeholder="Quoted Note"
              name="quotedNote"
              value={editFormData.quotedNote}
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
        <h4 className="mb-3 products">Saved Quotations</h4>
        {quotations.length === 0 ? (
          <div className="alert alert-info">No quotations found.</div>
        ) : (
          quotations.map(quote => (
            <div key={quote._id} className="card mb-3 shadow-sm">
              <div className="card-header bg-light d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0 card-bodyTitle">{quote.QuoteRequest}</h4>
                <SimpleExcelReader 
                  id={quote._id}
                  companyName={quote.QuoteRequest} />
              </div>
              <div className="card-body">
                <div className="row">
                  {quote.quotation?.map((item, index) => (
                    <div key={index} className="col-md-3 mb-3">
                      <div className="card h-100">
                        <div className="card-body card-bodySize">
                             <div className="d-flex justify-content-between align-items-center mb-2">
                                  <h5 className="m-0 card-title text-truncate pe-2">{item.quotedItem}</h5>
                                      <div className="btn-group btn-group-sm">
                                        <button className="btn btn-outline-primary btn-sm p-1 me-1" style={{ minWidth: "32px" }} 
                                        onClick={()=>handleEditClick(quote,item)}
                                        >
                                           <EditIcon fontSize="small" />
                                        </button>
                                        <button
                                        onClick={()=>handleDeleteButton(quote._id,item._id)}
                                         className="btn btn-outline-success btn-sm p-1" style={{ minWidth: "32px" }} >
                                           <DeleteIcon fontSize="small" />
                                        </button>
                                        </div>
                              </div>                        
                          <p className="card-text">
                            <strong>Price:</strong> ETB {item.quotedPrice}
                            <br />
                            <strong>Note:</strong> {item.quotedNote}
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

export default Quotation 



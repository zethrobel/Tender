import React, { useState } from "react";
import SearchIcon from "@mui/icons-material/Search";

function Find(props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [expandedCompany, setExpandedCompany] = useState(null);
  const libraryItems = props.LibrayValue || props.tenderValue || props.quoteValue || [];

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const results = libraryItems.filter(item => {
      // Check all possible item structures
      if (item.products) {
        // Library items structure
        return item.products.some(product => 
          String(product.item || '').toLowerCase().includes(searchQuery.toLowerCase()))
      }
      else if (item.bids) {
        // Tender items structure
        return item.bids.some(bid => 
          String(bid.bidItem || '').toLowerCase().includes(searchQuery.toLowerCase()))
      }
      else if (item.quotation) {
        // RFQ items structure
        return item.quotation.some(quote => 
          String(quote.quotedItem || '').toLowerCase().includes(searchQuery.toLowerCase()))
      }
      return false;
    });

    setSearchResults(results);
    setExpandedCompany(null);
  };

  const handleSearchOnChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const toggleCompanyProducts = (companyId) => {
    setExpandedCompany(expandedCompany === companyId ? null : companyId);
  };

  // Function to get the correct items and field names based on data type
  const getItemsToDisplay = (item) => {
    if (item.products) {
      return {
        items: item.products,
        nameField: 'item',
        priceField: 'price',
        noteField: 'note'
      };
    }
    if (item.bids) {
      return {
        items: item.bids,
        nameField: 'bidItem',
        priceField: 'bidPrice',
        noteField: 'bidNote'
      };
    }
    if (item.quotation) {
      return {
        items: item.quotation,
        nameField: 'quotedItem',
        priceField: 'quotedPrice',
        noteField: 'quotedNote'
      };
    }
    return { items: [], nameField: '', priceField: '', noteField: '' };
  };

  // Function to get the company/supplier name
  const getCompanyName = (item) => {
    if (item.companyName) return item.companyName;
    if (item.BidRequest) return item.BidRequest;
    if (item.QuoteRequest) return item.QuoteRequest;
    return 'Untitled Company';
  };

  return (
    <div className="btn-group">
      {/* Toggle Button */}
      <button
        className="btn btn-primary d-flex align-items-center justify-content-center p-2"
        style={{ width: "40px", height: "38px" }}
        type="button"
        data-bs-toggle="offcanvas"
        data-bs-target="#offcanvasRight"
        aria-controls="offcanvasRight"
      >
        <SearchIcon fontSize="small" />
      </button>

      {/* Offcanvas Search Panel */}
      <div
        className="offcanvas offcanvas-end"
        tabIndex="-1"
        id="offcanvasRight"
        aria-labelledby="offcanvasRightLabel"
      >
        <div className="offcanvas-header">
          <h5 id="offcanvasRightLabel">Search Items Source</h5>
          <button
            type="button"
            className="btn-close text-reset"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
            style={{fontSize:"initial"}}
          ></button>
        </div>
        
        <div className="offcanvas-body">
          <form onSubmit={handleSearch}>
            <div className="d-flex align-items-center mb-3">
              <input
                type="text"
                className="form-control me-2"
                placeholder={props.identity || "Search for an item..."}
                value={searchQuery}
                onChange={handleSearchOnChange}
                style={{ height: "38px", marginTop:"6px", marginBottom:"6px" }}
              />
              <button
                className="btn btn-outline-success d-flex align-items-center justify-content-center"
                style={{ width: "45px", height: "38px" }}
                type="submit"
              >
                <SearchIcon fontSize="small" />
              </button>
            </div>
          </form>

          {/* Search Results */}
          {searchResults.length > 0 ? (
            <div className="list-group mt-2">
              {searchResults.map((item) => (
                <div key={item._id} className="list-group-item p-0">
                  <button
                    type="button"
                    className="btn btn-link text-start w-100 p-3 text-decoration-none"
                    onClick={() => toggleCompanyProducts(item._id)}
                  >
                    {getCompanyName(item)}
                  </button>
                  
                  {expandedCompany === item._id && (
                    <div className="p-3 pt-0" style={{fontSize:"initial"}}>
                      <h6 className="mb-2">Items:</h6>
                      <ul className="list-group">
                        {getItemsToDisplay(item).items.map((product, index) => {
                          const fields = getItemsToDisplay(item);
                          return (
                            <li key={index} className="list-group-item">
                              <div className="d-flex justify-content-between">
                                <span>{product[fields.nameField]}</span>
                                <span>
                                  {product[fields.priceField]} 
                                  {product[fields.noteField] ? ` (${product[fields.noteField]})` : ''}
                                </span>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : searchQuery ? (
            <p className="text-muted mt-3">No results found for "{searchQuery}"</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default Find;
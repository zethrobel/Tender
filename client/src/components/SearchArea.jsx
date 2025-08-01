import React, { useState,useEffect } from "react";
import axios from "axios";
import SearchIcon from '@mui/icons-material/Search';
import { List, AutoSizer, CellMeasurer, CellMeasurerCache } from 'react-virtualized';
import Chip from '@mui/material/Chip'

function SearchArea() {
  const baseUrl = "http://localhost:4000";
  const [keyWord, setKeyWord] = useState("");
  const [result, setResults] = useState([]);
  const [analysis,setAnalysis] = useState([]);

    // Create cache for dynamic row heights
  const measurerCache = new CellMeasurerCache({
    fixedWidth: true,
    defaultHeight: 50,
  });

  // Reset cache when results change
  useEffect(() => {
    measurerCache.clearAll();
  }, [result]);

  // Style configurations
  const phoneStyle = {
    backgroundColor: '#e3f2fd',
    color: '#0d47a1',
    fontWeight: 'bold',
    padding: '2px 4px',
    borderRadius: '3px'
  };

  const keywordStyle = {
    backgroundColor: '#fff9c4',
    color: '#c62828',
    padding: '2px 4px',
    borderRadius: '3px'
  };

  const highlightContent = (line,date) => {
    if (!line) return line;

    // First highlight phone numbers
    const phoneRegex = /(\+2519\d{8}|09\d{8})/g;
    const withPhones = line.split(phoneRegex).map((part, index) => {
      if (phoneRegex.test(part)) {
        return (
          <span key={`phone-${index}`} style={phoneStyle}>
            {part}
          </span>
        );
      }
      return part;
    });

    // Then highlight keywords in all parts
    return withPhones.flatMap(part => {
      if (typeof part !== 'string' || !keyWord) return part;
      
      const keywordRegex = new RegExp(`(${escapeRegExp(keyWord)})`, 'gi');
      return part.split(keywordRegex).map((segment, segIndex) => {
        if (keywordRegex.test(segment)) {
          return (
            <span key={`kw-${segIndex}`} style={keywordStyle}>
              {segment}
            </span>
          );
        }
        return segment;
      });
    });
  };

  const escapeRegExp = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  // Rest of the component remains the same
  const keyWordHandler = (e) => {
    setKeyWord(e.target.value);
  };

  const keyWordHandlerButton = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(baseUrl + "/search", {
        keyWord,
        inviteLink: 't.me/sabo_pharma2012'
      });
      setResults(response.data.matches);
      setAnalysis(response.data.analysis)
      console.log(response.data)
     
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Date formatting function
  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

   // Virtualized row renderer
  const rowRenderer = ({ index, key, parent, style }) => {
    const data = result[index];
    
    return (
      <CellMeasurer
        key={key}
        cache={measurerCache}
        parent={parent}
        rowIndex={index}
      >
        <div className="virtualized-item" >
          {/* Content */}
          {data.text.split('\n').map((line, i) => (
            <p key={i} style={{ 
              whiteSpace: 'pre-line',
              margin: '4px 0',
              padding: '2px 0'
            }}>
              {highlightContent(line)}
            </p>
          ))}
          
          {/* Date display */}
          {data.date && (
            <div style={{
              marginTop: '12px',
              paddingTop: '8px',
              borderTop: '1px dashed #ccc',
              fontSize: '0.8rem',
              color: '#666'
            }}>
              Published at: {formatDate(data.date)}
            </div>
          )}
        </div>
      </CellMeasurer>
    );
  };

 //helper function 
const renderAnalysisValue = (value) => {
  if (value === null || value === undefined) return 'N/A';
  
  if (Array.isArray(value)) {
    return value.map((item, i) => (
      <div key={i}>{renderAnalysisValue(item)}</div>
    ));
  }
  
  if (typeof value === 'object') {
    return Object.entries(value).map(([key, val]) => (
      <div key={key}>
        <strong>{key}:</strong> {renderAnalysisValue(val)}
      </div>
    ));
  }
  
  return value.toString();
};

// console.log(analysis.summary)
// console.log(analysis.contacts)
// console.log(analysis.companies)
//  const comps= analysis.companies
   
 return (
  <div className="container-fluid " style={{ height: 'calc(100vh - 60px)' }}>
    <form className="searchingArea mb-3" onSubmit={keyWordHandlerButton}>
      <input 
        onChange={keyWordHandler} 
        name="keyWord" 
        placeholder="Type here" 
        value={keyWord} 
      />
      <button type="submit"><SearchIcon /></button>
    </form>
    
    <div className="row g-2" style={{ height: '100%' }}>
      {/* Analysis Section */}
      <div className="col-md-6" style={{ height: '100%' }}>
       
       <h4 className="groupHeading">📝 Summary</h4>

        <div className="h-100" style={{ display: 'flex', flexDirection: 'column' }}>
          <AutoSizer>
            {({ width, height }) => (
              <div 
                className="analysis-results bg-light p-2 overflow-auto" 
                style={{ width, height }}
              >
                {/* Summary section */}
                {analysis?.summary && (
                  <div className="summary mb-3">
                    
                    <p>{analysis.summary}</p>
                  </div>
                )}

                {/* Companies section */}
                {analysis?.companies?.length > 0 && (
                  <div className="companies mb-3">
                    <h4>🏢 Companies Mentioned</h4>
                    <div className="d-flex flex-wrap gap-1">
                      {analysis.companies.map((company, i) => (
                        <Chip key={i} label={company.name} variant="outlined" />
                      ))}
                    </div>
                  </div>
                )}

                {/* Contact information */}
                {analysis?.companies?.length > 0 && (
                  <div className="contact-info mb-3">
                    <h4>📇 Contact Information</h4>
                    <ul className="list-unstyled">
                      {analysis.companies.map((company, i) => (
                        <li key={i} className="mb-2">
                          <strong>{company.name || 'Unknown Contact'}</strong>
                          <div>
                            {company.contact_information?.phone_number && (
                              <span>📞 {company.contact_information.phone_number}</span>
                            )}
                          </div>
                          <div>
                            {company.contact_information?.social_media_handles?.length > 0 && (
                              <span>🔗 {company.contact_information.social_media_handles.join(", ")}</span>
                            )}
                          </div>
                          <div>
                            {company.special_offers && (
                              <span>💸 {company.special_offers}</span>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}



                {/* Discounts section */}
                {analysis?.discounts?.length > 0 && (
                  <div className="discounts mb-3">
                    <h4>💰 Special Offers</h4>
                    <ul className="list-unstyled">
                      {analysis.discounts.map((discount, i) => (
                        <li key={i}>
                          {typeof discount === 'string' 
                            ? discount 
                            : discount.text || discount.details}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Trends Section */}
                {analysis?.keyProductsTrend && (
                  <div className="trends">
                    <h4>📈 Key Product Trends</h4>
                    <p>{analysis.keyProductsTrend}</p>
                  </div>
                )}
              </div>
            )}
          </AutoSizer>
        </div>
      </div>

      {/* Results List Section */}
      <div className="col-md-6" style={{ height: '100%' }}>
      <h4 className="groupHeading">🗒List Of Items</h4>
        <AutoSizer>
          {({ width, height }) => (
            <List
              width={width}
              height={height}
              deferredMeasurementCache={measurerCache}
              rowHeight={measurerCache.rowHeight}
              rowCount={result.length}
              rowRenderer={rowRenderer}
              overscanRowCount={5}
            />
          )}
        </AutoSizer>
      </div>
    </div>
  </div>
);
}

export default SearchArea;
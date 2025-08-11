import { useState } from 'react';
import * as XLSX from 'xlsx';
import axios from "axios";

function SimpleExcelReader(props) {
  const baseUrl = "http://localhost:4000";
  const [data, setData] = useState([]);
  const [currentCompany, setCurrentCompany] = useState({
    id: props.id,
    name: props.companyName
  });

   const showToast = async (toastValue) => {
    const toast = document.createElement("div");
    toast.className = "fixed-top mt-4 alert alert-success fade show";
    toast.style = "max-width: 300px; margin: 0 auto; right: 0; left: 0;";
    toast.innerHTML = toastValue;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };


  const handleExcel= async(e)=>{
    try{
      const excelResponse= await axios.post(baseUrl+"/getExcel",{
        
        companyId: data.companyId,
        companyName: data.companyName,
        excelData:data.excelData
      })
      showToast("Added to "+ data.companyName)
    }
    catch(error){
      console.error("Error saving", error)
      showToast("Error Saving")
    }
  }

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const workbook = XLSX.read(e.target.result);
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);
        
        // Add company info to the data
        const dataWithCompany = {
          companyId: currentCompany.id,
          companyName: currentCompany.name,
          excelData: jsonData
        };
        
        setData(dataWithCompany);
        console.log("Uploaded data for:", currentCompany.name, dataWithCompany, data);
      } catch (error) {
        console.error("Error parsing Excel:", error);
      }
    };
    
    reader.onerror = () => {
      console.error("Error reading file");
    };
    
    reader.readAsArrayBuffer(file);
  };

  return (
    <div>
      <button 
        type="button" 
        className="btn btn-primary" 
        data-bs-toggle="modal" 
        data-bs-target={`#modal-${props.id}`} // Unique modal for each company
        onClick={() => setCurrentCompany({
          id: props.id,
          name: props.companyName
        })}
      >
        Upload an Excel file
      </button>
     

      {/* Unique modal for each company */}
      <div 
        className="modal fade" 
        id={`modal-${props.id}`} 
        tabIndex="-1" 
        aria-labelledby={`modalLabel-${props.id}`}
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-scrollable" style={{fontSize:"initial"}}>
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id={`modalLabel-${props.id}`}>
                Add file to {currentCompany.name}
              </h1>
              <button 
                type="button" 
                className="btn-close" 
                data-bs-dismiss="modal" 
                aria-label="Close"
              ></button>
            </div>
             
            <div className="modal-body" >
              <input 
                className="form-control"
                type="file" 
                onChange={handleFile} 
                accept=".xlsx,.xls" 
                name='Upload xlsx file' 
                id="formFile"
              />
              <pre>{JSON.stringify(data, null, 2)}</pre>
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-primary" 
                data-bs-dismiss="modal"
              >
                Close
              </button>
              <button 
                type="button" 
                className="btn btn-success"
                data-bs-dismiss="modal"
                onClick={handleExcel}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SimpleExcelReader;
import React, { useState } from 'react';
import PlotPage from './PlotPage';
import RecordPage from './RecordPage'; 

const ForceTrigger = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [navigateToPlotPage, setNavigateToPlotPage] = useState(false);
  const [navigateToRecordPage, setNavigateToRecordPage] = useState(false);

  const handleFileSelect = (e) => {
    const files = e.target.files;
  
    if (files && files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
      setNavigateToPlotPage(true);
    } else {
      console.error("No files selected.");
    }
  };
  

  const handleRecordClick = () => {
    setNavigateToRecordPage(true);
  };

  // Conditionally render the PlotPage component when navigateToPlotPage is true
  if (navigateToPlotPage && selectedFile) {
    return <PlotPage selectedFile={selectedFile} />;
  }

  // Conditionally render the RecordPage component when navigateToRecordPage is true
  if (navigateToRecordPage) {
    return <RecordPage />;
  }

 return (
  <div className="App" style={{ display: 'flex', flexDirection: 'column', minHeight: '80vh' }}>
    <div style={{ flex: 1 }}>
      <h1 className="font-serif" style={{ fontSize: '48px', textAlign: 'center' }}>Reference measurement</h1>
      <p className="font-serif" style={{ fontSize: '28px', textAlign: 'center' }}>You need a reference measurement to define your trigger. Select how you want to proceed.</p>
    </div>
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
  <label htmlFor="fileInput" onClick={handleFileSelect} style={{ border: '2px solid #000', padding: '10px 90px', margin: '10px 20px', backgroundColor: '#1292d6', cursor: 'pointer' }}>
    Add measurements from a file
  </label>
  
  <label onClick={handleRecordClick} style={{ border: '2px solid #000', padding: '10px 70px', margin: '10px 20px ', backgroundColor: '#1292d6', cursor: 'pointer' }}>
    Record a measurement now
  </label>
  
  {/* Add a new label with an appropriate handler for continuing a previous run */}
  <label htmlFor="fileInput" onClick={handleFileSelect} style={{ border: '2px solid #000', padding: '10px 90px', margin: '10px 20px', backgroundColor: '#1292d6', cursor: 'pointer' }}>
    Continue a previous run
  </label>




      <input type="file" onChange={handleFileSelect} style={{ display: 'none' }} id="fileInput" />
    </div>
    {navigateToPlotPage && selectedFile && <PlotPage selectedFile={selectedFile} />}
    {navigateToRecordPage && <RecordPage />}
  </div>
);
};

export default ForceTrigger;

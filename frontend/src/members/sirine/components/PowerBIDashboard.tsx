import React from 'react';

const PowerBIDashboard = ({ onBack }) => {
  return (
    <div className="dashboard-container">
      
      <div className="iframe-wrapper">
        <iframe 
          title="Career Market Analytics" 
          width="100%" 
          height="800px" 
          src="https://app.powerbi.com/reportEmbed?reportId=fbe56edc-b080-4157-b130-b81ca088db90&autoAuth=true&ctid=604f1a96-cbe8-43f8-abbf-f8eaf5d85730" 
          frameBorder="0" 
          allowFullScreen={true}>
        </iframe>
      </div>
    </div>
  );
};

export default PowerBIDashboard;
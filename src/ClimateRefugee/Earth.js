import React, { useState, useRef } from 'react';
import Globe from '../ClimateRefugee/Globe';
import BottomButtons from '../ClimateRefugee/BottomButtons';
import { Table, Modal, Button, Form } from 'react-bootstrap';
import * as XLSX from 'xlsx';
import '../ClimateRefugee/Earth.css';

const AppRoutes = () => {
  const [showTable, setShowTable] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [infoCard, setInfoCard] = useState(null);
  const globeEl = useRef();
  
  const initialGlobePosition = { lat: 0, lng: 0, altitude: 1.5 }; // Define your initial position here

  // Load Excel Data
  const handleShowAllData = () => {
    const filePath = '/Climate_refugees_DATA.xlsx'; 
    const readExcelFile = async () => {
      try {
        const response = await fetch(filePath);
        const blob = await response.blob();
  
        const reader = new FileReader();
        reader.onload = (event) => {
          const data = new Uint8Array(event.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
  
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
  
          const parsedData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
          if (parsedData && parsedData.length) {
            const formattedData = parsedData.slice(1).map((row) => ({
              Name: row[0],
              'Original Location (Lat, Lon)': row[1],
              'Country Migrated From': row[2],
              'Country Moved To': row[3],
              'Reason for Migration': row[4],
              'Distance Covered (km)': row[5],
            }));
            setTableData(formattedData);
          } else {
            console.error('Parsed data is empty or invalid.');
          }
        };
  
        reader.readAsArrayBuffer(blob);
      } catch (error) {
        console.error('Error reading Excel file:', error);
      }
    };
    readExcelFile();
    setShowTable(true);
  };

  // Fetch Data based on Latitude and Longitude
  const handleSearchCoordinates = () => {
    const foundData = tableData.find((row) => {
      const latLonString = row['Original Location (Lat, Lon)'];
      const [lat, lon] = latLonString.split(',').map(parseFloat);
      return Math.abs(lat - latitude) < 0.1 && Math.abs(lon - longitude) < 0.1; // Allow slight differences
    });

    if (foundData) {
      setInfoCard({
        name: foundData.Name,
        fromCountry: foundData['Country Migrated From'],
        toCountry: foundData['Country Moved To'],
        reason: foundData['Reason for Migration'],
        distance: foundData['Distance Covered (km)'],
      });
      // Rotate the globe only if data is found
      if (globeEl.current) {
        globeEl.current.pointOfView({ lat: latitude, lng: longitude, altitude: 1.5 }, 1000);
      }
    } else {
      setInfoCard(null);
      alert('No data found for the provided coordinates.');
      // Reset the globe position if no data is found
      if (globeEl.current) {
        globeEl.current.pointOfView(initialGlobePosition, 1000);
      }
    }
  };

  // Handle Globe rotation and submission
  const handleSubmitCoordinates = (e) => {
    e.preventDefault();
    handleSearchCoordinates();
  };

  // Handle closing the info card
  const handleCloseInfoCard = () => {
    setInfoCard(null);
    setLatitude(''); // Reset latitude input
    setLongitude(''); // Reset longitude input
    // Reset the globe to its initial position
    if (globeEl.current) {
      globeEl.current.pointOfView(initialGlobePosition, 1000);
    }
  };

  return (
    <div className="app">
  
      <Globe globeRef={globeEl} />
      <BottomButtons />

      {/* Show All Data Button */}
      <Button className="show-all-data-btn" onClick={handleShowAllData}>
        Show All Data
      </Button>
       <Button className="show-all-data-btn" onClick={handleShowAllData}>
        Show All Data
      </Button>

      {/* Coordinates Form Wrapper */}
      <div className="coordinate-form-wrapper">
        <Form onSubmit={handleSubmitCoordinates} className="coordinate-form">
          <Form.Group controlId="latitudeInput">
            <Form.Label style={{ color: "white" }}>Latitude</Form.Label>
            <Form.Control
              type="number"
              value={latitude}
              onChange={(e) => setLatitude(parseFloat(e.target.value))}
              required
              step="0.01"
              min="-90"
              max="90"
            />
          </Form.Group>

          <Form.Group controlId="longitudeInput">
            <Form.Label style={{ color: "white" }}>Longitude</Form.Label>
            <Form.Control
              type="number"
              value={longitude}
              onChange={(e) => setLongitude(parseFloat(e.target.value))}
              required
              step="0.01"
              min="-180"
              max="180"
            />
          </Form.Group>

          <Button type="submit" variant="primary">
            Go to Coordinates
          </Button>
        </Form>
      </div>

      {/* Info Card */}
      {infoCard && (
        <div className="info-card">
          <Button className="close-info-card" onClick={handleCloseInfoCard} style={{ float: 'right' }}>
            &times; {/* Cross Button */}
          </Button>
          <h3>Migration Information</h3>
          <p><strong>Name:</strong> {infoCard.name}</p>
          <p><strong>Country Migrated From:</strong> {infoCard.fromCountry}</p>
          <p><strong>Country Migrated To:</strong> {infoCard.toCountry}</p>
          <p><strong>Reason for Migration:</strong> {infoCard.reason}</p>
          <p><strong>Distance Covered (km):</strong> {infoCard.distance}</p>
        </div>
      )}

      {/* Modal for Showing Table */}
      <Modal show={showTable} onHide={() => setShowTable(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Climate Refugees Data</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Name</th>
                <th>Original Location (Lat, Lon)</th>
                <th>Country Migrated From</th>
                <th>Country Moved To</th>
                <th>Reason for Migration</th>
                <th>Distance Covered (km)</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, index) => (
                <tr key={index}>
                  <td>{row.Name}</td>
                  <td>{row['Original Location (Lat, Lon)']}</td>
                  <td>{row['Country Migrated From']}</td>
                  <td>{row['Country Moved To']}</td>
                  <td>{row['Reason for Migration']}</td>
                  <td>{row['Distance Covered (km)']}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowTable(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      <div className="floating-container">
  <span className="floating-text">Join Now </span>
  <h2>↓</h2>
  <Button className="floating-button"></Button>
</div>


    </div>
  );
};

export default AppRoutes;

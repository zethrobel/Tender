
import React from 'react';
import { Link } from 'react-router-dom';

const Nopage = () => {
  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h2>404 - Page Not Found</h2>
      <p>The page you're looking for doesn't exist.</p>
      <Link to="/">Return to Home</Link>
    </div>
  );
}

export default Nopage;

import React from 'react';
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div>
    <Header /> 
    
    <div className="home-container">
      <div className="welcome-section">
        <h1 className="welcome-heading">
          Discover. Analyze. <span className="highlight">Win.</span>
        </h1>
        
        <p className="welcome-text">
          Welcome to <strong>TenderIntelligence</strong> - your AI-powered partner for smarter tender management. 
          Our platform transforms how you discover medical products, analyze market opportunities, 
          and build your competitive advantage.
        </p>
        
        <div className="feature-cards">
          <div className="feature-card">
            <div className="feature-icon">
              <SearchIcon fontSize="large" />
            </div>
            <h3>AI-Powered Search</h3>
            <p>
              Find relevant tenders and products in seconds with our intelligent search engine 
              that scans thousands of sources.
            </p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <LibraryBooksIcon fontSize="large" />
            </div>
            <h3>Product Library</h3>
            <p>
              Build your knowledge base with our curated product library - save, compare, 
              and track market trends.
            </p>
          </div>
        </div>
        
        <div className="cta-section">
          <Button 
            variant="contained" 
            color="success" 
            startIcon={<SearchIcon />}
            href="/search"
          >
            Explore Items
          </Button>
          <Button 
            variant="outlined" 
            color="success"
            href="/library"
          >
            Browse Product Library
          </Button>
        </div>
      </div>
      
      <div className="stats-section">
        <div className="stat-item">
          <h2>10,000+</h2>
          <p>Products Analyzed</p>
        </div>
        <div className="stat-item">
          <h2>24/7</h2>
          <p>Market Monitoring</p>
        </div>
        <div className="stat-item">
          <h2>AI-Powered</h2>
          <p>Competitive Insights</p>
        </div>
      </div>
    </div>
    <Footer />
    </div>
  );
};

export default Home;
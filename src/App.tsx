import { HashRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import MarketplacePage from './pages/MarketplacePage';
import CreatePage from './pages/CreatePage';
import TokenPage from './pages/TokenPage';
import { checkConnection } from './api';
import './index.css';

export default function App() {
  const [live, setLive] = useState<boolean | null>(null);

  // Single connection check shared across all pages
  useEffect(() => {
    checkConnection().then(setLive);
  }, []);

  return (
    <HashRouter>
      <Layout live={live}>
        <Routes>
          <Route path="/" element={<MarketplacePage live={live} setLive={setLive} />} />
          <Route path="/create" element={<CreatePage live={live} />} />
          <Route path="/token/:ticker" element={<TokenPage live={live} />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}

import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import ControlDetail from './pages/ControlDetail';
import { ShieldCheck } from 'lucide-react';
import './index.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <header>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'inline-block' }}>
            <h1>
              <ShieldCheck size={40} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '12px' }} />
              DSS Controls
            </h1>
          </Link>
          <p>Digital Service Standard Assessment Guidelines</p>
        </header>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/control/:id" element={<ControlDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

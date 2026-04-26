import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Diagnosis from './Diagnosis';
import Admin from './Admin';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Diagnosis />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}


import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Show a message for mock database
console.log('App running with mock database for browser compatibility');
console.log('Login with username: admin, password: password');
console.log('Or username: user, password: password');

createRoot(document.getElementById("root")!).render(<App />);

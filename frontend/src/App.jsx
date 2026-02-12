import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/navbar/Navbar'
import Home from './pages/home/Home'
import Words from './pages/words/Words'
import Sentences from './pages/sentences/Sentences'
import Listen from './pages/listen/Listen'
import Login from './pages/login/Login'
import Register from './pages/register/Register'
import './App.scss'

function App() {
  return (
    <Router>
      <div style={{ minHeight: '100vh' }}>
        <Navbar />
        <Routes>
          {/* <Route path="/" element={<Home />} /> */}
          <Route path="/" element={<Listen />} />
          <Route path="/words" element={<Words />} />
          <Route path="/sentences" element={<Sentences />} />
          <Route path="/listen" element={<Listen />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App

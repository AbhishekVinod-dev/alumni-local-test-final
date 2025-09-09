import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Register from "./pages/Register"
import Directory from './pages/Directory'
import Events from './pages/Events'
import Mentorship from './pages/Mentorship'
import Fundraising from './pages/Fundraising'
import Newsletter from './pages/Newsletter'
import AuthPage from './pages/Auth'
import Payments from './pages/Payments'
import Chatbot from './pages/chatbot'
import Announcements from "./pages/Announcement"







import { AuthProvider } from './context/AuthContext'

export default function App(){
  return (
    <AuthProvider>
      <Navbar />
      <main className="container py-6">
        <Routes>
           <Route path="/" element={<AuthPage />} />
           <Route path="/Home" element={<Home />} /> 
          <Route path="/directory" element={<Directory />} />
          <Route path="/events" element={<Events />} />
          <Route path="/mentorship" element={<Mentorship />} />
          <Route path="/fundraising" element={<Fundraising />} />
          <Route path="/newsletter" element={<Newsletter />} />
          <Route path="/register" element={<Register />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/chatbot" element={<Chatbot />} />

          
        </Routes>
      </main>
      <Footer />
    </AuthProvider>
  )
}

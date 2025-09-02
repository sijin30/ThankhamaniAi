import React, { useState,useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Credits from './pages/Credits'
import Chatbox from './components/Chatbox'
import Community from './pages/Community'
import { Routes, Route, useLocation } from 'react-router-dom'
import { assets } from './assets/assets'
import './assets/prism.css'
import Loading from './pages/Loading'
import { useAppContext } from './context/AppContext'
import Login from './pages/Login'

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const {pathname} =useLocation();
  const {user} =useAppContext();

  if(pathname==='/loading') return <Loading/>

  useEffect(() => {
  if (window.innerWidth < 768) { // mobile size
    setIsMenuOpen(false);
  }
}, []);

  return (
    <>
      {/* Show menu icon only when menu is closed */}
      {!isMenuOpen && (
        <img
          src={assets.menu_icon}
          className='absolute top-3 left-3 w-8 h-8 cursor-pointer md:hidden not-dark:invert'
          onClick={() => setIsMenuOpen(true)}
          alt="menu"
        />
      )}
               {user?(

                <div className='dark:bg-gradient-to-b from-[#242124] to-[#000000] dark:text-white'>
        <div className='flex w-screen h-screen'>
          <Sidebar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

          <Routes>
            <Route path='/' element={<Chatbox />} />
            <Route path='/credits' element={<Credits />} />
            <Route path='/community' element={<Community />} />
          </Routes>
        </div>
      </div>


               ):(
                <div>

                  <Login/>
                </div>

               )}
      
    </>
  )
}

export default App

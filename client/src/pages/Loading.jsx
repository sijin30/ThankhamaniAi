import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'


function Loading() {

    const navigate=useNavigate();

    useEffect(()=>{
        const timeOut=setTimeout(()=>{
                  navigate('/')

        },8000)
        return ()=> clearTimeout(timeOut);
    },[])
  return (
    <div className='bg-gradient-to-b from-[#531B81] to-[#29184B] blackdrop-opacity-60 flex items-center h-screen w-screen text-white text-2xl '>
        <div className='w-10 h-10 rounded-full border-3 border-white border-t-transparent animate-spin '>

        </div>
      
    </div>
  )
}

export default Loading

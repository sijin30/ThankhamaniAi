import { createContext, useEffect,useContext,useState } from "react";
import {useNavigate} from "react-router-dom";

import axios from 'axios'
import toast from "react-hot-toast";

axios.defaults.baseURL=import.meta.env.VITE_SERVER_URL;
const AppContext= createContext();


export const AppContextProvider=({children})=>{
      
      const  navigate=useNavigate();
      const  [user,setUser]=useState(null);
      const  [chats,setChats]=useState([]);
      const  [selectedChat,setSelectedChat]=useState(null);
      const  [theme,setTheme]=useState(localStorage.getItem('theme')||'light')
      const  [token,setToken]=useState(localStorage.getItem('token')||null)
      const  [loadingUser,setLoadingUser]=useState(true)
      

      const fetchUsers= async ()=> {
                try{
                      const {data}=  await axios.get('/api/user/data',{headers:{Authorization:token}})
                        if(data.success){
                                setUser(data.user)
                        }else{
                          toast.error(data.message)
                        }
                }catch(error){
                          toast.error(error.message) 
                }finally{
                  setLoadingUser(false)
                }
      }

      const createNewChat=async()=>{
                try {
                  if(!user) return ('Login to create new chat')
                    navigate('/')
                  await axios.get('/api/chat/create',{headers:{Authorization:token}})
                  await fetchUsersChat();
                } catch (error) {
                  toast.error(error.message)
                }
      }

      const fetchUsersChat=async()=>{
   try {

        const {data}= await axios.get('/api/chat/get',{headers:{Authorization:token}});
        if(data.success){
          setChats(data.chats)
          //if user has no chats
          if(data.chats.length===0){
            await createNewChat();
            return fetchUsersChat();
          }else{
            setSelectedChat(data.chats[0])
          }

        }else{
                 toast.error(data.message)
        }
    
   } catch (error) {
    toast.error(error.message)
   }
      }


      useEffect(()=>{
        if(token){
           fetchUsers();
        }else{
          setUser(null)
          setLoadingUser(false)
        }
        

      },[token])

      useEffect(()=>{
        if(user){
            fetchUsersChat();
        }else{
            setChats([])
            setSelectedChat(null)


        }
      },[user]);

      useEffect(()=>{
                       if(theme==='dark'){
                        document.documentElement.classList.add('dark');
                       }else{
                        document.documentElement.classList.remove('dark');
                       }
                       localStorage.setItem('theme',theme)
      },[theme]);


      const value={
        navigate,user,setUser,chats,setChats,fetchUsers,selectedChat,setSelectedChat,theme,setTheme,createNewChat,loadingUser,fetchUsersChat,token,setToken,axios
      }

    return(
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
      
}

export const useAppContext=()=>useContext(AppContext)
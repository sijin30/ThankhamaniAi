import Chat from "../models/Chat.js";


//api Controller to create new chat



export const createChat= async (req,res)=>{
   try {
    const userId = req.user._id;
    const chatData={
        userId,
        messages:[],
        name:"New Chat",
        userName:req.user.name,

    }
    await Chat.create(chatData);
    res.json({success:true,message:"Chat created"});

   } catch (error) {
    return res.json({success:false,message:error.message})
   }
}

//api controller for gettng all chats

export const getChats= async (req,res)=>{
   try {
    const userId = req.user._id;
    
    const chats=await Chat.find({userId}).sort({updatedAt:-1})
    res.json({success:true,chats});

   } catch (error) {
    return res.json({success:false,message:error.message})
   }
}

//api controller for deleting a chat

export const deleteChat = async (req, res) => {
  try {
    const userId = req.user._id; // comes from your auth middleware
    const { chatId } = req.body; // get chatId from request body

    if (!chatId) {
      return res.json({ success: false, message: "Chat ID is required" });
    }

    // FIX: use userId field (not user, not uderId)
    const deleted = await Chat.deleteOne({ _id: chatId, userId: userId });

    if (deleted.deletedCount === 0) {
      return res.json({
        success: false,
        message: "Chat not found or not authorized",
      });
    }

    res.json({ success: true, message: "Chat deleted successfully" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};


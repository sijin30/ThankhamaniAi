

import Chat from "../models/Chat.js";

//Text based ai-chat-message controller


export const textMessageController=async(req,res)=>{
    
     try{

        const userId=req.user._id;
        const {chatId,prompt}=req.body;

        const chat= await Chat.findOne({userId,_id:chatId})
        chat.messages.push({role:"user",content:prompt,timeStamp:Date.now(),
            isImage:false
        })

        const { choices } = await openai.chat.completions.create({
    model: "gemini-2.0-flash",
    messages: [
        
        {
            role: "user",
            content: content,
        },
             ],
        });
     
        const reply={...choices[0].message,timeStamp:Date.now(),isImage:false}

        res.json({success:true,reply});
        chat.messages.push(reply);
        await chat.save();

        await User.updateOne({_id:userId},{$inc:{credit :-1}})


     }catch(error){
           res.json({success:false,message:error.message});
     }
}


//Image generation message  controller


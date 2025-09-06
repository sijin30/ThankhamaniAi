import Chat from "../models/Chat.js";
import User from "../models/User.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";
import imagekit from "../config/imagekit.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// =============================
// Text based AI chat controller
// =============================
export const textMessageController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { chatId, prompt } = req.body;

    const chat = await Chat.findOne({ userId, _id: chatId });
    if (!chat) {
      return res.json({ success: false, message: "Chat not found" });
    }

    // push user message
    chat.messages.push({
      role: "user",
      content: prompt,
      timeStamp: Date.now(),
      isImage: false,
      isPublished: false,
    });

    // prepare history for Gemini (last 15 messages only)
    const history = chat.messages.slice(-15).map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    // start a chat session with history
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const chatSession = model.startChat({ history });

    // send new user message
    const result = await chatSession.sendMessage(prompt);

    const reply = {
      role: "assistant",
      content: result.response.text(),
      timeStamp: Date.now(),
      isImage: false,
      isPublished: false,
    };

    chat.messages.push(reply);
    await chat.save();

    // deduct credits
    await User.updateOne({ _id: userId }, { $inc: { credit: -1 } });

    res.json({ success: true, reply });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};


// ===================================
// Image generation message controller
// ===================================
export const imageMessageController = async (req, res) => {
  try {
    const userId = req.user._id;
    if (req.user.credit < 2) {
      return res.json({
        success: false,
        message: "You don't have enough credits to use this feature",
      });
    }

    const { prompt, chatId, isPublished } = req.body;

    const chat = await Chat.findOne({ userId, _id: chatId });
    if (!chat) {
      return res.json({ success: false, message: "Chat not found" });
    }

    // push user message
    chat.messages.push({
      role: "user",
      content: prompt,
      timeStamp: Date.now(),
      isImage: false,
      isPublished: false,
    });

    // encode prompt
    const encodedPrompt = encodeURIComponent(prompt);

    // construct imagekit ai generation url
    const generatedImageUrl = `${process.env.IMAGEKIT_URL_ENDPOINT}/ik-genimg-prompt-${encodedPrompt}/thankhamanigpt/${Date.now()}.png?tr=w-800,h-800`;

    // trigger image generation
    const aiImageResponse = await axios.get(generatedImageUrl, {
      responseType: "arraybuffer",
    });

    // convert to base64
    const base64Image = `data:image/png;base64,${Buffer.from(
      aiImageResponse.data,
      "binary"
    ).toString("base64")}`;

    // upload to ImageKit Media Library
    const uploadResponse = await imagekit.upload({
      file: base64Image,
      fileName: `${Date.now()}.png`,
      folder: "quickgpt",
    });

    const reply = {
      role: "assistant",
      content: uploadResponse.url,
      timeStamp: Date.now(),
      isImage: true,
      isPublished: isPublished || false,
    };

    chat.messages.push(reply);
    await chat.save();

    await User.updateOne({ _id: userId }, { $inc: { credit: -2 } });

    res.json({ success: true, reply });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};



import Chat from "../models/Chat.js";
import User from "../models/User.js";
import openai from "../config/openai.js";
import axios from "axios";
import imagekit from "../config/imagekit.js";

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

    // get AI response
    const { choices } = await openai.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [{ role: "user", content: prompt }],
    });

    const reply = {
      ...choices[0].message,
      timeStamp: Date.now(),
      isImage: false,
      isPublished: false,
    };

    chat.messages.push(reply);
    await chat.save();

    await User.updateOne({ _id: userId }, { $inc: { credit: -1 } });

    res.json({ success: true, reply });
  } catch (error) {
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



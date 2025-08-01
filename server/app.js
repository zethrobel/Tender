require('dotenv').config();

const axios = require("axios");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const input = require("input");
const { message } = require('telegram/client');

const app = express();

// Middleware
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001"],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB 
mongoose.set("strictQuery", false);
mongoose.connect(process.env.DATABASE)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

//Database setup

 //Company schema

 const companySchema = new mongoose.Schema({

    companyName: String,
    products: [{
            item: String,
            price: Number,
            note: String
              }]
   })

 const RFQSchema = new mongoose.Schema({
   QuoteRequest: String,
   quotation:  [{
           
             quotedItem:String,
             quotedPrice:Number,
             quotedNote:String
             }]
 })

 const openTenderSchema = new mongoose.Schema({
    BidRequest: String,
    bids: [{
          bidItem:String,
          bidPrice:Number,
          bidNote:String
          }]
 })

 //Models

const CompanyModel = mongoose.model("Company", companySchema)
const RFQModel = mongoose.model("RFQ",RFQSchema)
const OpenTenderModel = mongoose.model("OpenTender",openTenderSchema)

// Telegram setup
const API_ID = parseInt(process.env.API_ID);
const API_HASH = process.env.API_HASH;
const phone = process.env.PHONE;
const stringSession = new StringSession("");
const client = new TelegramClient(stringSession, API_ID, API_HASH, {
  connectionRetries: 5,
  useWSS: false,
  noUpdates: true
});

// Telegram login
async function login() {
  await client.start({
    phoneNumber: phone,
    password: async () => await input.text("Enter password (if any): "),
    phoneCode: async () => await input.text("Enter the code you received: "),
    onError: (err) => console.log(err),
  });
  console.log("✅ Telegram logged in");
  console.log("🔐 Save this session:", client.session.save());
}

async function startApp() {
  try {
    await login();
    app.listen(4000, () => {
      console.log("🚀 Server running on port 4000");
    });
  } catch (error) {
    console.error("Startup failed:", error);
    process.exit(1);
  }
}
startApp();

// API endpoint
app.post("/search", async (req, res) => {
  const { keyWord, inviteLink } = req.body;
  if (!inviteLink || typeof inviteLink !== "string") {
    return res.status(400).json({ error: 'Valid inviteLink required' });
  }

  try {
    const entity = await client.getEntity(inviteLink);
    if (entity.className !== 'Channel') {
      return res.status(400).json({ error: 'Invite link does not point to a channel' });
    }

    const messages = await client.getMessages(entity, { limit: 300 });

    const filteredPosts = messages
      .map(msg => ({
        text: msg.text || (msg.media?.caption || ''),
        date: msg.date,
        id: msg.id,
        views: msg.views || 0
      }))
      .filter(post => post.text.toLowerCase().includes(keyWord.toLowerCase()));

      // 🚫 Limit to first 20 posts to avoid token limit issues
           const trimmedPosts = filteredPosts.slice(0, 20);

    const analysisText = `Analyze this medical products list and extract:
                          1. Contact information (phone numbers, social media handles)
                          2. Company/organization names
                          3. Price discounts and special offers
                          4. Key product trends

                         Text: ${trimmedPosts.map(post => post.text).join('\n\n')}`;

    const analysis = await analyzeWithOpenRouter(analysisText);

    res.json({
      channelInfo: {
        id: entity.id,
        title: entity.title,
        participants: entity.participantsCount || 0
      },
      matches: trimmedPosts,
      analysis
    });

  } catch (error) {
    console.error('Telegram Error:', error);
    let errorMessage = 'Something went wrong';
    if (error.message.includes('INVITE_HASH_INVALID')) {
      errorMessage = 'Invalid or expired invite link';
    } else if (error.message.includes('CHANNEL_PRIVATE')) {
      errorMessage = 'Join the channel first to access content';
    }
    res.status(500).json({ error: errorMessage, details: error.message });
  }
});

// 🔍 AI Analysis using OpenRouter
async function analyzeWithOpenRouter(prompt) {
  const url = process.env.OPENROUTER_URL
  const headers = {
    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
    "Content-Type": "application/json"
  };

  const payload = {
    model: "mistralai/mistral-7b-instruct:free",
    messages: [
        {
            role: "system",
            content: `You are a medical product analysis assistant. Your response must ONLY be valid JSON — not markdown or natural language.

Here is the required schema:
{
  "summary": "string",
  "trends": "string",
  "contacts": ["..."],
  "companies": [
    {
      "name": "string",
      "contact_information": {
        "phone_number": "string",
        "social_media_handles": ["..."]
      },
     
      "special_offers": "string"
    }
  ],
  "discounts": ["..."]
}

Do NOT return markdown-style JSON (e.g., no \`\`\`json). Do NOT include comments. Keep it strictly valid JSON.`
        },
      { role: "user", content: prompt }
    ],
    max_tokens: 1000,
    temperature: 0.3
  };

  try {
    const response = await axios.post(url, payload, { headers });
    return parseAnalysis(response.data);
  } catch (err) {
    console.error("OpenRouter AI error:", err.response?.data || err.message);
    return { error: "AI analysis failed", details: err.message };
  }
}




function parseAnalysis(response) {
  try {
    const content = response?.choices?.[0]?.message?.content;
    console.log("🧠 AI Raw Content:", content);

    if (!content) throw new Error("Empty AI content");

    // Try to extract JSON from markdown-style or raw blocks
    const jsonRegex = /```json\s*([\s\S]*?)\s*```|{[\s\S]*}/;
    const match = content.match(jsonRegex);
    const jsonString = match?.[1] || match?.[0];

    if (!jsonString) throw new Error("No valid JSON structure found");

    const parsed = JSON.parse(jsonString);

    return {
      summary: parsed.summary || 'No summary',
      contacts: parsed.contacts || [],
      companies: parsed.companies || [],
      discounts: parsed.discounts || [],
      keyProductsTrend: parsed.trends || [],
    };
  } catch (err) {
    console.error("❌ JSON parsing error:", err.message);
    return {
      error: "Failed to parse AI output",
      details: err.message,
      raw: response?.choices?.[0]?.message?.content || "No response content"
    };
  }
}

// Routes for the frontend.



app.get("/library", async (req, res) => {
    
    try {
    const companies = await CompanyModel.find()
    res.status(200).json(companies)
    } 
    
    catch (err) {
    console.error(err)
    res.status(500).json({ error: "Server error" })
    }

})

app.get("/rfq", async (req, res) => {
    
    try {
    const rfqs = await RFQModel.find()
    res.status(200).json(rfqs)
    } 
    
    catch (err) {
    console.error(err)
    res.status(500).json({ error: "Server error" })
    }

})

app.get("/open", async (req, res) => {
    
    try {
    const openTenders = await OpenTenderModel.find()
    res.status(200).json(openTenders)
    } 
    
    catch (err) {
    console.error(err)
    res.status(500).json({ error: "Server error" })
    }

})


app.post("/rfq", async (req, res) => {
  try {
    const { QuoteRequest, quotedItem, quotedPrice, quotedNote } = req.body;

    let RFQ = await RFQModel.findOne({ QuoteRequest });
    
    if (!RFQ) {
      RFQ = new RFQModel({ 
        QuoteRequest, 
        quotation: [] 
      });
    }

    RFQ.quotation.push({ quotedItem, quotedPrice, quotedNote });
    await RFQ.save();

    res.status(201).json(RFQ);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save data" });
  }

});

app.post("/library", async (req, res) => {
  try {
    const { companyName, item, price, note } = req.body;

    let company = await CompanyModel.findOne({ companyName });
    
    if (!company) {
      company = new CompanyModel({ 
        companyName, 
        products: [] 
      });
    }

    company.products.push({ item, price, note });
    await company.save();

    res.status(201).json(company);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save data" });
  }
});

app.post("/open", async (req, res) => {
  try {
    const { BidRequest, bidItem, bidPrice, bidNote } = req.body;

    let openTender = await OpenTenderModel.findOne({ BidRequest });
    
    if (!openTender) {
      openTender = new OpenTenderModel({ 
        BidRequest, 
        bids: [] 
      });
    }

    openTender.bids.push({ bidItem, bidPrice, bidNote });
    await openTender.save();

    res.status(201).json(openTender);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save data" });
  }
});

//Search Routes

app.get("/library/search",async(req,res)=>{
  try{
    res.status(200).json({message:"Working"})
  }
  catch(error){
    console.error(error)
    res.status(500).json({error:"Server error"})
  }
})

app.post("/library/search",async(req,res)=>{
  try{
   const searchQuery= req.body
   res.status(200).json({message:"Message Recieved and we sent back", searchQuery})
  }
  catch(error){
   console.error(err);
   res.status(500).json({error:"failed to send"})
  }
})

app.delete("/library",async(req,res)=>{
  try{
      const { companyId, productId } = req.body;

    const result = await CompanyModel.updateOne(
      { _id: companyId },  //find the company
      { $pull: { products: { _id: productId } } })    // Remove matching product
    
     console.log(result)
      res.json({ message: "Product deleted successfully" });
  }

  catch(error){
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
})

app.delete("/open",async(req,res)=>{
  try{
    const {tenderId, bidId}=req.body;

    const result = await OpenTenderModel.updateOne(
      {_id:tenderId},
      {$pull: {bids:{_id:bidId}}}
    )
    console.log(result)
    res.json({message:"Bid Deleted Successfully"})
  }
  catch(error){
    console.error(error)
    res.status(500).json({error:"Server error"})
  }
})

app.delete("/rfq",async(req,res)=>{
  try{
    const {quoteId, itemId}=req.body;
    const result= await RFQModel.updateOne(
      {_id:quoteId},
      {$pull:{quotation:{_id:itemId}}}
    )
    console.log(result)
    res.json({message:"qoute deleted successfully"})
  }
  catch(error){
    console.error(error)
    res.status(500).json({error:"Server Error"})
  }
})

app.put("/library", async(req,res)=>{
  try{
    const {companyId,productId, updates}=req.body

    const result= await CompanyModel.updateOne({
      _id:companyId,"products._id":productId
    },{$set:{
      "products.$.item":updates.item,
      "products.$.price": updates.price,
      "products.$.note": updates.note
    }})
    console.log(result)
    res.json({message:"Product Updated Successfully"})
  }
  catch(error){
    console.error(error);
    res.status(500).json({error:"server error"})
  }
})

app.put("/open",async(req,res)=>{
  try{
      const {tenderId,bidId, updates}= req.body
      const result= await OpenTenderModel.updateOne({
        _id:tenderId,"bids._id":bidId
      },{
        $set:{
          "bids.$.bidItem":updates.bidItem,
          "bids.$.bidPrice":updates.bidPrice,
          "bids.$.bidNote": updates.bidNote
        }
      })
      console.log(result)
      res.json({message:"Bid Updated Successfully"})
  }
  catch(error){
    console.error(error);
    res.status(500).json({error:"Server error"})
  }
})

app.put("/rfq",async(req,res)=>{
  try{
     const {quoteId,itemId, updates}= req.body
     const result= await RFQModel.updateOne({
      _id:quoteId,"quotation._id":itemId
     },{
      $set:{
        "quotation.$.quotedItem": updates.quotedItem,
        "quotation.$.quotedPrice":updates.quotedPrice,
        "quotation.$.quotedNote": updates.quotedNote
      }
     })

     console.log(result)
     res.json({message:"quotation updated Successfully"})
  }
  catch(error){
    console.error(error)
    res.status(500).json({error:"server error"})
  }
})




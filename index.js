const express = require("express");
const app = express();
const mongoose = require('mongoose')
const axios = require("axios");
const Transaction = require("./models/Transaction");
const dotenv = require("dotenv").config();

app.use(express.json());
app.use(express.urlencoded({extended:false}));



mongoose.connect('mongodb+srv://nick:nick@cluster0.h5kvt5x.mongodb.net/?retryWrites=true&w=majority').then(()=>console.log('db connected')).catch((err)=>console.log(err.message))


app.post("/stk", access, async (req, res) => {
  const token = req.accesstoken;

  const shortcode = "8343462";
  const phone = req.body.phone.substring(1);
  const amount = req.body.amount;
  
  const passKey =
    "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";
  const url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";
  const date = new Date();
  const timestamp =
    date.getFullYear() +
    ("0" + (date.getMonth() + 1)).slice(-2) +
    ("0" + date.getDate()).slice(-2) +
    ("0" + date.getHours()).slice(-2) +
    ("0" + date.getMinutes()).slice(-2) +
    ("0" + date.getSeconds()).slice(-2);
  const password = new Buffer.from(shortcode + passKey + timestamp).toString(
    "base64"
  );
  try {
    const resp = await axios.post(
      url,
      {
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerBuyGoodsOnline",
        Amount: amount,
        PartyA: `254${phone}`,
        PartyB: shortcode,
        PhoneNumber: `254${phone}`,
        CallBackURL: "https://tame-gray-calf-cape.cyclic.app/callback",
        AccountReference: "Test",
        TransactionDesc: "Test",
      },
      { headers: { authorization: `Bearer ${token}` } }
    );
    res.send(resp.data);
  } catch (error) {
    console.log(error);
  }
});

app.post("/callback", (req, res) => {
  console.log(req.body)
  

  const callbackData = req.body;
  console.log(callbackData.Body);

  if (!callbackData.Body.stkCallback.CallbackMetadata) {
    console.log(callbackData.Body);
    return res.json("ok");
  }
  console.log(callbackData.Body.stkCallback.CallbackMetadata)

  const amount = callbackData.Body.stkCallback.CallbackMetadata.Item[0].Value
  const transactionId = callbackData.Body.stkCallback.CallbackMetadata.Item[1].Value
  const transactionDate = callbackData.Body.stkCallback.CallbackMetadata.Item[2].Value
  const phone = callbackData.Body.stkCallback.CallbackMetadata.Item[3].Value
console.log({amount,phone,transactionDate,transactionId})

  const payment = new Transaction({
    amount,
    transactionDate,
    transactionId,
    phone
  })

   payment.save().then((data)=>{
    console.log('saved successfully',{data})
   })


});

app.get("/accesstoken", access, (req, res) => {
  res.send(req.accesstoken);
});

// app.get("/register", access, async (req, res) => {
//   let url = "https://sandbox.safaricom.co.ke/mpesa/c2b/v1/registerurl";
//   let auth = "Bearer " + req.accesstoken;
//   let body = {
//     ShortCode: "600383",
//     ResponseType: "Completed",
//     ConfirmationURL: "http://192.168.0.103:5000/confirmation",
//     ValidationURL: "http://192.168.0.103:5000/validation",
//   };
//   try {
//     const resp = await axios.post(url, body, {
//       headers: { Authorization: auth },
//     });
//     console.log(resp.data);
//   } catch (error) {
//     console.log(error);
//   }
// });

async function access(req, res, next) {
  const secretKey = "yEiokDRlYavd6CLV";
  const consumerKey = "43VDkSvWHi4gqOU5J4AFrSThdrtLGM39";
  const auth = new Buffer.from(`${consumerKey}:${secretKey}`).toString(
    "base64"
  );

  try {
    const resp = await axios.get(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        headers: { Authorization: `Basic ${auth}` },
      }
    );
    req.accesstoken = resp.data.access_token;
    next();
  } catch (error) {
    console.log(error);
  }
}

app.get("/simulate", access, async (req, res) => {
  let url = "https://sandbox.safaricom.co.ke/mpesa/c2b/v1/simulate";
  let auth = "Bearer " + req.accesstoken;
  let body = {
    ShortCode: "600383",
    CommandID: "CustomerPayBillOnline",
    Amount: "100",
    Msisdn: "254708374149",
    BillRefNumber: "TestAPI",
  };
  try {
    const resp = await axios.post(url, body, {
      headers: { Authorization: auth },
    });
    console.log({ data: resp.data });
  } catch (error) {
    console.log(error);
  }
});



app.listen(5000, () => console.log("connected"));

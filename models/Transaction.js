const mongoose = require('mongoose')

const TransactionSchema = new mongoose.Schema({
    phone:{type:String,required:true},
    amount:{type:String,required:true},
    transactionId:{type:String,required:true},
    transactionDate:{type:String,required:true}



},{timestamps:true})

module.exports = mongoose.model('Transaction',TransactionSchema)
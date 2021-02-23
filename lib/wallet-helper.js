
const mongojs = require('mongojs')


const config = require("../config.json");

var Web3 = require('web3')

let web3 = new Web3(config.WEB3_PROVIDER);

const mongoInterface = require('./mongo-interface')



const Web3Helper = require('./web3-helper.js');



module.exports = {

  async init()
  {
    mongoInterface.init('coinpurse')
  },


  async registerNewWallet( uid , publicAddress ){
    let addressIsValid  = web3.utils.isAddress(publicAddress)
    if(addressIsValid){
      await mongoInterface.insertOne('wallets',{uid: uid, publicAddress: publicAddress})
      return {success:true, publicAddress: publicAddress};
    }else{
      return {success:false};
    }
   
  },
  /*
  async generateNewWallet(uid){
    var acct = web3.eth.accounts.create();

    await mongoInterface.insertOne('wallets',{uid: uid, acct: acct})
    //save to mongo

    return acct;
  },
*/



  async deleteWallet(uid){


   var result =   await mongoInterface.deleteMany('wallets',{uid: uid})
    //save to mongo

    return  result;
  },


  async findExistingWalletByUserID(uid)
  {
    //find in mongo
    //var result = await db.ethwallets.findOne({uid:uid})
    var result = await mongoInterface.findOne('wallets',{uid: uid})


      return result;
  },

  async getCurrentBalanceByUserID(uid)
  {
      var wallet = await this.findExistingWalletByUserID(uid);
      var userAddress = wallet.publicAddress;

      var tokenAddress = config.TOKEN_ADDRESS;
      var tokenDecimals = config.TOKEN_DECIMALS;

      var balanceRaw = await Web3Helper.getTokensBalance(tokenAddress,userAddress)

      var balanceFormatted = Web3Helper.rawAmountToFormatted(balanceRaw,tokenDecimals)

      console.log('got balance of ', balanceFormatted );
      return balanceFormatted;




  },

  async generateTippingURL(senderAddress, recipientAddress, tokenAddress, amountFormatted){
      let url = `https://coinpurse.cc/#/tip?from=${senderAddress}&to=${recipientAddress}&tokenaddress=${tokenAddress}&amt=${amountFormatted}`

      return url 
  }

  /*
  async sendTip(senderAddress, recipientAddress, amountFormatted)
  {

    var tokenAddress = config.TOKEN_ADDRESS;
    var tokenDecimals = config.TOKEN_DECIMALS;
 
    //temp override
    //var senderAddress= "0x7132C9f36abE62EAb74CdfDd08C154c9AE45691B";
    //var recipientAddress = "0x627328B625a3Cf29e8cF4e1159dD94Ffb5A5c7C5";
    var amount = Web3Helper.formattedAmountToRaw(amountFormatted,tokenDecimals);




    console.log('sending tip..',senderAddress, recipientAddress,amount )

    if(!web3.utils.isAddress(senderAddress))
    {
      return {success:false, errormessage: "Sender Address Invalid. "}
    }
    if(!web3.utils.isAddress(recipientAddress))
    {
      return {success:false, errormessage: "Recipient Address Invalid. "}
    }



    var result = await Web3Helper.moveTokensInTipjar(tokenAddress, senderAddress, recipientAddress, amount)


    return result;
  }*/


}

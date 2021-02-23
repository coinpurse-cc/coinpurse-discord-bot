const tokenContractABI = require('../abi/ERC20.json')
const tipjarContractABI = require('../abi/TippingJar.json')

const BigNumber = require('bignumber.js');

const contractData = require('../contracts/contractdata.js')

const config = require("../config.json");

const Tx = require('ethereumjs-tx')



var Web3 = require('web3')

var web3utils = Web3.utils;

let web3 = new Web3(config.WEB3_PROVIDER);


module.exports = {

  async init()
  {

  },



    rawAmountToFormatted(amount,decimals)
    {
      return (amount * Math.pow(10,-1 * decimals)).toFixed(decimals);
    },

    formattedAmountToRaw(amountFormatted,decimals)
    {
      var multiplier = new BigNumber( 10 ).exponentiatedBy( decimals ) ;
      return multiplier.multipliedBy(amountFormatted).toFixed() ;
    },



    async getTokensBalance( tokenAddress, ownerAddress){

      console.log('warn .. getTokensBalance not imp ')
        return 0
    },




 /* async getTipjarTokensBalance( tokenAddress, ownerAddress)
  {


    //query the tipjar contract
    var tipjarContract = await this.getTipjarContract();


    var balance = await new Promise((resolve, reject) => {
      //tipjarContract.methods.getBalance( tokenAddress , ownerAddress).call();

      var balance = tipjarContract.methods.getBalance( tokenAddress , ownerAddress).call( {}  )
      .then(function(result){
        resolve(result);
      });
    });


  //  var contractAddress = contractData.contracts.matic_network.TippingJar.address;
    //var tipjarContract = new web3.eth.Contract(tipjarContractABI, contractAddress, {});
  //  var balance = await tipjarContract.methods.getBalance(tokenAddress,ownerAddress).call();

    return balance;
  },




    async moveTokensInTipjar(tokenAddress,senderAddress, recipientAddress, amount)
    {
      console.log('sending tip..',senderAddress, recipientAddress,amount )
      var tipjarContract = await this.getTipjarContract();

      //console.log('tipjarContract is ',tipjarContract)


      var moveTokensmethod = tipjarContract.methods.moveTokens(tokenAddress,senderAddress,recipientAddress,amount);

      //var mintMethod = this.mintHelperContract.methods.proxyMint(solution_number,challenge_digest);

      //sign with pkey like token pool
      var addressFrom = config.ETH_ACCT.PUBLIC_ADDRESS ;
      var privateKey = config.ETH_ACCT.PRIVATE_KEY ;
      var addressTo = tipjarContract.options.address;

      let origin = senderAddress;
      let destination = recipientAddress;



      try{
        var txCount = await web3.eth.getTransactionCount(addressFrom);
        console.log('txCount',txCount)
       } catch(error) {  //here goes if someAsyncPromise() rejected}
        console.log('error',error);
         return error;    //this will result in a resolved promise.
       }




       //this is failing

       console.log('meep',tokenAddress,origin,destination,amount)

       var txData = web3.eth.abi.encodeFunctionCall({
               name: 'moveTokens',
               type: 'function',
               inputs: [{
                   type: 'address',
                   name: 'tokenAddress'
               },{
                   type: 'address',
                   name: 'origin'
               },{
                   type: 'address',
                   name: 'destination'
               },{
                   type: 'uint256',
                   name: 'amount'
               }]
           }, [tokenAddress,origin,destination,amount]);



      var max_gas_cost = 1704624;

      var estimatedGasCost = await moveTokensmethod.estimateGas({gas: max_gas_cost, from:addressFrom, to: addressTo });


          if( estimatedGasCost > max_gas_cost){
            console.log("Gas estimate too high!  Something went wrong ")
            return;
          }




      const txOptions = {
        nonce: web3utils.toHex(txCount),
        gas: web3utils.toHex(estimatedGasCost),
        gasPrice: web3utils.toHex(web3utils.toWei(config.GAS_PRICE_GWEI.toString(), 'gwei') ),
        value: 0,
        to: addressTo,
        from: addressFrom,
        data: txData
      }


      //how does this get returned  ?
      var txPromise =  new Promise(function (result,error) {

           this.sendSignedRawTransaction(web3,txOptions,addressFrom,privateKey, function(err, res) {
            if (err) error(err)
              result(res)
          })

        }.bind(this));



        txPromise.catch((error) => {
           return {success: false, errormessage: error.toString()}
        });


        txPromise.then((result) => {

                  return {success:true};
        });



    //    console.log('meep',result)
     
    

        return {success:true};

    },


*/


  async getTokenContract( contractAddress )
  {

  //  var tokenContract =  web3.eth.contract(tokenContractABI).at(contractAddress)
   var tokenContract = new web3.eth.Contract(tokenContractABI, contractAddress, {});

    return tokenContract;
  },

  async getTipjarContract()
  {

    var contractAddress = await this.getTipjarContractAddress()

    var tipjarContract = new web3.eth.Contract(tipjarContractABI, contractAddress, {});


//    var tokenContract =  web3.eth.contract(tipjarContractABI).at(contractAddress)

    return tipjarContract;
  },

  async getTipjarContractAddress()
  {

    var contractAddress = contractData.contracts.matic_network.TippingJar.address;


    return contractAddress;
  },



  async sendSignedRawTransaction(web3,txOptions,addressFrom,private_key,callback) {

   var privKey = this.truncate0xFromString( private_key )

   const privateKey = new Buffer( privKey, 'hex')
   const transaction = new Tx(txOptions)


   transaction.sign(privateKey)


   const serializedTx = transaction.serialize().toString('hex')

     try
     {
       var result =  web3.eth.sendSignedTransaction('0x' + serializedTx, callback)
     }catch(e)
     {
       console.log('error',e);
     }
  },



       truncate0xFromString(s)
      {
        if(s.startsWith('0x')){
          return s.substring(2);
        }
        return s;
      },




}

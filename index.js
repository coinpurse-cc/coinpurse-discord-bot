const Discord = require("discord.js");
const config = require("./config.json");


const WalletHelper = require('./lib/wallet-helper.js');




const client = new Discord.Client();

var prefix = '!';

WalletHelper.init();

client.on('message', async message   => {

  //sanitize string
  var inputContent = message.content.replace("$", " ");



  if (inputContent.startsWith(`${prefix}wallet`)) {

      if (inputContent === (`${prefix}wallet`)) {
        await message.channel.send('Coinpurse.cc Bot Commands:'
        +'\n !wallet register 0x....: Register your account by pairing it with a Public Address'
        +'\n !wallet info: Display account information'
        +'\n !wallet destroy: Delete your existing account'
        +'\n !wallet balance: View your balance'
        +'\n !tip @username #: Send a tip of 0xBTC (this generates a link)'
         )


      }

      if (inputContent.startsWith(`${prefix}wallet register`)) {
   //   if (inputContent === (`${prefix}wallet register`)) {

        var args = inputContent.trim().split(' ');
        var newPublicAddress = args[2]; 


        //find existing wallet in mongo
        var author_id = message.author.id;
        console.log(author_id)

           var existingWallet = await WalletHelper.findExistingWalletByUserID(author_id);

           if(  existingWallet  )
           {
             await message.channel.send('You already have an ETH wallet.  Your Public address is '+existingWallet.publicAddress+'.  Use the command "!wallet info" for more information.');


           }else{


             var newWalletData = await WalletHelper.registerNewWallet(author_id, newPublicAddress);

             if(newWalletData.success == true){
              await message.channel.send('Your wallet has been registered.  Your Public address is '+newWalletData.publicAddress+'.');

             }else{
              await message.channel.send('Something went wrong! '+newPublicAddress+' is not a valid public address.');
             }

            
           //  try{
         //      await client.users.cache.get(author_id).send('Your wallet has been registered.  Your Public address is '+newWalletData.address+'.')
              

          //   }catch(e){
          //     await message.channel.send('Could not DM you any wallet information! Edit your Privacy settings for this server to allow DMs.');

           //  }
           }


        //    message.author.dm_channel.send('A new wallet has been generated.  Your Public address is '+newWalletData.address+'.  The Private key for this account is '+  newWalletData.address );

      }


      if (inputContent === (`${prefix}wallet info`)) {


          var author_id = message.author.id;

           var existingWallet = await WalletHelper.findExistingWalletByUserID(author_id);


           if(  existingWallet  )
           {
            await message.channel.send(' Your Public address is '+existingWallet.publicAddress+'.');
               

           }else{
             await message.channel.send('You do not have a paired Public Address.  Use the command "!wallet register 0x..." to pair one.');


           }


       
      }


        if (inputContent === (`${prefix}wallet balance`)) {

          var author_id = message.author.id;

           var existingWallet = await WalletHelper.findExistingWalletByUserID(author_id);
 
           if(  existingWallet  )
           {

            var currentBalanceFormatted = await WalletHelper.getCurrentBalanceByUserID(author_id);


             await message.channel.send('Your balance is '+ currentBalanceFormatted +' 0xBTC on the xDAI Network.  (https://coinpurse.cc).');


          }else{
             await message.channel.send('You do not have a paired Public Address.  Use the command "!wallet register 0x..." to pair one.');


          }



        }




      if (inputContent === (`${prefix}wallet destroy`)) {
        var author_id = message.author.id;

          var existingWallet = await WalletHelper.findExistingWalletByUserID(author_id);

         if(  existingWallet  )
         {
 
            await message.channel.send(' Your address  '+existingWallet.publicAddress+' has been unpaired from this bot.'); 
          
            var result = await WalletHelper.deleteWallet(author_id)
        


         }else{

          await message.channel.send('You do not have a paired Public Address.  Use the command "!wallet register 0x..." to pair one.');

         }
      }



  }


  if (inputContent.startsWith(`${prefix}tip`)) {

    var author_id = message.author.id;


    var args = inputContent.trim().split(' ');
    var recipientUsername = args[1];
    var amountFormatted = args[2];

    let tokenAddress = config.TOKEN_ADDRESS

    console.log("got tip command ", recipientUsername, amountFormatted )

    const recipientUser = message.mentions.users.first();
 

    var senderWallet = await WalletHelper.findExistingWalletByUserID(author_id);
    if(!senderWallet)
    {
      await message.channel.send("Error: You do not have an associated wallet. Use '!wallet pair 0x...' to create one.");
      return;
    }
    var senderAddress = senderWallet.publicAddress;

    var currentSenderBalance = await WalletHelper.getCurrentBalanceByUserID(author_id);
    if(parseFloat(currentSenderBalance) < parseFloat(amountFormatted) )
    {
      await message.channel.send("Error: Insufficient balance.");
      return;
    }


    var recipientWallet = await WalletHelper.findExistingWalletByUserID(recipientUser.id);

    if(!recipientWallet)
    {
      await message.channel.send("Error: The recipient "+recipientUser.username+" does not have an associated wallet. Use '!wallet new' to create one.");
      return;
    }

    var recipientAddress = recipientWallet.publicAddress;


    //Generate a URL here and send it to the user !! 

    // https://coinpurse.cc/#/tip?to=0x111111&amt=11231

    var tippingURL = await WalletHelper.generateTippingURL(senderAddress, recipientAddress, tokenAddress, amountFormatted );

    await message.channel.send('Click this link to tip '+ amountFormatted + ' 0xBTC' + ' to ' + recipientUsername +'. ' );
    await message.channel.send(tippingURL);
   /* var result = await WalletHelper.sendTip(senderAddress, recipientAddress, amountFormatted );

    if(result.success )
    {
      await message.channel.send('A tip of '+ amountFormatted + ' 0xBTC' + ' has been sent to ' + recipientUsername +'. (https://tipjar.0xbtc.io)');
    }else{
      await message.channel.send(result.errormessage);
    }*/



  }

});




client.login(config.BOT_TOKEN);

console.log('eth wallet bot running!')

/*
!accounts

!info _____   -> DMs the user
*/

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
        await message.channel.send('Ethereum Burner Wallet Commands:'
        +'\n !wallet new: Generate a new account'
        +'\n !wallet info: Display account information'
        +'\n !wallet destroy: Delete your existing account'
        +'\n !wallet balance: View your balance'
        +'\n !tip @username #: Send a tip of 0xBTC'
         )


      }

      if (inputContent === (`${prefix}wallet new`)) {


        //find existing wallet in mongo
        var author_id = message.author.id;
        console.log(author_id)

           var existingWallet = await WalletHelper.findExistingWalletByUserID(author_id);

           if(  existingWallet  )
           {
             await message.channel.send('You already have an ETH wallet.  Your Public address is '+existingWallet.acct.address+'.  Use the command "!wallet info" for more information.');


           }else{


             var newWalletData = await WalletHelper.generateNewWallet(author_id);


             try{
               await client.users.cache.get(author_id).send('A new ETH wallet has been generated.  Your Public address is '+newWalletData.address+'.  The Private key for this account is '+  newWalletData.privateKey );
               await message.channel.send('A new ETH wallet has been generated.  Your Public address is '+newWalletData.address+'.  The Private key has been DMed to you.');

             }catch(e){
               await message.channel.send('Could not DM you any wallet information! Edit your Privacy settings for this server to allow DMs.');

             }
           }


        //    message.author.dm_channel.send('A new wallet has been generated.  Your Public address is '+newWalletData.address+'.  The Private key for this account is '+  newWalletData.address );

      }


      if (inputContent === (`${prefix}wallet info`)) {


          var author_id = message.author.id;

           var existingWallet = await WalletHelper.findExistingWalletByUserID(author_id);


           if(  existingWallet  )
           {

               try{
                 await client.users.cache.get(author_id).send('Your Public address is '+existingWallet.acct.address+'.  The Private key for this account is '+  existingWallet.acct.privateKey );
                 await message.channel.send(' Your Public address is '+existingWallet.acct.address+'.  The Private key has been DMed to you.');
               }catch(e){
                 await message.channel.send('Could not DM you any wallet information! Edit your Privacy settings for this server to allow DMs.');

               }


           }else{
             await message.channel.send('You do not have a wallet.  Use the command "!wallet new" to generate one.');


           }


        //    message.author.dm_channel.send('A new wallet has been generated.  Your Public address is '+newWalletData.address+'.  The Private key for this account is '+  newWalletData.address );

      }


        if (inputContent === (`${prefix}wallet balance`)) {

          var author_id = message.author.id;

           var existingWallet = await WalletHelper.findExistingWalletByUserID(author_id);



           if(  existingWallet  )
           {

            var currentBalanceFormatted = await WalletHelper.getCurrentBalanceByUserID(author_id);


             await message.channel.send('Your balance is '+ currentBalanceFormatted +' 0xBTC on the Matic Network within the Tipjar contract (https://tipjar.0xbtc.io).');


          }else{
            await message.channel.send('You do not have a wallet.  Use the command "!wallet new" to generate one.');


          }



        }




      if (inputContent === (`${prefix}wallet destroy`)) {
        var author_id = message.author.id;

          var existingWallet = await WalletHelper.findExistingWalletByUserID(author_id);

         if(  existingWallet  )
         {

             var couldDM = false;
              try{
                await client.users.cache.get(author_id).send('The following wallet was just deleted forever: '+existingWallet.acct.address+'.  The Private key for this account was '+  existingWallet.acct.privateKey );
                await message.channel.send(' Your wallet  '+existingWallet.acct.address+' has been permanently deleted from this bot.  The Private key has been DMed to you for your records.');

                couldDM=true;

              }catch(e){
                await message.channel.send('Could not DM you any wallet information! Edit your Privacy settings for this server to allow DMs.');

              }

              if(couldDM)
              {
                var result = await WalletHelper.deleteWallet(author_id)
              }


         }else{

           await message.channel.send('You do not have a wallet.  Use the command "!wallet new" to generate one.');

         }
      }



  }


  if (inputContent.startsWith(`${prefix}tip`)) {

    var author_id = message.author.id;


    var args = inputContent.trim().split(' ');
    var recipientUsername = args[1];
    var amountFormatted = args[2];

    console.log("got tip command ", recipientUsername, amountFormatted )

    const recipientUser = message.mentions.users.first();

  //  var recipientID = await client.users.cache.find(u => u.tag === recipientUsername).id


    var senderWallet = await WalletHelper.findExistingWalletByUserID(author_id);
    if(!senderWallet)
    {
      await message.channel.send("Error: You do not have an associated wallet. Use '!wallet new' to create one.");
      return;
    }
    var senderAddress = senderWallet.acct.address;

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

    var recipientAddress = recipientWallet.acct.address;

    var result = await WalletHelper.sendTip(senderAddress, recipientAddress, amountFormatted );

    if(result.success )
    {
      await message.channel.send('A tip of '+ amountFormatted + ' 0xBTC' + ' has been sent to ' + recipientUsername +'. (https://tipjar.0xbtc.io)');
    }else{
      await message.channel.send(result.errormessage);
    }



  }

});




client.login(config.BOT_TOKEN);

console.log('eth wallet bot running!')

/*
!accounts

!info _____   -> DMs the user
*/

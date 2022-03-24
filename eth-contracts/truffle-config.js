


 const HDWalletProvider = require('truffle-hdwallet-provider');
 const infuraKey = "<infurakey>";

 module.exports = {
   
 
   networks: {
     
      development: {
       host: "127.0.0.1",     // Localhost (default: none)
       port: 8545,            // Standard Ethereum port (default: none)
       network_id: "*"      // Any network (default: none)
      },
      rinkeby: {
       provider: function() {
 
           return new HDWalletProvider("<metamask mnemonic>","<rinkebyEndpoint>")
         },
 
         network_id: "4",
         from:"<metamask address>"
 
       },
 
   },
 
  // Set default mocha options here, use special reporters etc.
  mocha: {
    // timeout: 100000
  },

  // Configure your compilers
    compilers: {
      solc: {
       
        version: "^0.5.0",    
      docker: false,        
      settings: {          
        optimizer: {
          enabled: true,
         runs: 200
        },
        evmVersion: "byzantium",
       evmVersion: "istanbul"
      },
      }
    }
  }
App = {

    web3Provider: null,
    contracts: {},
    metamaskAccountID: "0x0000000000000000000000000000000000000000",
    tokenAddressOwner: "0x0000000000000000000000000000000000000000",
    tokenId: 0,

    init: async function () {
        return await App.initWeb3()
    },

    initWeb3: async function () {
        /// Find or Inject Web3 Provider
        /// Modern dapp browsers...
        if (window.ethereum) {
            App.web3Provider = window.ethereum
            try {
                // Request account access
                await window.ethereum.enable()
            } catch (error) {
                // User denied account access...
                console.error("User denied account access")
            }
        }
        // Legacy dapp browsers...
        else if (window.web3) {
            App.web3Provider = window.web3.currentProvider
        }
        // If no injected web3 instance is detected, fall back to Ganache
        else {
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545')
        }

        console.log('App.web3Provider',App.web3Provider)
        App.getMetaskAccountID()
        return App.initSolSquareVerifier()
    },

    getMetaskAccountID: function () {
        web3 = new Web3(App.web3Provider);

        // Retrieving accounts
        web3.eth.getAccounts(function(err, res) {
            if (err) {
                console.log('Error:',err);
                return;
            }
            console.log('getMetaskID:',res);
            App.metamaskAccountID = res[0];

        })
    },

    initSolSquareVerifier: async function(){
         /// Source the truffle compiled smart contracts
        var jsonContract ='../../eth-contracts/build/contracts/SolnSquareVerifier.json'

        /// JSONfy the smart contracts
        $.getJSON(jsonContract, (data) => { 
            var ContractArtifact = data
            App.contracts.SolSquareVerifierContract = TruffleContract(ContractArtifact)
            App.contracts.SolSquareVerifierContract.setProvider(App.web3Provider)
            //App.fetchEvents();
        })
            
        return App.bindEvents()
    },

    bindEvents: function() {
        $(document).on('click', App.handleButtonClick)
    },

    handleButtonClick: async (event) => {
        App.getMetaskAccountID()
        
        var processId = parseInt($(event.target).data('id'))
        console.log('processId',processId)
        
        switch (processId) {
            case 0:
                return await App.mintToken(event)
        }
    },

    mintToken: async(event) => {
        event.preventDefault()

        tokenAddressOwner = $("#tokenOwnerAddress").val()
        tokenId = $("#tokenId").val()
        const proofInput = $("#proofJSON").val()
        const proofFromZokrats = JSON.parse(proofInput)

        console.log(proofFromZokrats)

        const  {
            proof : {a,b,c},
            inputs : inputs
        } = proofFromZokrats
        
        App.contracts.SolSquareVerifierContract.deployed().then(function(instance) {
            return instance.mintNewToken(tokenAddressOwner,  tokenId,  a,  b,  c, inputs, {from: App.metamaskAccountID, gas: 4500000 })
        }).then(function(result) {
            console.log(`Mint tokenid ${tokenId} to ${tokenAddressOwner}`);
            App.fetchTokenDetails(event)
           
        }).catch(function(err) {
            console.log(err.message)
        })
    },

    fetchTokenDetails: async(event) =>{
        event.preventDefault()

        try{
            const instance = await App.contracts.SolSquareVerifierContract.deployed()
            let totalSupply = (await instance.totalSupply.call()).toNumber()
            console.log(`Token Owner address : ${tokenAddressOwner}`)
            let tokenBalance = (await instance.balanceOf.call(tokenAddressOwner)).toString()
            let tokenURI = (await instance.tokenURI.call(tokenId)).toString()

            console.log(`Total Supply : ${totalSupply}`)
            console.log(`Token URI : ${tokenURI}`)
            console.log(`Token Balnce : ${tokenBalance}`)
            console.log(`Token Owner : ${tokenAddressOwner}`)

        } catch(err){
            console.log(err.message)
        }

    }


}

$(function () {
    $(window).load(function () {
        App.init()
    })
})
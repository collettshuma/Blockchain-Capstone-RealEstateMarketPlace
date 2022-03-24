const SquareVerifier = artifacts.require('Verifier')
const SolnSquareVerifier = artifacts.require('SolnSquareVerifier')
const truffleAssert = require('truffle-assertions')


contract('TestSolnSquareVerifier', accounts => {
    
    const owner = accounts[0]
    const account_two = accounts[1]
    const account_three = accounts[2]
    const name = "VukaToken"
    const symbol = "VKT"
    let proofFromZokrats = require("../../zokrates/code/square/proof.json")
    let tokenId = 1

    beforeEach(async function() {

        this.verifier = await SquareVerifier.new({from: owner})
        this.contract = await SolnSquareVerifier.new(this.verifier.address, name, symbol,  {from: owner})

    })

    // Test if a new solution can be added for contract - SolnSquareVerifier
    it('Should add a new solution', async function (){

        const  {
            proof : {a,b,c},
            inputs : inputs
        } = proofFromZokrats

        // Generate a solution key
        let key = await this.contract.generateKey.call(a,  b,  c, inputs)
        let tx = await this.contract.addSolution(tokenId, owner, key)
        assert.equal(tx.logs[0].event, "SolutionAdded", 'Invalid event emitted')

    })

    it('Should not add a solution already used', async function (){

        const  {
            proof : {a,b,c},
            inputs : inputs
        } = proofFromZokrats

        // Generate a solution key
        let key = await this.contract.generateKey.call(a,  b,  c, inputs)
        await this.contract.addSolution(tokenId, owner, key)

        // add the same solution
        await truffleAssert.reverts(this.contract.addSolution(tokenId, owner, key), 'Solution has been used before')

    })

    // Test if an ERC721 token can be minted for contract - SolnSquareVerifier
    it('Should mint a new ERC721 token', async function (){

        const  {
            proof : {a,b,c},
            inputs : inputs
        } = proofFromZokrats

        let totalSupplyBefore = (await this.contract.totalSupply.call()).toNumber()
        await this.contract.mintNewToken(account_two, tokenId, a, b, c, inputs, {from:owner})
        let totalSupplyAfter = (await this.contract.totalSupply.call()).toNumber()
        let tokenBalance = (await this.contract.balanceOf.call(account_two)).toNumber()
        let tokenURI = await this.contract.tokenURI.call(tokenId)

        assert.equal(totalSupplyAfter, totalSupplyBefore + 1, 'Total supply is not correct')
        assert.equal(tokenBalance,  1, 'Balnce is not correct')
        assert.equal(tokenURI, "https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/1", "Token URI is not valid")
    })

    it('Should not mint a new ERC721 token with a wrong proof', async function (){

        let  {
            proof : {a,b,c},
            inputs : inputs
        } = proofFromZokrats

        // Change the inputs to false the verification
        inputs = ["0x1000000000000000000000000000000000000000000000000000000000000009", "0x1000000000000000000000000000000000000000000000000000000000000001"]
        await truffleAssert.reverts(this.contract.mintNewToken(account_two, tokenId, a, b, c, inputs, {from:owner}), 'Solution is not correct')
            
    })
})
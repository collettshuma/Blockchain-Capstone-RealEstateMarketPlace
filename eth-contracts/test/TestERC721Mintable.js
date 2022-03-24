var ERC721MintableComplete = artifacts.require('VukaToken')
const truffleAssert = require('truffle-assertions')

contract('TestERC721Mintable', accounts => {

    const account_one = accounts[0]
    const account_two = accounts[1]
    const name = "VukaToken"
    const symbol = "VKT"

    describe('match erc721 spec', function () {
        beforeEach(async function () { 
            this.contract = await ERC721MintableComplete.new(name, symbol, {from: account_one})
            /*
            let tmp_name = await this.contract.name.call()
            let tmp_symbol = await this.contract.symbol.call()
            let uri = await this.contract.baseTokenURI.call()
            console.log('name : '+ tmp_name)
            console.log('symbol : '+ tmp_symbol)
            console.log('URI : '+ uri)*/

            // TODO: mint multiple tokens
            for(let i = 1; i < 11; i++){
                await this.contract.mint(account_one, i, {from: account_one})
            }

        })

        it('should return total supply', async function () { 
           let totalSupply = await this.contract.totalSupply.call()
            assert.equal(totalSupply, 10, "Invalid total supply")
            
        })

        it('should get token balance', async function () { 
            let tokenBalance = await this.contract.balanceOf.call(account_one)
            assert.equal(tokenBalance, 10, "Token balance is not valid")
        })

        // token uri should be complete i.e: https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/1
        it('should return token uri', async function () { 
            let tokenURI = await this.contract.tokenURI.call(5)
            assert.equal(tokenURI, "https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/5", "Token URI is not valid")
            
        })

        it('should transfer token from one owner to another', async function () { 
            let tx = await this.contract.transferFrom(account_one, account_two, 6) 
            let tokenOwner = await this.contract.ownerOf.call(6)
            assert.equal(tokenOwner, account_two, 'Invalid new Owner')
            assert.equal(tx.logs[0].event, "Transfer", 'Invalid event emitted')
        })
    })

    describe('have ownership properties', function () {
        beforeEach(async function () { 
            this.contract = await ERC721MintableComplete.new(name, symbol, {from: account_one})
        })

        it('should fail when minting when address is not contract owner', async function () { 
            await truffleAssert.reverts(this.contract.mint(account_two, 11, {from: account_two}), "Caller is not contract owner")
        })

        it('should return contract owner', async function () { 
            let owner = await this.contract.owner.call()
            assert.equal(owner, account_one, 'Invalid contract owner')
            
        })

        it('should fail when transfering contract owner if the caller is not the current owner', async function () { 
            await truffleAssert.reverts(this.contract.transferOwnership(account_two, {from: account_two}), "Caller is not contract owner")
        })

        it('should allow transfering contract owner if the caller is the current owner', async function () { 
            let tx = await this.contract.transferOwnership(account_two, {from: account_one})
            let owner = await this.contract.owner.call()
            assert.equal(owner, account_two, 'Invalid contract owner')
            assert.equal(tx.logs[0].event, "OwnershipTransfered", 'Invalid event emitted')
        })

    })

    describe('have Pausable properties', function () {
        beforeEach(async function () { 
            this.contract = await ERC721MintableComplete.new(name, symbol, {from: account_one})
        })

        it('should fail when trying to pause contract if the caller  is not contract owner', async function () { 
            await truffleAssert.reverts(this.contract.pause({from: account_two}), "Caller is not contract owner")
        })

        it('should fail when trying to unpause contract if the caller  is not contract owner', async function () { 
            //pause the contratc by the owner
            await this.contract.pause({from:account_one})
            await truffleAssert.reverts(this.contract.unpause({from: account_two}), "Caller is not contract owner")
        })

        it('should allow contract owner to unpause contract if the contract paused', async function () { 
            //pause the contratc by the owner
            await this.contract.pause({from:account_one})
            let tx = await this.contract.unpause({from:account_one})
            assert.equal(tx.logs[0].event, "Unpaused", 'Invalid event emitted')
        })

        it('should not allow contract owner to unpause contract if the contract unpaused', async function () { 
            // contract is paused in the previous 
            await truffleAssert.reverts(this.contract.unpause({from: account_one}), "contract is not paused")
        })

        it('should allow contract owner to pause contract if the contract unpaused', async function () { 
            // contract is unpaused in the previous 
            let tx = await this.contract.pause({from:account_one})
            assert.equal(tx.logs[0].event, "Paused", 'Invalid event emitted')
        })

        it('should not allow contract owner to pause contract if the contract paused', async function () { 
            // contract is paused in the previous 
            await this.contract.pause({from:account_one})
            await truffleAssert.reverts(this.contract.pause({from: account_one}), "contract is paused")
        })

        it('should not allow to mint a token if the contract paused', async function () { 
            // contract is paused in the previous 
            await this.contract.pause({from:account_one})
            await truffleAssert.reverts(this.contract.mint(account_one, 20, {from: account_one}), "contract is paused")
        })
    })

})
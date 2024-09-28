// src/LoyaltyProgram.js
import React, { useState } from 'react'
import Web3 from 'web3'
import './loyalty.css' // Import CSS file
import {
  createPublicClient,
  createWalletClient,
  custom,
  formatEther,
  http,
} from 'viem'

// Replace with your deployed token contract address
const TOKEN_CONTRACT_ADDRESS = '0xYourTokenContractAddress' // Replace with your deployed token contract address

const LoyaltyProgram = () => {
  const [amount, setAmount] = useState('')
  const [recipientAddress, setRecipientAddress] = useState('')
  const [transactionHash, setTransactionHash] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [account, setAccount] = useState(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // Initialize Web3
  const web3 = new Web3(window.ethereum)

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        // Request account access
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        })
        setAccount(accounts[0])
        setErrorMessage('')
      } catch (error) {
        console.error('Connection failed:', error)
        setErrorMessage('Connection failed: ' + error.message)
      }
    } else {
      setErrorMessage('Please install MetaMask!')
    }
  }

  const disconnectWallet = () => {
    setAccount(null)
    setIsDropdownOpen(false)
  }

  const handleReward = async () => {
    try {
      // Convert amount to Wei (assuming 18 decimals)
      const amountInWei = web3.utils.toWei(amount, 'ether')

      // Send transaction to mint tokens for user
      const tx = {
        from: account,
        to: TOKEN_CONTRACT_ADDRESS,
        value: amountInWei,
        gas: 2000000,
        data: web3.eth.abi.encodeFunctionCall(
          {
            name: 'mint',
            type: 'function',
            inputs: [
              {
                type: 'address',
                name: 'to',
              },
              {
                type: 'uint256',
                name: 'amount',
              },
            ],
          },
          [recipientAddress, amountInWei]
        ),
      }

      const receipt = await web3.eth.sendTransaction(tx)
      setTransactionHash(receipt.transactionHash)
      setErrorMessage('')
    } catch (error) {
      console.error('Transaction failed:', error)
      setErrorMessage('Transaction failed: ' + error.message)
    }
  }

  return (
    <div className="loyalty-program-container">
      <h1>Loyalty Program</h1>

      <div className="connect-container">
        <button
          className="connect-button"
          onClick={
            account ? () => setIsDropdownOpen(!isDropdownOpen) : connectWallet
          }
        >
          {account
            ? `Connected: ${account.slice(0, 6)}...${account.slice(-4)}`
            : 'Connect Wallet'}
        </button>

        {isDropdownOpen && account && (
          <div className="dropdown">
            <button className="dropdown-item" onClick={disconnectWallet}>
              Disconnect
            </button>
          </div>
        )}
      </div>

      <div className="form-group">
        <label>Recipient Address:</label>
        <input
          type="text"
          value={recipientAddress}
          onChange={(e) => setRecipientAddress(e.target.value)}
          placeholder="Enter recipient address"
          className="amount-input"
        />
      </div>
      <div className="form-group">
        <label>Reward Amount (in ETH):</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter reward amount"
          className="amount-input"
        />
      </div>
      <button className="reward-button" onClick={handleReward}>
        Reward Participant.
      </button>
      {transactionHash && (
        <p className="success-message">Transaction Hash: {transactionHash}</p>
      )}
      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </div>
  )
}

export default LoyaltyProgram

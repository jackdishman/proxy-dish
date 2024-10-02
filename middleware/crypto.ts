import { NextResponse } from 'next/server';
import { encodeFunctionData } from 'viem';
import { base } from "viem/chains";

export const getContractABI = async () => {
  const CrowdfundArtifact = await import('../abi/SocialDexDeployer.json');
  return CrowdfundArtifact;
}


export async function prepareTransaction() {

  const CONTRACT_ADDRESS = "0x250c9FB2b411B48273f69879007803790A6AeA47";

      // Load the ABI for the contract
      const contractABI = await getContractABI();
    
      // Encode the calldata for the contributeETH function (no parameters)
      const calldata = encodeFunctionData({
        abi: contractABI,
        functionName: "deployToken",
        args: [], // `TODO: fill in arguments
      });
  
      // Prepare the transaction data
      const transactionData = {
        method: "eth_sendTransaction",
        chainId: "eip155:8453", // base chain id
        params: {
          abi: contractABI, // Contract ABI to inform the client about function encoding
          to: CONTRACT_ADDRESS, // Contract address to send the transaction
          data: calldata, // Encoded function data
        },
      };
      console.log(transactionData);
  
      return new NextResponse(JSON.stringify(transactionData), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
}
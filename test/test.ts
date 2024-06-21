import { expect } from "chai";

import { Options } from "@layerzerolabs/lz-v2-utilities";
import { EndpointId } from "@layerzerolabs/lz-definitions";
import hre, { ethers } from "hardhat";

// Test interacts with already deployed contracts
// to assert a send operation is possible
async function main() {
  const eidB = EndpointId.AURORA_V2_MAINNET;

  const owner = (await hre.ethers.getSigners())[0];
  const oftAdapterArtifact = await hre.artifacts.readArtifact(
    "MyOFTAdapter"
  );
  const myOFTA = new ethers.Contract(
    "0xB58A9C16a79b630AD6BC44Ee68aA8D05CCF4BD15",
    oftAdapterArtifact.abi,
    owner
  );


  // Defining the amount of tokens to send and constructing the parameters for the send operation
  const tokensToSend = ethers.utils.parseEther("1");

  // Defining extra message execution options for the send operation
  const options = Options.newOptions()
    .addExecutorLzReceiveOption(200000, 0)
    .toHex()
    .toString();

  const sendParam = [
    eidB,
    ethers.utils.zeroPad(owner.address, 32), //my metamask address
    tokensToSend,
    tokensToSend,
    options,
    "0x",
    "0x",
  ];

  // Fetching the native fee for the token send operation
  const [nativeFee] = await myOFTA.quoteSend(sendParam, false);
  console.log("nativeFee", ethers.utils.formatEther(nativeFee));


  // Executing the send operation from myOFTA contract
  const tx = await myOFTA.send(sendParam, [nativeFee, 0], owner.address, {
    value: nativeFee,
  });
  console.log(tx);

  // console,log(finalBalanceA, finalBalanceB) ;
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });

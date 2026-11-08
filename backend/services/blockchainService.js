
const { ethers } = require("ethers");
const path = require("path");

const artifactPath = path.join(
  __dirname,
  "../../blockchain/artifacts/contracts/CertificateRegistry.sol/CertificateRegistry.json"
);

const artifact = require(artifactPath);

const provider = new ethers.JsonRpcProvider(
  process.env.BLOCKCHAIN_RPC_URL
);

const wallet = new ethers.Wallet(
  process.env.BLOCKCHAIN_PRIVATE_KEY,
  provider
);

const contract = new ethers.Contract(
  process.env.BLOCKCHAIN_CONTRACT_ADDRESS,
  artifact.abi,
  wallet
);

function formatDocumentHash(documentHash) {
  if (!/^[a-fA-F0-9]{64}$/.test(documentHash)) {
    throw new Error("Invalid SHA-256 document hash");
  }

  return `0x${documentHash}`;
}

async function registerCertificate(certificateId, documentHash) {
  const hash = formatDocumentHash(documentHash);

  const transaction = await contract.registerCertificate(
    certificateId,
    hash
  );

  const receipt = await transaction.wait();

  return {
    transactionHash: receipt.hash || transaction.hash,
    blockNumber: receipt.blockNumber,
    walletAddress: wallet.address,
    contractAddress: await contract.getAddress(),
  };
}

async function verifyCertificate(certificateId, documentHash) {
  const hash = formatDocumentHash(documentHash);

  const result = await contract.verifyCertificate(
    certificateId,
    hash
  );

  return {
    exists: result.exists,
    authentic: result.authentic,
    institution: result.institution,
    issuedAt: Number(result.issuedAt),
    revoked: result.revoked,
  };
}

async function revokeCertificate(certificateId) {
  const transaction = await contract.revokeCertificate(certificateId);
  const receipt = await transaction.wait();

  return {
    transactionHash: receipt.hash || transaction.hash,
    blockNumber: receipt.blockNumber,
    walletAddress: wallet.address,
    contractAddress: await contract.getAddress(),
  };
}

module.exports = {
  registerCertificate,
  verifyCertificate,
  revokeCertificate,
};

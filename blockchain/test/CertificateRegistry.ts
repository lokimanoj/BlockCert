
import { expect } from "chai";
import { network } from "hardhat";

describe("CertificateRegistry", async function () {
  const { ethers } = await network.connect();

  let registry: any;
  let institution: any;
  let anotherInstitution: any;

  const certificateId = "BC2026001";
  const documentHash = ethers.id("BlockCert genuine certificate");

  beforeEach(async function () {
    [institution, anotherInstitution] = await ethers.getSigners();

    registry = await ethers.deployContract("CertificateRegistry", {
      from: institution,
    });

    await registry.waitForDeployment();
  });

  it("1. Should register a certificate successfully", async function () {
    await registry
      .connect(institution)
      .registerCertificate(certificateId, documentHash);

    const result = await registry.verifyCertificate(
      certificateId,
      documentHash
    );

    expect(result.exists).to.equal(true);
    expect(result.authentic).to.equal(true);
    expect(result.institution).to.equal(institution.address);
    expect(result.issuedAt).to.be.greaterThan(0);
    expect(result.revoked).to.equal(false);
  });

  it("2. Should verify a genuine certificate and reject an incorrect hash", async function () {
    await registry
      .connect(institution)
      .registerCertificate(certificateId, documentHash);

    const genuine = await registry.verifyCertificate(
      certificateId,
      documentHash
    );

    const incorrect = await registry.verifyCertificate(
      certificateId,
      ethers.id("Modified certificate")
    );

    expect(genuine.authentic).to.equal(true);
    expect(incorrect.exists).to.equal(true);
    expect(incorrect.authentic).to.equal(false);
  });

  it("3. Should prevent duplicate certificate IDs", async function () {
    await registry
      .connect(institution)
      .registerCertificate(certificateId, documentHash);

    let failed = false;

    try {
      await registry
        .connect(institution)
        .registerCertificate(certificateId, ethers.id("Another document"));
    } catch {
      failed = true;
    }

    expect(failed).to.equal(true);
  });

  it("4. Should prevent duplicate document hashes", async function () {
    await registry
      .connect(institution)
      .registerCertificate(certificateId, documentHash);

    let failed = false;

    try {
      await registry
        .connect(institution)
        .registerCertificate("BC2026002", documentHash);
    } catch {
      failed = true;
    }

    expect(failed).to.equal(true);
  });

  it("5. Should allow only the issuing institution to revoke", async function () {
    await registry
      .connect(institution)
      .registerCertificate(certificateId, documentHash);

    let unauthorizedFailed = false;

    try {
      await registry
        .connect(anotherInstitution)
        .revokeCertificate(certificateId);
    } catch {
      unauthorizedFailed = true;
    }

    expect(unauthorizedFailed).to.equal(true);

    await registry
      .connect(institution)
      .revokeCertificate(certificateId);

    const result = await registry.verifyCertificate(
      certificateId,
      documentHash
    );

    expect(result.exists).to.equal(true);
    expect(result.authentic).to.equal(false);
    expect(result.revoked).to.equal(true);
  });

  it("6. Should reject a second revocation", async function () {
    await registry
      .connect(institution)
      .registerCertificate(certificateId, documentHash);

    await registry
      .connect(institution)
      .revokeCertificate(certificateId);

    let failed = false;

    try {
      await registry
        .connect(institution)
        .revokeCertificate(certificateId);
    } catch {
      failed = true;
    }

    expect(failed).to.equal(true);
  });

  it("7. Should retrieve institution and issue timestamp", async function () {
    await registry
      .connect(institution)
      .registerCertificate(certificateId, documentHash);

    const result = await registry.getCertificate(certificateId);

    expect(result.id).to.equal(certificateId);
    expect(result.documentHash).to.equal(documentHash);
    expect(result.institution).to.equal(institution.address);
    expect(result.issuedAt).to.be.greaterThan(0);
    expect(result.revoked).to.equal(false);
  });
});


// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract CertificateRegistry {

    struct Certificate {
        string certificateId;
        bytes32 documentHash;
        address institution;
        uint256 issuedAt;
        bool revoked;
    }

    // Certificate ID hash => Certificate details
    mapping(bytes32 => Certificate) private certificates;

    // Prevent reuse of the same document hash
    mapping(bytes32 => bool) private usedDocumentHashes;

    event CertificateRegistered(
        string certificateId,
        bytes32 documentHash,
        address indexed institution,
        uint256 issuedAt
    );

    event CertificateRevoked(
        string certificateId,
        address indexed institution,
        uint256 revokedAt
    );

    // 1. Register a certificate
    function registerCertificate(
        string calldata certificateId,
        bytes32 documentHash
    ) external {
        require(bytes(certificateId).length > 0, "Certificate ID required");
        require(documentHash != bytes32(0), "Invalid document hash");

        bytes32 certificateKey = keccak256(bytes(certificateId));

        require(
            certificates[certificateKey].issuedAt == 0,
            "Certificate ID already exists"
        );

        require(
            !usedDocumentHashes[documentHash],
            "Document hash already registered"
        );

        certificates[certificateKey] = Certificate({
            certificateId: certificateId,
            documentHash: documentHash,
            institution: msg.sender,
            issuedAt: block.timestamp,
            revoked: false
        });

        usedDocumentHashes[documentHash] = true;

        emit CertificateRegistered(
            certificateId,
            documentHash,
            msg.sender,
            block.timestamp
        );
    }

    // 2. Verify certificate authenticity
    function verifyCertificate(
        string calldata certificateId,
        bytes32 documentHash
    )
        external
        view
        returns (
            bool exists,
            bool authentic,
            address institution,
            uint256 issuedAt,
            bool revoked
        )
    {
        bytes32 certificateKey = keccak256(bytes(certificateId));

        Certificate storage cert = certificates[certificateKey];

        exists = cert.issuedAt != 0;

        if (!exists) {
            return (false, false, address(0), 0, false);
        }

        revoked = cert.revoked;
        authentic = cert.documentHash == documentHash && !revoked;
        institution = cert.institution;
        issuedAt = cert.issuedAt;
    }

    // 3. Duplicate registration prevention
    // Enforced inside registerCertificate using certificate ID and document hash.

    // 4. Revoke a certificate
    function revokeCertificate(
        string calldata certificateId
    ) external {
        bytes32 certificateKey = keccak256(bytes(certificateId));

        Certificate storage cert = certificates[certificateKey];

        require(cert.issuedAt != 0, "Certificate not found");
        require(
            cert.institution == msg.sender,
            "Only issuing institution can revoke"
        );
        require(!cert.revoked, "Certificate already revoked");

        cert.revoked = true;

        emit CertificateRevoked(
            certificateId,
            msg.sender,
            block.timestamp
        );
    }

    // 5. Retrieve certificate information
    function getCertificate(
        string calldata certificateId
    )
        external
        view
        returns (
            string memory id,
            bytes32 documentHash,
            address institution,
            uint256 issuedAt,
            bool revoked
        )
    {
        bytes32 certificateKey = keccak256(bytes(certificateId));

        Certificate storage cert = certificates[certificateKey];

        require(cert.issuedAt != 0, "Certificate not found");

        return (
            cert.certificateId,
            cert.documentHash,
            cert.institution,
            cert.issuedAt,
            cert.revoked
        );
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title DoubleDyn Official Seal
 * @dev Contrato Oficial e Definitivo de Certificados de Compensação de Carbono (NFTs).
 * Cada Token ID representa um certificado (Selo PCR) emitido para um cliente/evento.
 */
contract DoubleDynOfficialSeal is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId = 1;

    // Estrutura para armazenar os dados da queima on-chain para transparência máxima
    struct SealData {
        string clientName;
        string eventName;
        uint256 totalOffset; // em tCO2e
        string[] retirementIds; // IDs de queima (ex: Toucan/Carbonmark)
    }

    mapping(uint256 => SealData) public sealDetails;

    constructor() ERC721("DoubleDyn PCR Seal", "DDPCR") Ownable(msg.sender) {}

    /**
     * @dev Emite um novo Selo (NFT)
     * @param to Endereço que vai receber o NFT (ex: Carteira da Prefeitura ou Tesouraria DoubleDyn)
     * @param tokenURI Link do IPFS com os metadados (JSON) e a imagem
     * @param clientName Nome do cliente (ex: Prefeitura de Ingaí)
     * @param eventName Nome do evento (ex: Festa de São João)
     * @param totalOffset Total compensado em tCO2e
     * @param retirementIds Array com os hashes de queima originais
     */
    function issueSeal(
        address to,
        string memory tokenURI,
        string memory clientName,
        string memory eventName,
        uint256 totalOffset,
        string[] memory retirementIds
    ) public onlyOwner returns (uint256) {
        uint256 newItemId = _nextTokenId++;

        _mint(to, newItemId);
        _setTokenURI(newItemId, tokenURI);

        sealDetails[newItemId] = SealData({
            clientName: clientName,
            eventName: eventName,
            totalOffset: totalOffset,
            retirementIds: retirementIds
        });

        return newItemId;
    }

    function getSealDetails(uint256 tokenId) public view returns (SealData memory) {
        return sealDetails[tokenId];
    }
}

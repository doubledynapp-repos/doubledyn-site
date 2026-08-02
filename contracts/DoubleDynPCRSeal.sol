// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
contract DoubleDynPCRSeal is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId = 1;

    // Estrutura para armazenar os dados da queima on-chain para transparência máxima
    struct SealData {
        string clientName;
        string eventName;
        uint256 totalOffsetTCO2e;
        string[] retirementIds; // IDs das transações de queima (ex: Carbonmark / Toucan)
        uint256 issueDate;
    }

    // Mapeamento do Token ID para os dados do Selo
    mapping(uint256 => SealData) public sealDetails;

    event SealIssued(
        uint256 indexed tokenId,
        string clientName,
        uint256 totalOffsetTCO2e,
        string tokenURI
    );

    constructor() ERC721("DoubleDyn PCR Seal", "DBD-SEAL") Ownable(msg.sender) {}

    /**
     * @dev Emite um novo Selo PCR (NFT)
     * @param to Endereço da carteira do cliente ou da tesouraria da DoubleDyn
     * @param tokenURI Link IPFS para o JSON de metadados
     * @param clientName Nome do cliente (ex: Prefeitura Municipal de Ingaí)
     * @param eventName Nome do evento (ex: Festa de São João Batista 2026)
     * @param totalOffset Quantidade total compensada em tCO2e
     * @param retirementIds Array com os IDs das queimas
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
            totalOffsetTCO2e: totalOffset,
            retirementIds: retirementIds,
            issueDate: block.timestamp
        });

        emit SealIssued(newItemId, clientName, totalOffset, tokenURI);

        return newItemId;
    }

    /**
     * @dev Retorna os IDs de queima (Retirement IDs) atrelados a um NFT específico
     */
    function getRetirementIds(uint256 tokenId) public view returns (string[] memory) {
        require(_ownerOf(tokenId) != address(0), "Token inexistente");
        return sealDetails[tokenId].retirementIds;
    }
}

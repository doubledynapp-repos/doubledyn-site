// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

/**
 * @title CertificateNFT
 * @dev ERC-721 — Certificado de Queima de Crédito de Carbono
 * 
 *      Cada NFT representa uma prova imutável de que uma empresa compensou
 *      suas emissões de carbono através da DoubleDyn, com queima verificável
 *      na blockchain Polygon.
 * 
 *      Base legal: Lei 15.042/2024 (SBCE — Sistema Brasileiro de Comércio de Emissões)
 * 
 * @notice Metadados on-chain (não depende de IPFS):
 *   - Nome da empresa
 *   - CNPJ
 *   - Toneladas de CO₂e compensadas
 *   - Hash da transação de queima
 *   - Data da queima
 *   - Protocolo usado (Toucan BCT)
 */
contract CertificateNFT is ERC721, ERC721Enumerable, Ownable {
    using Strings for uint256;

    // ========== STATE ==========

    /// @dev Contador de tokens
    uint256 private _nextTokenId;

    /// @dev Endereço do contrato CarbonRetire (único autorizado a mintar)
    address public carbonRetireContract;

    // ========== STRUCTS ==========

    struct Certificate {
        string companyName;       // Nome da empresa certificada
        string cnpj;              // CNPJ da empresa
        uint256 tonsCO2e;         // Toneladas de CO₂e compensadas (18 decimais)
        bytes32 retireHash;       // Hash único da transação de queima
        uint256 retireTimestamp;  // Timestamp da queima
        uint256 mintTimestamp;    // Timestamp do mint do NFT
    }

    /// @dev Dados do certificado por tokenId
    mapping(uint256 => Certificate) public certificates;

    // ========== EVENTS ==========

    event CertificateMinted(
        uint256 indexed tokenId,
        address indexed recipient,
        string companyName,
        uint256 tonsCO2e,
        bytes32 retireHash
    );

    event CarbonRetireContractSet(address indexed retireContract);

    // ========== CONSTRUCTOR ==========

    constructor() ERC721("DoubleDyn Carbon Certificate", "DDCC") Ownable(msg.sender) {}

    // ========== ADMIN ==========

    /**
     * @dev Define o contrato CarbonRetire autorizado a mintar certificados
     */
    function setCarbonRetireContract(address _retireContract) external onlyOwner {
        require(_retireContract != address(0), "Invalid address");
        carbonRetireContract = _retireContract;
        emit CarbonRetireContractSet(_retireContract);
    }

    // ========== CORE: MINT CERTIFICADO ==========

    /**
     * @dev Minta um certificado NFT. Só pode ser chamado pelo CarbonRetire.
     * 
     * @param _recipient Carteira custodial da empresa (recebe o NFT)
     * @param _companyName Nome da empresa
     * @param _cnpj CNPJ
     * @param _tonsCO2e Toneladas compensadas
     * @param _retireHash Hash da queima de carbono
     * 
     * @return tokenId ID do NFT mintado
     */
    function mintCertificate(
        address _recipient,
        string calldata _companyName,
        string calldata _cnpj,
        uint256 _tonsCO2e,
        bytes32 _retireHash
    ) external returns (uint256 tokenId) {
        require(msg.sender == carbonRetireContract, "Only CarbonRetire can mint");
        require(_recipient != address(0), "Invalid recipient");

        tokenId = _nextTokenId;
        _nextTokenId++;

        certificates[tokenId] = Certificate({
            companyName: _companyName,
            cnpj: _cnpj,
            tonsCO2e: _tonsCO2e,
            retireHash: _retireHash,
            retireTimestamp: block.timestamp,
            mintTimestamp: block.timestamp
        });

        _safeMint(_recipient, tokenId);

        emit CertificateMinted(tokenId, _recipient, _companyName, _tonsCO2e, _retireHash);
    }

    // ========== METADATA ON-CHAIN ==========

    /**
     * @dev Gera os metadados do NFT 100% on-chain (sem IPFS)
     *      Retorna JSON em Base64 com todos os dados do certificado
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);

        Certificate memory cert = certificates[tokenId];

        // Converte tonsCO2e de 18 decimais para string legível
        string memory tonsStr = _formatTons(cert.tonsCO2e);
        string memory hashStr = _bytes32ToHexString(cert.retireHash);

        // SVG do certificado (imagem on-chain)
        string memory svg = _generateSVG(cert.companyName, tonsStr, hashStr, tokenId);

        // JSON metadata
        string memory json = string(abi.encodePacked(
            '{"name":"Certificado de Compensacao de Carbono #', tokenId.toString(),
            '","description":"Certificado emitido pela DoubleDyn comprovando a queima de creditos de carbono na blockchain Polygon. Base legal: Lei 15.042/2024 (SBCE).",',
            '"image":"data:image/svg+xml;base64,', Base64.encode(bytes(svg)), '",',
            '"attributes":[',
                '{"trait_type":"Empresa","value":"', cert.companyName, '"},',
                '{"trait_type":"CNPJ","value":"', cert.cnpj, '"},',
                '{"trait_type":"Emissoes Compensadas","value":"', tonsStr, ' tCO2e"},',
                '{"trait_type":"Hash da Queima","value":"', hashStr, '"},',
                '{"trait_type":"Blockchain","value":"Polygon"},',
                '{"trait_type":"Protocolo","value":"Toucan Protocol (BCT)"},',
                '{"trait_type":"Lei Base","value":"Lei 15.042/2024 (SBCE)"},',
                '{"display_type":"date","trait_type":"Data da Queima","value":', cert.retireTimestamp.toString(), '}',
            ']}'
        ));

        return string(abi.encodePacked(
            "data:application/json;base64,",
            Base64.encode(bytes(json))
        ));
    }

    // ========== SVG GENERATION ==========

    function _generateSVG(
        string memory companyName,
        string memory tonsStr,
        string memory hashStr,
        uint256 tokenId
    ) internal pure returns (string memory) {
        return string(abi.encodePacked(
            _svgHeader(),
            _svgBody(companyName, tonsStr),
            _svgFooter(hashStr, tokenId)
        ));
    }

    function _svgHeader() internal pure returns (string memory) {
        return string(abi.encodePacked(
            '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">',
            '<defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">',
            '<stop offset="0%" style="stop-color:#0a1a0f"/><stop offset="100%" style="stop-color:#1a2f1f"/>',
            '</linearGradient></defs>',
            '<rect width="600" height="400" fill="url(#bg)" rx="16"/>',
            '<rect x="12" y="12" width="576" height="376" fill="none" stroke="#C3FF00" stroke-width="1" rx="12" opacity="0.4"/>',
            '<text x="300" y="50" text-anchor="middle" fill="#C3FF00" font-size="14" font-family="monospace" letter-spacing="4">DOUBLEDYN</text>',
            '<text x="300" y="80" text-anchor="middle" fill="#ffffff" font-size="20" font-family="serif">CERTIFICADO DE COMPENSACAO</text>',
            '<text x="300" y="105" text-anchor="middle" fill="#ffffff" font-size="16" font-family="serif">DE CARBONO</text>',
            '<line x1="60" y1="120" x2="540" y2="120" stroke="#C3FF00" stroke-width="0.5" opacity="0.6"/>'
        ));
    }

    function _svgBody(string memory companyName, string memory tonsStr) internal pure returns (string memory) {
        return string(abi.encodePacked(
            '<text x="300" y="160" text-anchor="middle" fill="#C3FF00" font-size="24" font-family="sans-serif" font-weight="bold">', companyName, '</text>',
            '<text x="300" y="200" text-anchor="middle" fill="#ffffff" font-size="14" font-family="sans-serif" opacity="0.7">compensou com sucesso</text>',
            '<text x="300" y="240" text-anchor="middle" fill="#C3FF00" font-size="36" font-family="monospace" font-weight="bold">', tonsStr, '</text>',
            '<text x="300" y="265" text-anchor="middle" fill="#ffffff" font-size="14" font-family="sans-serif" opacity="0.7">toneladas de CO2 equivalente</text>',
            '<line x1="60" y1="285" x2="540" y2="285" stroke="#C3FF00" stroke-width="0.5" opacity="0.6"/>'
        ));
    }

    function _svgFooter(string memory hashStr, uint256 tokenId) internal pure returns (string memory) {
        string memory shortHash = _substring(hashStr, 0, 18);
        return string(abi.encodePacked(
            '<text x="300" y="315" text-anchor="middle" fill="#888888" font-size="10" font-family="monospace">TX: ', shortHash, '...</text>',
            '<text x="300" y="345" text-anchor="middle" fill="#888888" font-size="10" font-family="monospace">Polygon | Toucan Protocol (BCT) | Lei 15.042/2024</text>',
            '<text x="300" y="370" text-anchor="middle" fill="#C3FF00" font-size="10" font-family="monospace">NFT #', tokenId.toString(), '</text>',
            '</svg>'
        ));
    }

    // ========== VIEWS ==========

    /**
     * @dev Retorna os dados do certificado
     */
    function getCertificate(uint256 tokenId) external view returns (Certificate memory) {
        _requireOwned(tokenId);
        return certificates[tokenId];
    }

    /**
     * @dev Total de certificados emitidos
     */
    function totalCertificates() external view returns (uint256) {
        return _nextTokenId;
    }

    // ========== INTERNAL HELPERS ==========

    function _formatTons(uint256 tons18) internal pure returns (string memory) {
        uint256 whole = tons18 / 1e18;
        uint256 frac = (tons18 % 1e18) / 1e16; // 2 decimais
        if (frac == 0) return whole.toString();
        return string(abi.encodePacked(whole.toString(), ".", frac < 10 ? "0" : "", frac.toString()));
    }

    function _bytes32ToHexString(bytes32 data) internal pure returns (string memory) {
        bytes memory hexChars = "0123456789abcdef";
        bytes memory result = new bytes(66);
        result[0] = "0";
        result[1] = "x";
        for (uint256 i = 0; i < 32; i++) {
            result[2 + i * 2] = hexChars[uint8(data[i] >> 4)];
            result[3 + i * 2] = hexChars[uint8(data[i] & 0x0f)];
        }
        return string(result);
    }

    function _substring(string memory str, uint256 startIndex, uint256 length) internal pure returns (string memory) {
        bytes memory strBytes = bytes(str);
        if (startIndex + length > strBytes.length) length = strBytes.length - startIndex;
        bytes memory result = new bytes(length);
        for (uint256 i = 0; i < length; i++) {
            result[i] = strBytes[startIndex + i];
        }
        return string(result);
    }

    // ========== OVERRIDES REQUIRED BY SOLIDITY ==========

    function _update(address to, uint256 tokenId, address auth) internal override(ERC721, ERC721Enumerable) returns (address) {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CustodialWallet
 * @dev Carteira custodial simples controlada pela DoubleDyn.
 *      Recebe NFTs e tokens em nome de uma empresa.
 *      Permite transferência de ativos para a empresa quando solicitado.
 */
contract CustodialWallet {
    /// @dev Endereço da fábrica (quem criou esta carteira)
    address public immutable factory;

    /// @dev Endereço do operador (DoubleDyn)
    address public operator;

    /// @dev Nome da empresa dona desta carteira
    string public companyName;

    /// @dev CNPJ da empresa
    string public cnpj;

    /// @dev Timestamp de criação
    uint256 public createdAt;

    modifier onlyOperator() {
        require(msg.sender == operator, "Not operator");
        _;
    }

    constructor(
        address _operator,
        string memory _companyName,
        string memory _cnpj
    ) {
        factory = msg.sender;
        operator = _operator;
        companyName = _companyName;
        cnpj = _cnpj;
        createdAt = block.timestamp;
    }

    /**
     * @dev Transfere um NFT (ERC-721) desta carteira para o endereço da empresa.
     *      Usado quando a empresa solicita receber o certificado na própria carteira.
     */
    function transferNFT(address nftContract, uint256 tokenId, address recipient) external onlyOperator {
        require(recipient != address(0), "Invalid recipient");
        // Chama safeTransferFrom no contrato NFT
        (bool success, ) = nftContract.call(
            abi.encodeWithSignature("safeTransferFrom(address,address,uint256)", address(this), recipient, tokenId)
        );
        require(success, "NFT transfer failed");
    }

    /**
     * @dev Transfere tokens ERC-20 desta carteira
     */
    function transferERC20(address tokenContract, address recipient, uint256 amount) external onlyOperator {
        require(recipient != address(0), "Invalid recipient");
        (bool success, ) = tokenContract.call(
            abi.encodeWithSignature("transfer(address,uint256)", recipient, amount)
        );
        require(success, "ERC20 transfer failed");
    }

    /**
     * @dev Atualiza o operador (em caso de rotação de chaves)
     */
    function setOperator(address _newOperator) external onlyOperator {
        require(_newOperator != address(0), "Invalid operator");
        operator = _newOperator;
    }

    /**
     * @dev Necessário para receber NFTs via safeTransferFrom
     */
    function onERC721Received(address, address, uint256, bytes calldata) external pure returns (bytes4) {
        return this.onERC721Received.selector;
    }

    /**
     * @dev Necessário para receber ETH/MATIC (caso necessário)
     */
    receive() external payable {}
}

/**
 * @title WalletFactory
 * @dev Fábrica de carteiras custodiais para empresas.
 *      Cada empresa recebe uma carteira exclusiva controlada pela DoubleDyn.
 *      NFTs certificados de queima de carbono são mintados nessas carteiras.
 *      Se a empresa quiser, DoubleDyn transfere o NFT para a carteira própria da empresa.
 * 
 * @notice Fluxo:
 *   1. DoubleDyn chama createWallet() com dados da empresa
 *   2. Uma nova CustodialWallet é deployada via CREATE
 *   3. Endereço da carteira é registrado e retornado
 *   4. CarbonRetire minta os NFTs certificado neste endereço
 *   5. Se empresa quiser receber → DoubleDyn chama transferNFT() na carteira
 */
contract WalletFactory is Ownable {

    // ========== STATE ==========

    /// @dev Total de carteiras criadas
    uint256 public totalWallets;

    /// @dev Operadores autorizados
    mapping(address => bool) public operators;

    // ========== STRUCTS ==========

    struct WalletInfo {
        address walletAddress;    // Endereço da carteira custodial
        string companyName;       // Nome da empresa
        string cnpj;              // CNPJ
        uint256 createdAt;        // Timestamp de criação
        bool active;              // Se está ativa
    }

    /// @dev Registro de carteiras por ID
    mapping(uint256 => WalletInfo) public wallets;

    /// @dev Carteira por CNPJ (para evitar duplicatas)
    mapping(string => address) public walletByCNPJ;

    /// @dev Carteira por endereço (lookup reverso)
    mapping(address => uint256) public walletIdByAddress;

    // ========== EVENTS ==========

    event WalletCreated(
        uint256 indexed walletId,
        address indexed walletAddress,
        string companyName,
        string cnpj
    );

    event OperatorUpdated(address indexed operator, bool authorized);

    // ========== MODIFIERS ==========

    modifier onlyOperator() {
        require(msg.sender == owner() || operators[msg.sender], "Not authorized");
        _;
    }

    // ========== CONSTRUCTOR ==========

    constructor() Ownable(msg.sender) {}

    // ========== ADMIN ==========

    /**
     * @dev Adiciona/remove operador autorizado
     */
    function setOperator(address _operator, bool _authorized) external onlyOwner {
        operators[_operator] = _authorized;
        emit OperatorUpdated(_operator, _authorized);
    }

    // ========== CORE: CRIAR CARTEIRA ==========

    /**
     * @dev Cria uma nova carteira custodial para uma empresa.
     *      Somente operadores autorizados (DoubleDyn) podem chamar.
     *      Cada CNPJ só pode ter uma carteira.
     * 
     * @param _companyName Nome da empresa
     * @param _cnpj CNPJ da empresa (chave única)
     * @param _operator Endereço do operador que controlará a carteira (DoubleDyn)
     * 
     * @return walletId ID da carteira
     * @return walletAddress Endereço da nova carteira custodial
     */
    function createWallet(
        string calldata _companyName,
        string calldata _cnpj,
        address _operator
    ) external onlyOperator returns (uint256 walletId, address walletAddress) {
        require(bytes(_companyName).length > 0, "Company name required");
        require(bytes(_cnpj).length > 0, "CNPJ required");
        require(walletByCNPJ[_cnpj] == address(0), "Wallet already exists for this CNPJ");

        // Deploy da carteira custodial
        CustodialWallet wallet = new CustodialWallet(_operator, _companyName, _cnpj);
        walletAddress = address(wallet);

        // Registro
        walletId = totalWallets;
        wallets[walletId] = WalletInfo({
            walletAddress: walletAddress,
            companyName: _companyName,
            cnpj: _cnpj,
            createdAt: block.timestamp,
            active: true
        });

        walletByCNPJ[_cnpj] = walletAddress;
        walletIdByAddress[walletAddress] = walletId;
        totalWallets++;

        emit WalletCreated(walletId, walletAddress, _companyName, _cnpj);
    }

    // ========== VIEWS ==========

    /**
     * @dev Retorna o endereço da carteira por CNPJ
     */
    function getWalletByCNPJ(string calldata _cnpj) external view returns (address) {
        return walletByCNPJ[_cnpj];
    }

    /**
     * @dev Retorna informações da carteira por ID
     */
    function getWallet(uint256 _walletId) external view returns (WalletInfo memory) {
        require(_walletId < totalWallets, "Wallet does not exist");
        return wallets[_walletId];
    }

    /**
     * @dev Verifica se um CNPJ já possui carteira
     */
    function hasWallet(string calldata _cnpj) external view returns (bool) {
        return walletByCNPJ[_cnpj] != address(0);
    }
}

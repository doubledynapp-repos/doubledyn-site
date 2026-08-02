// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title IKlimaRetirementAggregator
 * @dev Interface do KlimaDAO Retirement Aggregator V2 (Diamond)
 *      Endereço Polygon: 0x8cE54d9625371fb2a068986d32C85De8E6e995f8
 */
interface IKlimaRetirementAggregator {
    /**
     * @dev Retira uma quantidade exata de créditos de carbono.
     * @param sourceToken Token usado pra pagar (ex: USDC, KLIMA, BCT)
     * @param poolToken Token do pool de carbono (BCT, NCT, MCO2)
     * @param maxAmountIn Máximo de sourceToken a gastar
     * @param retireAmount Quantidade exata de carbono a retirar (18 decimais)
     * @param retiringEntityString Nome da entidade que está retirando ("DoubleDyn")
     * @param beneficiaryAddress Endereço do beneficiário (carteira custodial da empresa)
     * @param beneficiaryString Nome do beneficiário (nome da empresa)
     * @param retirementMessage Mensagem customizada do retirement
     * @return retirementIndex Índice do retirement no storage
     */
    function retireExactCarbonDefault(
        address sourceToken,
        address poolToken,
        uint256 maxAmountIn,
        uint256 retireAmount,
        string calldata retiringEntityString,
        address beneficiaryAddress,
        string calldata beneficiaryString,
        string calldata retirementMessage
    ) external returns (uint256 retirementIndex);

    /**
     * @dev Calcula quanto de sourceToken é necessário para retirar X carbono
     */
    function getSourceAmountDefaultRetirement(
        address sourceToken,
        address poolToken,
        uint256 retireAmount
    ) external view returns (uint256 amountIn);
}

/**
 * @title ICertificateNFT
 * @dev Interface para o contrato CertificateNFT da DoubleDyn
 */
interface ICertificateNFT {
    function mintCertificate(
        address custodialWallet,
        string calldata companyName,
        string calldata cnpj,
        uint256 tonsCO2e,
        bytes32 retireHash
    ) external returns (uint256);
}

/**
 * @title CarbonRetire
 * @dev Contrato responsável pela compensação de créditos de carbono via KlimaDAO
 *      e emissão do certificado NFT DoubleDyn.
 * 
 *      Integração com KlimaDAO Retirement Aggregator V2 (auditado, confiável)
 *      ao invés de queima manual para dead address.
 * 
 *      Base legal: Lei 15.042/2024 (SBCE - Sistema Brasileiro de Comércio de Emissões)
 * 
 * @notice Fluxo:
 *   1. DoubleDyn deposita USDC no contrato
 *   2. DoubleDyn chama retireCarbon() com dados da empresa
 *   3. KlimaDAO Aggregator compra BCT/NCT e retira oficialmente
 *   4. Retirement é registrado no KlimaDAO + sincronizado com Verra
 *   5. CertificateNFT da DoubleDyn é mintado na carteira custodial
 *   6. Hash da transação fica registrado para sempre na blockchain
 * 
 *  Vantagens vs queima manual:
 *   - Retirement oficial (registrado no KlimaDAO + Verra)
 *   - Zero risco de double-counting
 *   - Certificado KlimaDAO + certificado NFT DoubleDyn
 *   - Auditável por terceiros
 *   - Suporta múltiplos pools (BCT, NCT, MCO2)
 */
contract CarbonRetire is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ========== CONSTANTS (Polygon Mainnet) ==========

    /// @dev KlimaDAO Retirement Aggregator V2 (Diamond)
    IKlimaRetirementAggregator public klimaAggregator;

    /// @dev Token de pagamento (USDC Polygon)
    IERC20 public paymentToken;

    /// @dev Contrato CertificateNFT da DoubleDyn
    ICertificateNFT public certificateNFT;

    /// @dev Contador de retirements
    uint256 public totalRetirements;

    /// @dev Total de tCO2e retirados via KlimaDAO
    uint256 public totalTonsCO2eRetired;

    /// @dev Operadores autorizados (DoubleDyn team)
    mapping(address => bool) public operators;

    /// @dev Pools de carbono autorizados (BCT, NCT, etc.)
    mapping(address => bool) public allowedPools;

    // ========== STRUCTS ==========

    struct Retirement {
        address custodialWallet;        // Carteira custodial da empresa
        string companyName;             // Nome da empresa
        string cnpj;                    // CNPJ
        uint256 tonsCO2e;               // Quantidade em tCO2e (18 decimais)
        address poolToken;              // Qual pool foi usado (BCT, NCT, etc.)
        uint256 klimaRetirementIndex;   // Index do retirement no KlimaDAO
        uint256 certificateTokenId;     // ID do NFT certificado DoubleDyn
        uint256 amountPaid;             // Quanto foi pago em USDC
        uint256 timestamp;              // Quando aconteceu
        bytes32 retireHash;             // Hash único desta operação
    }

    /// @dev Registro de todas as compensações por ID
    mapping(uint256 => Retirement) public retirements;

    /// @dev Compensações por carteira custodial
    mapping(address => uint256[]) public walletRetirements;

    // ========== EVENTS ==========

    event CarbonRetired(
        uint256 indexed retirementId,
        address indexed custodialWallet,
        string companyName,
        uint256 tonsCO2e,
        address poolToken,
        uint256 klimaRetirementIndex,
        uint256 certificateTokenId,
        bytes32 retireHash
    );

    event CertificateNFTSet(address indexed nftContract);
    event KlimaAggregatorSet(address indexed aggregator);
    event PaymentTokenSet(address indexed token);
    event PoolAllowed(address indexed pool, bool allowed);
    event OperatorUpdated(address indexed operator, bool authorized);
    event PaymentDeposited(address indexed depositor, uint256 amount);

    // ========== MODIFIERS ==========

    modifier onlyOperator() {
        require(msg.sender == owner() || operators[msg.sender], "Not authorized");
        _;
    }

    // ========== CONSTRUCTOR ==========

    /**
     * @param _klimaAggregator KlimaDAO Retirement Aggregator V2
     *        Polygon Mainnet: 0x8cE54d9625371fb2a068986d32C85De8E6e995f8
     * @param _paymentToken Token de pagamento (USDC)
     *        Polygon Mainnet: 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174
     */
    constructor(
        address _klimaAggregator,
        address _paymentToken
    ) Ownable(msg.sender) {
        require(_klimaAggregator != address(0), "Invalid aggregator");
        require(_paymentToken != address(0), "Invalid payment token");

        klimaAggregator = IKlimaRetirementAggregator(_klimaAggregator);
        paymentToken = IERC20(_paymentToken);
    }

    // ========== ADMIN ==========

    function setCertificateNFT(address _nftContract) external onlyOwner {
        require(_nftContract != address(0), "Invalid NFT contract");
        certificateNFT = ICertificateNFT(_nftContract);
        emit CertificateNFTSet(_nftContract);
    }

    function setKlimaAggregator(address _aggregator) external onlyOwner {
        require(_aggregator != address(0), "Invalid aggregator");
        klimaAggregator = IKlimaRetirementAggregator(_aggregator);
        emit KlimaAggregatorSet(_aggregator);
    }

    function setPaymentToken(address _token) external onlyOwner {
        require(_token != address(0), "Invalid token");
        paymentToken = IERC20(_token);
        emit PaymentTokenSet(_token);
    }

    function setPoolAllowed(address _pool, bool _allowed) external onlyOwner {
        allowedPools[_pool] = _allowed;
        emit PoolAllowed(_pool, _allowed);
    }

    function setOperator(address _operator, bool _authorized) external onlyOwner {
        operators[_operator] = _authorized;
        emit OperatorUpdated(_operator, _authorized);
    }

    /**
     * @dev Deposita USDC no contrato (DoubleDyn deposita fundos)
     */
    function depositPayment(uint256 amount) external onlyOperator {
        require(amount > 0, "Amount must be > 0");
        paymentToken.safeTransferFrom(msg.sender, address(this), amount);
        emit PaymentDeposited(msg.sender, amount);
    }

    // ========== CORE: COMPENSAÇÃO DE CARBONO VIA KLIMADAO ==========

    /**
     * @dev Realiza a compensação de créditos de carbono para uma empresa
     *      via KlimaDAO Retirement Aggregator (auditado e confiável).
     * 
     * @param _custodialWallet Carteira custodial da empresa
     * @param _companyName Nome da empresa
     * @param _cnpj CNPJ da empresa
     * @param _tonsCO2e Quantidade de tCO2e a compensar (18 decimais)
     * @param _poolToken Pool a usar (BCT, NCT, MCO2)
     * @param _maxPayment Máximo de USDC a pagar (slippage protection)
     * 
     * @return retirementId ID interno da compensação
     * @return certificateTokenId ID do NFT certificado DoubleDyn
     */
    function retireCarbon(
        address _custodialWallet,
        string calldata _companyName,
        string calldata _cnpj,
        uint256 _tonsCO2e,
        address _poolToken,
        uint256 _maxPayment
    ) external onlyOperator nonReentrant returns (uint256 retirementId, uint256 certificateTokenId) {
        require(_custodialWallet != address(0), "Invalid wallet");
        require(_tonsCO2e > 0, "Amount must be > 0");
        require(bytes(_companyName).length > 0, "Company name required");
        require(allowedPools[_poolToken], "Pool not allowed");
        require(address(certificateNFT) != address(0), "CertificateNFT not set");

        // Verificar saldo de USDC
        uint256 balanceBefore = paymentToken.balanceOf(address(this));
        require(balanceBefore >= _maxPayment, "Insufficient USDC balance");

        // Aprovar KlimaDAO Aggregator pra gastar nosso USDC
        paymentToken.safeIncreaseAllowance(address(klimaAggregator), _maxPayment);

        // Mensagem de retirement customizada
        string memory retirementMsg = string(abi.encodePacked(
            "Compensacao de carbono via DoubleDyn para ", _companyName,
            " | CNPJ: ", _cnpj,
            " | Lei 15.042/2024 (SBCE)"
        ));

        // ====== RETIREMENT VIA KLIMADAO ======
        uint256 klimaIndex = klimaAggregator.retireExactCarbonDefault(
            address(paymentToken),   // sourceToken (USDC)
            _poolToken,              // poolToken (BCT, NCT, etc.)
            _maxPayment,             // maxAmountIn (slippage)
            _tonsCO2e,               // retireAmount (exato)
            "DoubleDyn",             // retiringEntityString
            _custodialWallet,        // beneficiaryAddress
            _companyName,            // beneficiaryString
            retirementMsg            // retirementMessage
        );

        // Calcular quanto foi realmente pago (diferença de saldo)
        uint256 balanceAfter = paymentToken.balanceOf(address(this));
        uint256 amountPaid = balanceBefore - balanceAfter;

        // Gerar hash único
        bytes32 retireHash = keccak256(abi.encodePacked(
            totalRetirements,
            _custodialWallet,
            _companyName,
            _tonsCO2e,
            klimaIndex,
            block.timestamp,
            block.number
        ));

        // ====== MINT NFT CERTIFICADO DOUBLEDYN ======
        certificateTokenId = certificateNFT.mintCertificate(
            _custodialWallet,
            _companyName,
            _cnpj,
            _tonsCO2e,
            retireHash
        );

        // ====== REGISTRO ======
        retirementId = totalRetirements;
        retirements[retirementId] = Retirement({
            custodialWallet: _custodialWallet,
            companyName: _companyName,
            cnpj: _cnpj,
            tonsCO2e: _tonsCO2e,
            poolToken: _poolToken,
            klimaRetirementIndex: klimaIndex,
            certificateTokenId: certificateTokenId,
            amountPaid: amountPaid,
            timestamp: block.timestamp,
            retireHash: retireHash
        });

        walletRetirements[_custodialWallet].push(retirementId);
        totalRetirements++;
        totalTonsCO2eRetired += _tonsCO2e;

        emit CarbonRetired(
            retirementId,
            _custodialWallet,
            _companyName,
            _tonsCO2e,
            _poolToken,
            klimaIndex,
            certificateTokenId,
            retireHash
        );
    }

    // ========== VIEWS ==========

    /**
     * @dev Calcula quanto de USDC é necessário pra compensar X toneladas
     */
    function getRetirementCost(
        address _poolToken,
        uint256 _tonsCO2e
    ) external view returns (uint256 amountIn) {
        return klimaAggregator.getSourceAmountDefaultRetirement(
            address(paymentToken),
            _poolToken,
            _tonsCO2e
        );
    }

    /**
     * @dev Saldo de USDC disponível para compensações
     */
    function availablePayment() external view returns (uint256) {
        return paymentToken.balanceOf(address(this));
    }

    /**
     * @dev Retorna todas as compensações de uma carteira
     */
    function getWalletRetirements(address _wallet) external view returns (uint256[] memory) {
        return walletRetirements[_wallet];
    }

    /**
     * @dev Retorna detalhes de uma compensação específica
     */
    function getRetirement(uint256 _id) external view returns (Retirement memory) {
        require(_id < totalRetirements, "Retirement does not exist");
        return retirements[_id];
    }

    // ========== EMERGENCY ==========

    function emergencyWithdraw(uint256 amount) external onlyOwner {
        paymentToken.safeTransfer(owner(), amount);
    }
}

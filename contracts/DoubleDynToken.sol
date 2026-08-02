// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title DoubleDynToken (DBD)
 * @dev Token lastreado em DAI e Créditos de Carbono (BCT - Toucan Protocol)
 * Este é o contrato núcleo (core) da plataforma Web3.
 */
contract DoubleDynToken is ERC20, ERC20Burnable, Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Referências aos contratos das moedas que compõem o nosso lastro
    IERC20 public immutable daiToken;
    IERC20 public immutable bctToken;

    // Proporção de lastro exigida para emitir 1 token DBD (em wei)
    // Exemplo do nosso simulador: 3.08 DAI e proporção de Carbono por Token.
    uint256 public daiRequiredPerDBD;
    uint256 public bctRequiredPerDBD;

    // Eventos gravados para sempre na Blockchain. São eles que vão 
    // alimentar o painel frontend e gerar os Certificados de Impacto em PDF.
    event ImpactMinted(address indexed user, uint256 dbdAmount, uint256 daiLocked, uint256 bctLocked);
    event ImpactRetired(address indexed user, uint256 dbdBurned, uint256 bctRetired);

    /**
     * @dev Configuração inicial no momento de lançar o contrato na rede (Deploy)
     */
    constructor(
        address _daiAddress,
        address _bctAddress,
        uint256 _daiReq,
        uint256 _bctReq
    ) ERC20("DoubleDyn EcoToken", "DBD") Ownable(msg.sender) {
        require(_daiAddress != address(0) && _bctAddress != address(0), "Enderecos invalidos");
        daiToken = IERC20(_daiAddress);
        bctToken = IERC20(_bctAddress);
        daiRequiredPerDBD = _daiReq;
        bctRequiredPerDBD = _bctReq;
    }

    /**
     * @dev Função de Criação (Mint).
     * O investidor envia DAI e BCT para o cofre do contrato e recebe DBDs frescos e lastreados.
     * @param dbdAmount Quantidade de moedas DBD que o usuário quer comprar.
     */
    function mintBackedToken(uint256 dbdAmount) external nonReentrant {
        require(dbdAmount > 0, "Quantidade deve ser maior que zero");

        // Calcula matematicamente quanto de garantia é necessário extrair da carteira do investidor
        uint256 requiredDai = (dbdAmount * daiRequiredPerDBD) / 1e18;
        uint256 requiredBct = (dbdAmount * bctRequiredPerDBD) / 1e18;

        // Bloqueia o DAI e o Carbono (BCT) do usuário para dentro deste Smart Contract
        daiToken.safeTransferFrom(msg.sender, address(this), requiredDai);
        bctToken.safeTransferFrom(msg.sender, address(this), requiredBct);

        // Somente se a transferência do lastro der certo, o contrato "imprime" o EcoToken
        _mint(msg.sender, dbdAmount);

        // Notifica as auditorias que ocorreu um aporte sustentável
        emit ImpactMinted(msg.sender, dbdAmount, requiredDai, requiredBct);
    }

    /**
     * @dev Função de Aposentar (Queimar o Token) - O Diferencial da DoubleDyn!
     * O usuário destroi os tokens DBD dele saindo do mercado, e o contrato repassa ou queima 
     * o Carbono (BCT) para garantir que aquele CO2 foi expurgado, gerando o Certificado real.
     * @param dbdBurnAmount Quantidade de DBD a ser aposentada para gerar o certificado.
     */
    function retireImpact(uint256 dbdBurnAmount) external nonReentrant {
        require(dbdBurnAmount > 0 && balanceOf(msg.sender) >= dbdBurnAmount, "Saldo insuficiente");

        // Descobre quanto de carbono exato representa esses DBDs que estão sendo aposentados
        uint256 bctToRetire = (dbdBurnAmount * bctRequiredPerDBD) / 1e18;

        // Queima o token DBD da carteira do usuário de forma irreversível!
        _burn(msg.sender, dbdBurnAmount);

        // Envia o carbono trancado no cofre para o endereço 0x0...dead (inferno digital) 
        // ou aciona a função nativa '.retire()' do parceiro Toucan Protocol no futuro.
        bctToken.safeTransfer(address(0x000000000000000000000000000000000000dEaD), bctToRetire);

        // Dispara o evento que o site (front) escuta para liberar o Botão de Baixar Certificado!
        emit ImpactRetired(msg.sender, dbdBurnAmount, bctToRetire);
    }

    /**
     * @dev Permite que a ONG principal ajuste os custos e taxas do projeto (Governança).
     */
    function updateRequirementRates(uint256 newDaiReq, uint256 newBctReq) external onlyOwner {
        daiRequiredPerDBD = newDaiReq;
        bctRequiredPerDBD = newBctReq;
    }
}

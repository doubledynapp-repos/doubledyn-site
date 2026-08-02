const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DoubleDyn Carbon System (KlimaDAO Integration)", function () {
  let owner, operator, companyWallet, externalWallet;
  let mockUSDC, mockBCT, mockKlimaAggregator;
  let carbonRetire, certificateNFT, walletFactory;

  // Endereço do BCT pool (usado como referência)
  let bctPoolAddress;

  beforeEach(async function () {
    [owner, operator, companyWallet, externalWallet] = await ethers.getSigners();

    // Deploy Mocks
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    mockUSDC = await MockUSDC.deploy();
    await mockUSDC.waitForDeployment();

    const MockBCT = await ethers.getContractFactory("MockBCT");
    mockBCT = await MockBCT.deploy();
    await mockBCT.waitForDeployment();
    bctPoolAddress = await mockBCT.getAddress();

    const MockKlima = await ethers.getContractFactory("MockKlimaAggregator");
    mockKlimaAggregator = await MockKlima.deploy(await mockUSDC.getAddress());
    await mockKlimaAggregator.waitForDeployment();

    // Deploy CertificateNFT
    const CertificateNFT = await ethers.getContractFactory("CertificateNFT");
    certificateNFT = await CertificateNFT.deploy();
    await certificateNFT.waitForDeployment();

    // Deploy CarbonRetire (com KlimaDAO Aggregator)
    const CarbonRetire = await ethers.getContractFactory("CarbonRetire");
    carbonRetire = await CarbonRetire.deploy(
      await mockKlimaAggregator.getAddress(),
      await mockUSDC.getAddress()
    );
    await carbonRetire.waitForDeployment();

    // Deploy WalletFactory
    const WalletFactory = await ethers.getContractFactory("WalletFactory");
    walletFactory = await WalletFactory.deploy();
    await walletFactory.waitForDeployment();

    // Conectar contratos
    await certificateNFT.setCarbonRetireContract(await carbonRetire.getAddress());
    await carbonRetire.setCertificateNFT(await certificateNFT.getAddress());

    // Configurar operadores
    await carbonRetire.setOperator(operator.address, true);
    await walletFactory.setOperator(operator.address, true);

    // Permitir pool BCT
    await carbonRetire.setPoolAllowed(bctPoolAddress, true);
  });

  describe("WalletFactory", function () {
    it("deve criar carteira custodial para empresa", async function () {
      await walletFactory.connect(operator).createWallet(
        "Metalurgica Paracatu", "12.345.678/0001-90", operator.address
      );

      const wallet = await walletFactory.wallets(0);
      expect(wallet.companyName).to.equal("Metalurgica Paracatu");
      expect(wallet.cnpj).to.equal("12.345.678/0001-90");
      expect(wallet.active).to.be.true;
      expect(await walletFactory.totalWallets()).to.equal(1);
    });

    it("deve impedir duplicata por CNPJ", async function () {
      await walletFactory.connect(operator).createWallet(
        "Empresa A", "11.111.111/0001-11", operator.address
      );
      await expect(
        walletFactory.connect(operator).createWallet(
          "Empresa B", "11.111.111/0001-11", operator.address
        )
      ).to.be.revertedWith("Wallet already exists for this CNPJ");
    });

    it("deve retornar carteira por CNPJ", async function () {
      await walletFactory.connect(operator).createWallet(
        "AgroVerde Cerrado", "22.222.222/0001-22", operator.address
      );
      const addr = await walletFactory.getWalletByCNPJ("22.222.222/0001-22");
      expect(addr).to.not.equal(ethers.ZeroAddress);
    });

    it("deve bloquear nao-operadores", async function () {
      await expect(
        walletFactory.connect(externalWallet).createWallet(
          "Invasor", "99.999.999/0001-99", externalWallet.address
        )
      ).to.be.revertedWith("Not authorized");
    });
  });

  describe("CarbonRetire (KlimaDAO)", function () {
    let custodialAddr;

    beforeEach(async function () {
      // Criar carteira custodial
      await walletFactory.connect(operator).createWallet(
        "TransLog Express", "33.333.333/0001-33", operator.address
      );
      const wallet = await walletFactory.wallets(0);
      custodialAddr = wallet.walletAddress;

      // Mintar USDC pro operador e depositar no CarbonRetire
      const usdcAmount = 1_000_000_000n; // 1000 USDC (6 decimais)
      await mockUSDC.mint(operator.address, usdcAmount);
      await mockUSDC.connect(operator).approve(await carbonRetire.getAddress(), usdcAmount);
      await carbonRetire.connect(operator).depositPayment(usdcAmount);
    });

    it("deve ter saldo de USDC disponivel", async function () {
      expect(await carbonRetire.availablePayment()).to.equal(1_000_000_000n);
    });

    it("deve consultar custo de retirement", async function () {
      const tons = ethers.parseEther("25"); // 25 tCO2e
      const cost = await carbonRetire.getRetirementCost(bctPoolAddress, tons);
      // Mock: 0.10 USDC por ton = 2.5 USDC = 2_500_000 (6 decimais)
      expect(cost).to.equal(2_500_000n);
    });

    it("deve compensar carbono via KlimaDAO e emitir NFT", async function () {
      const tons = ethers.parseEther("25"); // 25 tCO2e
      const maxPayment = 10_000_000n; // 10 USDC max (slippage)

      const tx = await carbonRetire.connect(operator).retireCarbon(
        custodialAddr,
        "TransLog Express",
        "33.333.333/0001-33",
        tons,
        bctPoolAddress,
        maxPayment
      );

      await tx.wait();

      // Verificar retirement registrado
      expect(await carbonRetire.totalRetirements()).to.equal(1);
      expect(await carbonRetire.totalTonsCO2eRetired()).to.equal(tons);

      // Verificar que o KlimaDAO mock recebeu o retirement
      expect(await mockKlimaAggregator.retirementCount()).to.equal(1);

      // Verificar que NFT foi mintado na carteira custodial
      expect(await certificateNFT.balanceOf(custodialAddr)).to.equal(1);
      expect(await certificateNFT.ownerOf(0)).to.equal(custodialAddr);

      // Verificar dados do certificado
      const cert = await certificateNFT.getCertificate(0);
      expect(cert.companyName).to.equal("TransLog Express");
      expect(cert.cnpj).to.equal("33.333.333/0001-33");
      expect(cert.tonsCO2e).to.equal(tons);

      // Verificar dados do retirement
      const retirement = await carbonRetire.getRetirement(0);
      expect(retirement.poolToken).to.equal(bctPoolAddress);
      expect(retirement.klimaRetirementIndex).to.equal(0);
    });

    it("deve gerar tokenURI on-chain com SVG", async function () {
      const tons = ethers.parseEther("10");
      await carbonRetire.connect(operator).retireCarbon(
        custodialAddr, "TransLog Express", "33.333.333/0001-33",
        tons, bctPoolAddress, 10_000_000n
      );

      const uri = await certificateNFT.tokenURI(0);
      expect(uri).to.include("data:application/json;base64,");

      const json = JSON.parse(
        Buffer.from(uri.replace("data:application/json;base64,", ""), "base64").toString()
      );
      expect(json.name).to.include("Certificado");
      expect(json.image).to.include("data:image/svg+xml;base64,");

      const svg = Buffer.from(
        json.image.replace("data:image/svg+xml;base64,", ""), "base64"
      ).toString();
      expect(svg).to.include("TransLog Express");
      expect(svg).to.include("DOUBLEDYN");
    });

    it("deve registrar multiplas compensacoes", async function () {
      const tons1 = ethers.parseEther("10");
      const tons2 = ethers.parseEther("15");

      await carbonRetire.connect(operator).retireCarbon(
        custodialAddr, "TransLog Express", "33.333.333/0001-33",
        tons1, bctPoolAddress, 10_000_000n
      );
      await carbonRetire.connect(operator).retireCarbon(
        custodialAddr, "TransLog Express", "33.333.333/0001-33",
        tons2, bctPoolAddress, 10_000_000n
      );

      expect(await carbonRetire.totalRetirements()).to.equal(2);
      expect(await carbonRetire.totalTonsCO2eRetired()).to.equal(ethers.parseEther("25"));
      expect(await certificateNFT.balanceOf(custodialAddr)).to.equal(2);

      const ids = await carbonRetire.getWalletRetirements(custodialAddr);
      expect(ids.length).to.equal(2);
    });

    it("deve rejeitar pool nao autorizado", async function () {
      await expect(
        carbonRetire.connect(operator).retireCarbon(
          custodialAddr, "TransLog Express", "33.333.333/0001-33",
          ethers.parseEther("1"), ethers.ZeroAddress, 10_000_000n
        )
      ).to.be.revertedWith("Pool not allowed");
    });

    it("deve bloquear nao-operadores", async function () {
      await expect(
        carbonRetire.connect(externalWallet).retireCarbon(
          custodialAddr, "Invasor", "99.999.999/0001-99",
          ethers.parseEther("1"), bctPoolAddress, 10_000_000n
        )
      ).to.be.revertedWith("Not authorized");
    });
  });

  describe("CustodialWallet - Transferencia de NFT", function () {
    it("deve transferir NFT para carteira externa da empresa", async function () {
      // Setup
      await walletFactory.connect(operator).createWallet(
        "AgroVerde Cerrado", "44.444.444/0001-44", operator.address
      );
      const wallet = await walletFactory.wallets(0);
      const custodialAddr = wallet.walletAddress;

      const usdcAmount = 500_000_000n;
      await mockUSDC.mint(operator.address, usdcAmount);
      await mockUSDC.connect(operator).approve(await carbonRetire.getAddress(), usdcAmount);
      await carbonRetire.connect(operator).depositPayment(usdcAmount);

      await carbonRetire.connect(operator).retireCarbon(
        custodialAddr, "AgroVerde Cerrado", "44.444.444/0001-44",
        ethers.parseEther("20"), bctPoolAddress, 10_000_000n
      );

      expect(await certificateNFT.ownerOf(0)).to.equal(custodialAddr);

      // Transferir NFT
      const custodialWallet = await ethers.getContractAt("CustodialWallet", custodialAddr);
      await custodialWallet.connect(operator).transferNFT(
        await certificateNFT.getAddress(), 0, externalWallet.address
      );

      expect(await certificateNFT.ownerOf(0)).to.equal(externalWallet.address);
    });
  });

  describe("Fluxo Completo E2E (KlimaDAO)", function () {
    it("deve executar: carteira → USDC → KlimaDAO retire → NFT → transferencia", async function () {
      // 1. Criar carteira custodial
      await walletFactory.connect(operator).createWallet(
        "Bayer Brasil", "55.555.555/0001-55", operator.address
      );
      const wallet = await walletFactory.wallets(0);
      const custodialAddr = wallet.walletAddress;

      // 2. DoubleDyn deposita USDC
      const usdcAmount = 500_000_000n; // 500 USDC
      await mockUSDC.mint(operator.address, usdcAmount);
      await mockUSDC.connect(operator).approve(await carbonRetire.getAddress(), usdcAmount);
      await carbonRetire.connect(operator).depositPayment(usdcAmount);

      // 3. Compensação 1: 50 tCO2e via KlimaDAO
      await carbonRetire.connect(operator).retireCarbon(
        custodialAddr, "Bayer Brasil", "55.555.555/0001-55",
        ethers.parseEther("50"), bctPoolAddress, 50_000_000n
      );

      // 4. Compensação 2: 30 tCO2e
      await carbonRetire.connect(operator).retireCarbon(
        custodialAddr, "Bayer Brasil", "55.555.555/0001-55",
        ethers.parseEther("30"), bctPoolAddress, 50_000_000n
      );

      // 5. Verificações
      expect(await carbonRetire.totalRetirements()).to.equal(2);
      expect(await carbonRetire.totalTonsCO2eRetired()).to.equal(ethers.parseEther("80"));
      expect(await certificateNFT.totalCertificates()).to.equal(2);
      expect(await certificateNFT.balanceOf(custodialAddr)).to.equal(2);
      expect(await mockKlimaAggregator.retirementCount()).to.equal(2);

      // 6. Empresa pede NFT #0
      const custodialWallet = await ethers.getContractAt("CustodialWallet", custodialAddr);
      await custodialWallet.connect(operator).transferNFT(
        await certificateNFT.getAddress(), 0, externalWallet.address
      );
      expect(await certificateNFT.ownerOf(0)).to.equal(externalWallet.address);
      expect(await certificateNFT.ownerOf(1)).to.equal(custodialAddr);

      // 7. Verificar retirement data
      const retirement = await carbonRetire.getRetirement(0);
      expect(retirement.companyName).to.equal("Bayer Brasil");
      expect(retirement.tonsCO2e).to.equal(ethers.parseEther("50"));
      expect(retirement.klimaRetirementIndex).to.equal(0);

      // 8. Verificar dados do KlimaDAO mock
      const klimaRetirement = await mockKlimaAggregator.mockRetirements(0);
      expect(klimaRetirement.beneficiaryName).to.equal("Bayer Brasil");
      expect(klimaRetirement.retiringEntity).to.equal("DoubleDyn");
    });
  });
});

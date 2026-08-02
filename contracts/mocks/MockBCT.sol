// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title MockBCT
 * @dev Mock do Base Carbon Tonne (Toucan Protocol) para testes locais.
 */
contract MockBCT is ERC20 {
    constructor() ERC20("Mock Base Carbon Tonne", "BCT") {}
    function mint(address to, uint256 amount) external { _mint(to, amount); }
}

/**
 * @title MockUSDC
 * @dev Mock do USDC para testes locais (6 decimais como o real)
 */
contract MockUSDC is ERC20 {
    constructor() ERC20("Mock USD Coin", "USDC") {}
    function decimals() public pure override returns (uint8) { return 6; }
    function mint(address to, uint256 amount) external { _mint(to, amount); }
}

/**
 * @title MockKlimaAggregator
 * @dev Mock do KlimaDAO Retirement Aggregator V2 para testes locais.
 */
contract MockKlimaAggregator {
    uint256 public retirementCount;
    IERC20 public usdc;

    uint256 public constant PRICE_PER_TON_USDC = 100_000; // 0.10 USDC (6 decimais)

    struct MockRetirement {
        address sourceToken;
        address poolToken;
        uint256 amountPaid;
        uint256 retireAmount;
        string retiringEntity;
        address beneficiary;
        string beneficiaryName;
        string message;
    }

    mapping(uint256 => MockRetirement) public mockRetirements;

    constructor(address _usdc) {
        usdc = IERC20(_usdc);
    }

    function retireExactCarbonDefault(
        address sourceToken,
        address poolToken,
        uint256 maxAmountIn,
        uint256 retireAmount,
        string calldata retiringEntityString,
        address beneficiaryAddress,
        string calldata beneficiaryString,
        string calldata retirementMessage
    ) external returns (uint256 retirementIndex) {
        uint256 cost = (retireAmount * PRICE_PER_TON_USDC) / 1e18;
        require(cost <= maxAmountIn, "Exceeds max amount");

        usdc.transferFrom(msg.sender, address(this), cost);

        retirementIndex = retirementCount;
        mockRetirements[retirementIndex] = MockRetirement({
            sourceToken: sourceToken,
            poolToken: poolToken,
            amountPaid: cost,
            retireAmount: retireAmount,
            retiringEntity: retiringEntityString,
            beneficiary: beneficiaryAddress,
            beneficiaryName: beneficiaryString,
            message: retirementMessage
        });

        retirementCount++;
    }

    function getSourceAmountDefaultRetirement(
        address,
        address,
        uint256 retireAmount
    ) external pure returns (uint256 amountIn) {
        return (retireAmount * PRICE_PER_TON_USDC) / 1e18;
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
}

contract MemeStaking {
    address public stakingToken; // The meme coin ID
    uint256 public rewardRate; // HBAR reward per second
    
    uint256 public totalStaked;
    mapping(address => uint256) public stakedBalance;
    mapping(address => uint256) public stakingStartTime;
    mapping(address => uint256) public accumulatedRewards;

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 reward);

    constructor(address _stakingToken, uint256 _rewardRate) {
        stakingToken = _stakingToken;
        rewardRate = _rewardRate;
    }

    // Platform owners or users can send HBAR to this contract to fund the reward pool
    receive() external payable {}

    function stake(uint256 _amount) external {
        require(_amount > 0, "Cannot stake 0");
        
        _updateReward(msg.sender);
        
        // Transfers the HTS token from user to contract (requires prior approval)
        IERC20(stakingToken).transferFrom(msg.sender, address(this), _amount);
        stakedBalance[msg.sender] += _amount;
        totalStaked += _amount;
        
        stakingStartTime[msg.sender] = block.timestamp;
        emit Staked(msg.sender, _amount);
    }

    function unstake(uint256 _amount) external {
        require(_amount > 0 && stakedBalance[msg.sender] >= _amount, "Invalid unstake amount");
        
        _updateReward(msg.sender);
        
        stakedBalance[msg.sender] -= _amount;
        totalStaked -= _amount;
        IERC20(stakingToken).transfer(msg.sender, _amount);
        
        emit Unstaked(msg.sender, _amount);
    }

    function claimReward() external {
        _updateReward(msg.sender);
        
        uint256 reward = accumulatedRewards[msg.sender];
        require(reward > 0, "No rewards to claim");
        require(address(this).balance >= reward, "Insufficient HBAR in reward pool");

        accumulatedRewards[msg.sender] = 0;
        
        // Native HBAR Transfer to the claimer
        (bool success, ) = msg.sender.call{value: reward}("");
        require(success, "HBAR transfer failed");

        emit RewardClaimed(msg.sender, reward);
    }

    function _updateReward(address _account) internal {
        if (stakedBalance[_account] > 0) {
            uint256 timeStaked = block.timestamp - stakingStartTime[_account];
            uint256 reward = (stakedBalance[_account] * timeStaked * rewardRate) / 1e18;
            accumulatedRewards[_account] += reward;
        }
        stakingStartTime[_account] = block.timestamp;
    }

    function pendingReward(address _account) external view returns (uint256) {
        if (stakedBalance[_account] == 0) return accumulatedRewards[_account];
        uint256 timeStaked = block.timestamp - stakingStartTime[_account];
        uint256 additionalReward = (stakedBalance[_account] * timeStaked * rewardRate) / 1e18;
        return accumulatedRewards[_account] + additionalReward;
    }
}

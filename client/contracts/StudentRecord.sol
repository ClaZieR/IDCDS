// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract StudentRecord {
    struct Student {
        string firstName;
        string middleName;
        string lastName;
        string birthday;
        string occupancy;
        string college;
    }

    mapping(address => Student) private students;
    address public owner;
    uint256 public constant SIGNUP_FEE = 0.005 ether;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    function addStudent(
        string memory _firstName,
        string memory _middleName,
        string memory _lastName,
        string memory _birthday,
        string memory _occupancy,
        string memory _college
    ) public payable {
        require(msg.value >= SIGNUP_FEE, "Insufficient signup fee");
        students[msg.sender] = Student(_firstName, _middleName, _lastName, _birthday, _occupancy, _college);
    }

    function getStudent() public view returns (Student memory) {
        return students[msg.sender];
    }

    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        payable(owner).transfer(balance);
    }
}

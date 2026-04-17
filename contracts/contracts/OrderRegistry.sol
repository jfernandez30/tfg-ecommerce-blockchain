// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title OrderRegistry
 * @dev Contrato inteligente para el registro inmutable de pedidos de ecommerce
 * @notice Permite registrar pedidos con su identificador, comprador y total
 */
contract OrderRegistry {
    
    struct Order {
        string orderId;
        address buyer;
        uint256 total;
        uint256 timestamp;
        bool exists;
    }

    mapping(string => Order) private orders;
    string[] private orderIds;
    address public owner;

    event OrderRegistered(
        string indexed orderId,
        address indexed buyer,
        uint256 total,
        uint256 timestamp
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Solo el propietario puede ejecutar esta funcion");
        _;
    }

    modifier orderNotExists(string memory orderId) {
        require(!orders[orderId].exists, "El pedido ya esta registrado");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Registra un nuevo pedido en la blockchain
     * @param orderId Identificador unico del pedido en la base de datos
     * @param total Importe total del pedido en centimos de euro
     */
    function registerOrder(
        string memory orderId,
        uint256 total
    ) external orderNotExists(orderId) {
        orders[orderId] = Order({
            orderId: orderId,
            buyer: msg.sender,
            total: total,
            timestamp: block.timestamp,
            exists: true
        });

        orderIds.push(orderId);

        emit OrderRegistered(orderId, msg.sender, total, block.timestamp);
    }

    /**
     * @dev Obtiene los datos de un pedido registrado
     * @param orderId Identificador del pedido
     */
    function getOrder(string memory orderId) 
        external 
        view 
        returns (
            string memory,
            address,
            uint256,
            uint256
        ) 
    {
        require(orders[orderId].exists, "El pedido no existe");
        Order memory order = orders[orderId];
        return (order.orderId, order.buyer, order.total, order.timestamp);
    }

    /**
     * @dev Verifica si un pedido existe en la blockchain
     * @param orderId Identificador del pedido
     */
    function orderExists(string memory orderId) external view returns (bool) {
        return orders[orderId].exists;
    }

    /**
     * @dev Obtiene el numero total de pedidos registrados
     */
    function getTotalOrders() external view returns (uint256) {
        return orderIds.length;
    }
}

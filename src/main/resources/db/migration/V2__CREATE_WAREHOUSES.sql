-- CREATE TABLE `warehouses`
-- (
--     `id`                   BIGINT       NOT NULL AUTO_INCREMENT,
--     `name`                 VARCHAR(255) NOT NULL UNIQUE,
--     `address`              VARCHAR(255) NOT NULL,
--     `size`                 FLOAT(10, 2) NOT NULL,
--     `status`               VARCHAR(50)  NULL DEFAULT 'ACTIVE',
--     `description`          LONGTEXT     NULL,
--     `warehouse_manager_id` BIGINT       NOT NULL,
--     `is_deleted`           BOOLEAN      NULL DEFAULT FALSE,
--     `created_date`         DATETIME     NOT NULL,
--     `last_modified_date`   DATETIME     NOT NULL,
--     PRIMARY KEY (`id`)
-- );

-- V2__CREATE_WAREHOUSES.sql

CREATE TABLE warehouses (
    warehouse_id INT AUTO_INCREMENT PRIMARY KEY,
    warehouse_manager_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    size INT NOT NULL,
    status INT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (warehouse_manager_id) REFERENCES users(user_id),
    FOREIGN KEY (status) REFERENCES status_type(status_typeid)
);

-- CREATE TABLE `users`
-- (
--     `id`                 BIGINT       NOT NULL AUTO_INCREMENT,
--     `fullname`           VARCHAR(150) NOT NULL,
--     `password`           VARCHAR(450) NOT NULL,
--     `email`              VARCHAR(150) NOT NULL,
--     `gender`             VARCHAR(50)  NOT NULL,
--     `phone_number`       VARCHAR(10)  NOT NULL,
--     `address`            VARCHAR(255) NOT NULL,
--     `role`               BIGINT       NOT NULL,
--     `status`             VARCHAR(50)  NULL DEFAULT 'ACTIVE',
--     `is_deleted`         BOOLEAN      NULL DEFAULT FALSE,
--     `created_date`       DATETIME     NOT NULL,
--     `last_modified_date` DATETIME     NOT NULL,
--     PRIMARY KEY (`id`)
-- );

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    role_typeid INT NOT NULL,
    status_typeid INT NOT NULL,
    phonenumber VARCHAR(20),
    address TEXT,
    gender BOOLEAN,
    FOREIGN KEY (role_typeid) REFERENCES role_type(role_typeid),
    FOREIGN KEY (status_typeid) REFERENCES status_type(status_typeid),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


CREATE TABLE `tokens`
(
    `id`                 BIGINT       NOT NULL AUTO_INCREMENT,
    `token`              VARCHAR(255) NOT NULL UNIQUE,
    `token_type`         VARCHAR(50)  NOT NULL UNIQUE,
    `expiration_date`    DATETIME     NOT NULL,
    `revoked`            BOOLEAN      NULL DEFAULT FALSE,
    `expired`            BOOLEAN      NULL DEFAULT FALSE,
    `is_deleted`         BOOLEAN      NULL DEFAULT FALSE,
    `created_date`       DATETIME     NOT NULL,
    `last_modified_date` DATETIME     NOT NULL,
    PRIMARY KEY (`id`)
);

CREATE TABLE `roles`
(
    `id`                 BIGINT      NOT NULL AUTO_INCREMENT,
    `role`               VARCHAR(50) NOT NULL UNIQUE,
    `is_deleted`         BOOLEAN     NULL DEFAULT FALSE,
    `created_date`       DATETIME    NOT NULL,
    `last_modified_date` DATETIME    NOT NULL,
    PRIMARY KEY (`id`)
);

INSERT INTO `roles` (`role`, `created_date`, `last_modified_date`)
VALUES ('USER', NOW(), NOW()),
       ('ADMIN', NOW(), NOW()),
       ('SALES', NOW(), NOW()),
       ('MANAGER', NOW(), NOW());

INSERT INTO `users` (`fullname`, `password`, `email`, `gender`, `phone_number`, `address`, `role`, `created_date`, `last_modified_date`)
VALUES ('admin', '$2a$10$75j9yaNBgEYe0vbZxqUUFudnprdWgld.4p161jBDbZXfM.CKW8kbm', 'admin@gmail.com','MALE' ,'0987654321' ,'abcd' ,2, NOW(), NOW());
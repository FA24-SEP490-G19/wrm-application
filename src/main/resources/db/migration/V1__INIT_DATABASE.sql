CREATE TABLE `users`
(
    `id`                 BIGINT       NOT NULL AUTO_INCREMENT,
    `username`           VARCHAR(150) NOT NULL,
    `password`           VARCHAR(450) NOT NULL,
    `email`              VARCHAR(150) NOT NULL,
    `role`               BIGINT       NOT NULL,
    `status`             BOOLEAN      NULL DEFAULT TRUE,
    `is_deleted`         BOOLEAN      NULL DEFAULT FALSE,
    `created_date`       DATETIME     NOT NULL,
    `last_modified_date` DATETIME     NOT NULL,
    PRIMARY KEY (`id`)
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
VALUES ('ROLE_USER', NOW(), NOW()),
       ('ROLE_ADMIN', NOW(), NOW()),
       ('ROLE_SALES', NOW(), NOW()),
       ('ROLE_MANAGER', NOW(), NOW());
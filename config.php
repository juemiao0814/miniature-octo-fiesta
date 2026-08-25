<?php
/**
 * 数据库连接配置
 * 请根据你自己的服务器环境修改以下四项
 */

$DB_HOST = "localhost";
$DB_NAME = "growthos";
$DB_USER = "root";
$DB_PASS = "";

// AI学习规划助手需要的 Anthropic API Key
// 前往 https://console.anthropic.com 申请，填在这里
$ANTHROPIC_API_KEY = "";

try {
    $pdo = new PDO(
        "mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8mb4",
        $DB_USER,
        $DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    die(json_encode(["success" => false, "message" => "数据库连接失败: " . $e->getMessage()]));
}

// 所有接口统一开启 session，用于登录状态保持
session_start();

header("Content-Type: application/json; charset=utf-8");

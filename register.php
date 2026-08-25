<?php
require "config.php";

$input = json_decode(file_get_contents("php://input"), true);
$username = trim($input["username"] ?? "");
$password = $input["password"] ?? "";

if ($username === "" || $password === "") {
    echo json_encode(["success" => false, "message" => "用户名和密码不能为空"]);
    exit;
}

if (strlen($password) < 6) {
    echo json_encode(["success" => false, "message" => "密码至少需要6位"]);
    exit;
}

// 检查用户名是否已存在
$stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
$stmt->execute([$username]);
if ($stmt->fetch()) {
    echo json_encode(["success" => false, "message" => "用户名已被注册"]);
    exit;
}

$hash = password_hash($password, PASSWORD_DEFAULT);

$stmt = $pdo->prepare("INSERT INTO users (username, password_hash) VALUES (?, ?)");
$stmt->execute([$username, $hash]);

echo json_encode(["success" => true, "message" => "注册成功，请登录"]);

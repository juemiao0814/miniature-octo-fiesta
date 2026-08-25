<?php
require "config.php";

$input = json_decode(file_get_contents("php://input"), true);
$username = trim($input["username"] ?? "");
$password = $input["password"] ?? "";

if ($username === "" || $password === "") {
    echo json_encode(["success" => false, "message" => "请输入用户名和密码"]);
    exit;
}

$stmt = $pdo->prepare("SELECT id, username, password_hash FROM users WHERE username = ?");
$stmt->execute([$username]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user["password_hash"])) {
    echo json_encode(["success" => false, "message" => "用户名或密码错误"]);
    exit;
}

$_SESSION["user_id"] = $user["id"];
$_SESSION["username"] = $user["username"];

echo json_encode(["success" => true, "username" => $user["username"]]);

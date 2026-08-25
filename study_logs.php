<?php
require "config.php";

if (!isset($_SESSION["user_id"])) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "请先登录"]);
    exit;
}

$user_id = $_SESSION["user_id"];
$method = $_SERVER["REQUEST_METHOD"];

if ($method === "GET") {
    // 默认取最近30天的记录，用于画曲线
    $days = (int)($_GET["days"] ?? 30);
    $stmt = $pdo->prepare("SELECT id, log_date, subject, minutes, score, note FROM study_logs WHERE user_id = ? AND log_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY) ORDER BY log_date ASC");
    $stmt->execute([$user_id, $days]);
    $logs = $stmt->fetchAll();

    echo json_encode(["success" => true, "logs" => $logs]);
    exit;
}

if ($method === "POST") {
    $input = json_decode(file_get_contents("php://input"), true);

    $date = $input["log_date"] ?? date("Y-m-d");
    $subject = trim($input["subject"] ?? "");
    $minutes = (int)($input["minutes"] ?? 0);
    $score = isset($input["score"]) && $input["score"] !== "" ? (int)$input["score"] : null;
    $note = trim($input["note"] ?? "");

    if ($subject === "" || $minutes <= 0) {
        echo json_encode(["success" => false, "message" => "请填写科目和学习时长"]);
        exit;
    }

    $stmt = $pdo->prepare("INSERT INTO study_logs (user_id, log_date, subject, minutes, score, note) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([$user_id, $date, $subject, $minutes, $score, $note]);

    echo json_encode(["success" => true, "id" => $pdo->lastInsertId()]);
    exit;
}

http_response_code(405);
echo json_encode(["success" => false, "message" => "不支持的请求方式"]);

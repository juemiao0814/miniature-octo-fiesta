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
    $stmt = $pdo->prepare("SELECT id, title, content, file_name, status, feedback, submitted_at FROM homeworks WHERE user_id = ? ORDER BY submitted_at DESC");
    $stmt->execute([$user_id]);
    echo json_encode(["success" => true, "items" => $stmt->fetchAll()]);
    exit;
}

if ($method === "POST") {
    // 用 multipart/form-data 提交，兼容文字内容 + 可选文件
    $title = trim($_POST["title"] ?? "");
    $content = trim($_POST["content"] ?? "");

    if ($title === "") {
        echo json_encode(["success" => false, "message" => "请填写作业标题"]);
        exit;
    }

    $file_name = null;
    $file_path = null;

    if (isset($_FILES["file"]) && $_FILES["file"]["error"] === UPLOAD_ERR_OK) {
        $upload_dir = __DIR__ . "/../uploads/homework/";
        if (!is_dir($upload_dir)) {
            mkdir($upload_dir, 0755, true);
        }

        $original_name = basename($_FILES["file"]["name"]);
        // 用户id + 时间戳前缀，避免不同用户文件重名互相覆盖
        $safe_name = $user_id . "_" . time() . "_" . preg_replace("/[^a-zA-Z0-9._\-\x{4e00}-\x{9fa5}]/u", "_", $original_name);

        $dest = $upload_dir . $safe_name;
        if (move_uploaded_file($_FILES["file"]["tmp_name"], $dest)) {
            $file_name = $original_name;
            $file_path = "uploads/homework/" . $safe_name;
        }
    }

    $stmt = $pdo->prepare("INSERT INTO homeworks (user_id, title, content, file_name, file_path) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$user_id, $title, $content, $file_name, $file_path]);

    echo json_encode(["success" => true, "id" => $pdo->lastInsertId()]);
    exit;
}

http_response_code(405);
echo json_encode(["success" => false, "message" => "不支持的请求方式"]);

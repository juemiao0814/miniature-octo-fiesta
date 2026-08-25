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
    $stmt = $pdo->prepare("SELECT id, subject, question, my_answer, correct_answer, note, mastered, created_at FROM wrong_questions WHERE user_id = ? ORDER BY mastered ASC, created_at DESC");
    $stmt->execute([$user_id]);
    echo json_encode(["success" => true, "items" => $stmt->fetchAll()]);
    exit;
}

if ($method === "POST") {
    $input = json_decode(file_get_contents("php://input"), true);
    $action = $input["action"] ?? "add";

    if ($action === "add") {
        $subject = trim($input["subject"] ?? "");
        $question = trim($input["question"] ?? "");
        $my_answer = trim($input["my_answer"] ?? "");
        $correct_answer = trim($input["correct_answer"] ?? "");
        $note = trim($input["note"] ?? "");

        if ($subject === "" || $question === "") {
            echo json_encode(["success" => false, "message" => "科目和题目不能为空"]);
            exit;
        }

        $stmt = $pdo->prepare("INSERT INTO wrong_questions (user_id, subject, question, my_answer, correct_answer, note) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([$user_id, $subject, $question, $my_answer, $correct_answer, $note]);

        echo json_encode(["success" => true, "id" => $pdo->lastInsertId()]);
        exit;
    }

    if ($action === "toggle_mastered") {
        $id = (int)($input["id"] ?? 0);

        $stmt = $pdo->prepare("SELECT mastered FROM wrong_questions WHERE id = ? AND user_id = ?");
        $stmt->execute([$id, $user_id]);
        $row = $stmt->fetch();

        if (!$row) {
            echo json_encode(["success" => false, "message" => "记录不存在"]);
            exit;
        }

        $new_val = $row["mastered"] ? 0 : 1;
        $update = $pdo->prepare("UPDATE wrong_questions SET mastered = ? WHERE id = ?");
        $update->execute([$new_val, $id]);

        echo json_encode(["success" => true, "mastered" => (bool)$new_val]);
        exit;
    }

    if ($action === "delete") {
        $id = (int)($input["id"] ?? 0);
        $stmt = $pdo->prepare("DELETE FROM wrong_questions WHERE id = ? AND user_id = ?");
        $stmt->execute([$id, $user_id]);
        echo json_encode(["success" => true]);
        exit;
    }

    echo json_encode(["success" => false, "message" => "未知操作"]);
    exit;
}

http_response_code(405);
echo json_encode(["success" => false, "message" => "不支持的请求方式"]);

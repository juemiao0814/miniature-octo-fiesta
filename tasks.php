<?php
require "config.php";

if (!isset($_SESSION["user_id"])) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "请先登录"]);
    exit;
}

$user_id = $_SESSION["user_id"];
$method = $_SERVER["REQUEST_METHOD"];

// 默认任务模板：用户当天第一次打开时自动写入
$default_tasks = [
    "高等数学 极限复习30分钟",
    "Python函数学习",
    "创业项目调研",
];

if ($method === "GET") {
    $date = $_GET["date"] ?? date("Y-m-d");

    $stmt = $pdo->prepare("SELECT id, task_name, done FROM daily_tasks WHERE user_id = ? AND task_date = ? ORDER BY id ASC");
    $stmt->execute([$user_id, $date]);
    $tasks = $stmt->fetchAll();

    // 如果当天还没有任务记录，写入默认任务模板
    if (count($tasks) === 0) {
        $insert = $pdo->prepare("INSERT INTO daily_tasks (user_id, task_date, task_name, done) VALUES (?, ?, ?, 0)");
        foreach ($default_tasks as $name) {
            $insert->execute([$user_id, $date, $name]);
        }
        $stmt->execute([$user_id, $date]);
        $tasks = $stmt->fetchAll();
    }

    echo json_encode(["success" => true, "date" => $date, "tasks" => $tasks]);
    exit;
}

if ($method === "POST") {
    $input = json_decode(file_get_contents("php://input"), true);
    $action = $input["action"] ?? "";

    if ($action === "toggle") {
        $task_id = (int)($input["id"] ?? 0);

        // 确认这条任务属于当前登录用户，避免越权修改他人数据
        $stmt = $pdo->prepare("SELECT id, done FROM daily_tasks WHERE id = ? AND user_id = ?");
        $stmt->execute([$task_id, $user_id]);
        $task = $stmt->fetch();

        if (!$task) {
            echo json_encode(["success" => false, "message" => "任务不存在"]);
            exit;
        }

        $new_done = $task["done"] ? 0 : 1;
        $update = $pdo->prepare("UPDATE daily_tasks SET done = ? WHERE id = ?");
        $update->execute([$new_done, $task_id]);

        echo json_encode(["success" => true, "id" => $task_id, "done" => (bool)$new_done]);
        exit;
    }

    if ($action === "add") {
        $date = $input["date"] ?? date("Y-m-d");
        $name = trim($input["task_name"] ?? "");

        if ($name === "") {
            echo json_encode(["success" => false, "message" => "任务内容不能为空"]);
            exit;
        }

        $insert = $pdo->prepare("INSERT INTO daily_tasks (user_id, task_date, task_name, done) VALUES (?, ?, ?, 0)");
        $insert->execute([$user_id, $date, $name]);

        echo json_encode(["success" => true, "id" => $pdo->lastInsertId()]);
        exit;
    }

    echo json_encode(["success" => false, "message" => "未知操作"]);
    exit;
}

http_response_code(405);
echo json_encode(["success" => false, "message" => "不支持的请求方式"]);

<?php
require "config.php";

if (!isset($_SESSION["user_id"])) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "请先登录"]);
    exit;
}

if (empty($ANTHROPIC_API_KEY)) {
    echo json_encode(["success" => false, "message" => "尚未配置 ANTHROPIC_API_KEY，请在 api/config.php 中填写"]);
    exit;
}

$user_id = $_SESSION["user_id"];

// 汇总最近14天的任务完成情况
$taskStmt = $pdo->prepare("SELECT task_date, task_name, done FROM daily_tasks WHERE user_id = ? AND task_date >= DATE_SUB(CURDATE(), INTERVAL 14 DAY) ORDER BY task_date ASC");
$taskStmt->execute([$user_id]);
$tasks = $taskStmt->fetchAll();

// 汇总最近14天的学习记录
$logStmt = $pdo->prepare("SELECT log_date, subject, minutes, score, note FROM study_logs WHERE user_id = ? AND log_date >= DATE_SUB(CURDATE(), INTERVAL 14 DAY) ORDER BY log_date ASC");
$logStmt->execute([$user_id]);
$logs = $logStmt->fetchAll();

// 汇总未掌握的错题
$wrongStmt = $pdo->prepare("SELECT subject, question FROM wrong_questions WHERE user_id = ? AND mastered = 0 LIMIT 20");
$wrongStmt->execute([$user_id]);
$wrongs = $wrongStmt->fetchAll();

if (count($tasks) === 0 && count($logs) === 0 && count($wrongs) === 0) {
    echo json_encode(["success" => false, "message" => "暂时没有足够的打卡/学习数据，先去打卡几天再来生成计划吧"]);
    exit;
}

$summary = "【最近14天任务打卡】\n";
foreach ($tasks as $t) {
    $summary .= "{$t['task_date']} {$t['task_name']} " . ($t['done'] ? "已完成" : "未完成") . "\n";
}

$summary .= "\n【最近14天学习记录】\n";
foreach ($logs as $l) {
    $summary .= "{$l['log_date']} {$l['subject']} 学习{$l['minutes']}分钟";
    if ($l['score'] !== null) $summary .= " 得分{$l['score']}";
    if ($l['note']) $summary .= " 备注:{$l['note']}";
    $summary .= "\n";
}

$summary .= "\n【尚未掌握的错题】\n";
foreach ($wrongs as $w) {
    $summary .= "[{$w['subject']}] {$w['question']}\n";
}

$prompt = <<<EOT
你是一名学习规划助手，服务对象是一名同时学习「工程管理」和「计算机科学与技术」两个专业、正在准备转专业的大学生。
下面是他最近的打卡和学习数据：

$summary

请根据以上数据，输出一份「下周学习计划」，要求：
1. 先用1-2句话点评目前的学习状态（哪里做得好，哪里需要加强）
2. 按天给出具体的学习任务安排（7天），任务要具体可执行，不要空泛
3. 针对尚未掌握的错题，给出复习建议
4. 语言简洁，用中文，用 Markdown 格式输出
EOT;

$ch = curl_init("https://api.anthropic.com/v1/messages");
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => [
        "Content-Type: application/json",
        "x-api-key: $ANTHROPIC_API_KEY",
        "anthropic-version: 2023-06-01",
    ],
    CURLOPT_POSTFIELDS => json_encode([
        "model" => "claude-sonnet-4-6",
        "max_tokens" => 1500,
        "messages" => [
            ["role" => "user", "content" => $prompt],
        ],
    ]),
    CURLOPT_TIMEOUT => 60,
]);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curl_error = curl_error($ch);
curl_close($ch);

if ($curl_error) {
    echo json_encode(["success" => false, "message" => "请求AI服务失败: $curl_error"]);
    exit;
}

$result = json_decode($response, true);

if ($http_code !== 200) {
    $msg = $result["error"]["message"] ?? "未知错误";
    echo json_encode(["success" => false, "message" => "AI服务返回错误: $msg"]);
    exit;
}

$planText = "";
foreach ($result["content"] as $block) {
    if ($block["type"] === "text") {
        $planText .= $block["text"];
    }
}

echo json_encode(["success" => true, "plan" => $planText]);

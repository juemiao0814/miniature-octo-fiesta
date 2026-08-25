-- 成长OS V3.1 数据库结构
-- 使用方法：在 MySQL 中执行 `source db.sql;` 或用 phpMyAdmin 导入

CREATE DATABASE IF NOT EXISTS growthos DEFAULT CHARACTER SET utf8mb4;
USE growthos;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 每日任务打卡表
CREATE TABLE IF NOT EXISTS daily_tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    task_date DATE NOT NULL,
    task_name VARCHAR(255) NOT NULL,
    done TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_task_date (user_id, task_name, task_date)
);

-- 每日学习记录表（学习时长/心得，用于成绩曲线统计）
CREATE TABLE IF NOT EXISTS study_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    log_date DATE NOT NULL,
    subject VARCHAR(100) NOT NULL,
    minutes INT NOT NULL DEFAULT 0,
    score INT DEFAULT NULL,
    note TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 错题本
CREATE TABLE IF NOT EXISTS wrong_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    subject VARCHAR(100) NOT NULL,
    question TEXT NOT NULL,
    my_answer VARCHAR(255),
    correct_answer VARCHAR(255),
    note TEXT,
    mastered TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 作业提交
CREATE TABLE IF NOT EXISTS homeworks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    file_name VARCHAR(255),
    file_path VARCHAR(500),
    status ENUM('submitted','reviewed') NOT NULL DEFAULT 'submitted',
    feedback TEXT,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

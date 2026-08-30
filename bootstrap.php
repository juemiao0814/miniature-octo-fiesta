<?php
session_start();
$config=require __DIR__.'/config.php';
function db(){global $config; static $pdo; if($pdo)return $pdo; $d=$config['db']; try{$pdo=new PDO("mysql:host={$d['host']};dbname={$d['name']};charset={$d['charset']}",$d['user'],$d['pass'],[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION,PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC]);return $pdo;}catch(Throwable $e){return null;}}
function current_user(){ if(empty($_SESSION['user_id']))return null; $p=db(); if(!$p)return null; $s=$p->prepare('SELECT id,email,name,status,trial_started_at,trial_used_seconds,plan,plan_expires_at FROM users WHERE id=?');$s->execute([$_SESSION['user_id']]);return $s->fetch()?:null; }
function require_login(){if(!current_user()){header('Location: ../login.php');exit;}}
function json_response($data,$code=200){http_response_code($code);header('Content-Type: application/json; charset=utf-8');echo json_encode($data,JSON_UNESCAPED_UNICODE);exit;}
function csrf(){if(empty($_SESSION['csrf']))$_SESSION['csrf']=bin2hex(random_bytes(16));return $_SESSION['csrf'];}
function check_csrf($v){if(!hash_equals(csrf(),$v??''))json_response(['ok'=>false,'message'=>'CSRF 校验失败'],419);}
function trial_remaining($u){global $config; if(!$u||$u['plan']==='pro')return PHP_INT_MAX; if(!$u['trial_started_at'])return $config['app']['trial_seconds']; $elapsed=max(0,time()-strtotime($u['trial_started_at'])); return max(0,$config['app']['trial_seconds']-$elapsed-(int)$u['trial_used_seconds']);}

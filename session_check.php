<?php
require "config.php";

if (isset($_SESSION["user_id"])) {
    echo json_encode([
        "success" => true,
        "logged_in" => true,
        "username" => $_SESSION["username"],
    ]);
} else {
    echo json_encode([
        "success" => true,
        "logged_in" => false,
    ]);
}

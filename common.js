// 公共逻辑：登录状态检查 / 退出登录
// 除首页外的其他页面都引入这个文件，而不是 app.js

async function checkSession() {
    try {
        const res = await fetch("api/session_check.php");
        return await res.json();
    } catch (e) {
        console.error("无法连接服务器，请确认后端已部署", e);
        return { logged_in: false };
    }
}

async function requireLogin() {
    const session = await checkSession();
    if (!session.logged_in) {
        window.location.href = "login.html";
        return null;
    }
    const el = document.getElementById("usernameDisplay");
    if (el) el.textContent = "你好，" + session.username;
    return session;
}

async function doLogout() {
    await fetch("api/logout.php", { method: "POST" });
    window.location.href = "login.html";
}

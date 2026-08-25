// 成长OS 首页逻辑（V3.1）
// 登录检查 / 退出登录 逻辑在 common.js 中，本文件只处理首页专属的任务列表

document.addEventListener("DOMContentLoaded", init);

async function init() {
    const session = await requireLogin();
    if (!session) return;
    loadTasks();
}

async function loadTasks() {
    const listEl = document.getElementById("taskList");
    try {
        const res = await fetch("api/tasks.php");
        const data = await res.json();

        if (!data.success) {
            listEl.innerHTML = "<li>加载失败：" + (data.message || "") + "</li>";
            return;
        }

        renderTasks(data.tasks);
        calculateProgress(data.tasks);
    } catch (e) {
        listEl.innerHTML = "<li>无法连接服务器</li>";
    }
}

function renderTasks(tasks) {
    const listEl = document.getElementById("taskList");
    listEl.innerHTML = "";

    tasks.forEach(task => {
        const li = document.createElement("li");
        li.className = "task-item";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = !!Number(task.done);
        checkbox.onchange = () => toggleTask(task.id);

        const label = document.createElement("span");
        label.textContent = task.task_name;
        if (checkbox.checked) label.style.textDecoration = "line-through";

        li.appendChild(checkbox);
        li.appendChild(label);
        listEl.appendChild(li);
    });
}

async function toggleTask(id) {
    const res = await fetch("api/tasks.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle", id })
    });
    const data = await res.json();
    if (data.success) {
        loadTasks();
    }
}

async function addTask() {
    const input = document.getElementById("newTaskInput");
    const name = input.value.trim();
    if (!name) return;

    const res = await fetch("api/tasks.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add", task_name: name })
    });
    const data = await res.json();
    if (data.success) {
        input.value = "";
        loadTasks();
    }
}

function calculateProgress(tasks) {
    if (tasks.length === 0) return;
    const finish = tasks.filter(t => Number(t.done) === 1).length;
    const rate = (finish / tasks.length * 100).toFixed(0);
    console.log("今日完成:", rate + "%");
}

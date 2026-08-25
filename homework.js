// 作业提交页面逻辑

document.addEventListener("DOMContentLoaded", async () => {
    const session = await requireLogin();
    if (!session) return;
    loadHomeworks();
});

async function submitHomework() {
    const title = document.getElementById("title").value.trim();
    const content = document.getElementById("content").value.trim();
    const fileInput = document.getElementById("file");
    const msg = document.getElementById("msg");

    if (!title) {
        msg.style.color = "#dc2626";
        msg.textContent = "请填写作业标题";
        return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    if (fileInput.files[0]) {
        formData.append("file", fileInput.files[0]);
    }

    const res = await fetch("api/homework.php", {
        method: "POST",
        body: formData
    });
    const data = await res.json();

    if (data.success) {
        msg.style.color = "#16a34a";
        msg.textContent = "提交成功";
        document.getElementById("title").value = "";
        document.getElementById("content").value = "";
        fileInput.value = "";
        loadHomeworks();
    } else {
        msg.style.color = "#dc2626";
        msg.textContent = data.message || "提交失败";
    }
}

async function loadHomeworks() {
    const res = await fetch("api/homework.php");
    const data = await res.json();
    if (!data.success) return;

    const listEl = document.getElementById("homeworkList");
    listEl.innerHTML = "";

    if (data.items.length === 0) {
        listEl.innerHTML = "<li>还没有提交过作业</li>";
        return;
    }

    data.items.forEach(hw => {
        const li = document.createElement("li");
        li.className = "homework-item";

        const statusText = hw.status === "reviewed" ? "已批改" : "待批改";
        let html = `<strong>${escapeHtml(hw.title)}</strong> <span class="status-tag">${statusText}</span><br>`;
        html += `<span class="homework-meta">${hw.submitted_at}</span>`;
        if (hw.content) html += `<div class="homework-content">${escapeHtml(hw.content)}</div>`;
        if (hw.file_name) html += `<div>附件: ${escapeHtml(hw.file_name)}</div>`;
        if (hw.feedback) html += `<div class="homework-feedback">老师反馈: ${escapeHtml(hw.feedback)}</div>`;

        li.innerHTML = html;
        listEl.appendChild(li);
    });
}

function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

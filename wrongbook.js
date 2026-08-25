// 错题本页面逻辑

document.addEventListener("DOMContentLoaded", async () => {
    const session = await requireLogin();
    if (!session) return;
    loadWrongQuestions();
});

async function addWrongQuestion() {
    const subject = document.getElementById("subject").value.trim();
    const question = document.getElementById("question").value.trim();
    const my_answer = document.getElementById("myAnswer").value.trim();
    const correct_answer = document.getElementById("correctAnswer").value.trim();
    const note = document.getElementById("note").value.trim();
    const msg = document.getElementById("msg");

    const res = await fetch("api/wrong_questions.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add", subject, question, my_answer, correct_answer, note })
    });
    const data = await res.json();

    if (data.success) {
        msg.style.color = "#16a34a";
        msg.textContent = "已加入错题本";
        ["subject", "question", "myAnswer", "correctAnswer", "note"].forEach(id => {
            document.getElementById(id).value = "";
        });
        loadWrongQuestions();
    } else {
        msg.style.color = "#dc2626";
        msg.textContent = data.message || "添加失败";
    }
}

async function loadWrongQuestions() {
    const res = await fetch("api/wrong_questions.php");
    const data = await res.json();
    if (!data.success) return;

    const unmastered = data.items.filter(i => !Number(i.mastered));
    const mastered = data.items.filter(i => Number(i.mastered));

    document.getElementById("unmasteredCount").textContent = `(${unmastered.length})`;
    renderList("unmasteredList", unmastered);
    renderList("masteredList", mastered);
}

function renderList(elId, items) {
    const listEl = document.getElementById(elId);
    listEl.innerHTML = "";

    if (items.length === 0) {
        listEl.innerHTML = "<li>暂无</li>";
        return;
    }

    items.forEach(item => {
        const li = document.createElement("li");
        li.className = "wrong-item";

        const top = document.createElement("div");
        top.innerHTML = `<strong>[${item.subject}]</strong> ${escapeHtml(item.question)}`;

        const detail = document.createElement("div");
        detail.className = "wrong-detail";
        detail.textContent = `我的答案: ${item.my_answer || "-"}　正确答案: ${item.correct_answer || "-"}` + (item.note ? `　备注: ${item.note}` : "");

        const actions = document.createElement("div");
        actions.className = "wrong-actions";

        const toggleBtn = document.createElement("button");
        toggleBtn.textContent = Number(item.mastered) ? "标记为未掌握" : "标记为已掌握";
        toggleBtn.onclick = () => toggleMastered(item.id);

        const delBtn = document.createElement("button");
        delBtn.textContent = "删除";
        delBtn.className = "danger";
        delBtn.onclick = () => deleteWrongQuestion(item.id);

        actions.appendChild(toggleBtn);
        actions.appendChild(delBtn);

        li.appendChild(top);
        li.appendChild(detail);
        li.appendChild(actions);
        listEl.appendChild(li);
    });
}

async function toggleMastered(id) {
    await fetch("api/wrong_questions.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_mastered", id })
    });
    loadWrongQuestions();
}

async function deleteWrongQuestion(id) {
    if (!confirm("确定删除这条错题记录吗？")) return;
    await fetch("api/wrong_questions.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id })
    });
    loadWrongQuestions();
}

function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

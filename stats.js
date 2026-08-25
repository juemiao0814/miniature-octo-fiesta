// 学习记录与成绩曲线页面逻辑

document.addEventListener("DOMContentLoaded", async () => {
    const session = await requireLogin();
    if (!session) return;
    loadLogs();
});

async function submitLog() {
    const subject = document.getElementById("subject").value.trim();
    const minutes = document.getElementById("minutes").value;
    const score = document.getElementById("score").value;
    const note = document.getElementById("note").value.trim();
    const msg = document.getElementById("msg");

    const res = await fetch("api/study_logs.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, minutes, score, note })
    });
    const data = await res.json();

    if (data.success) {
        msg.style.color = "#16a34a";
        msg.textContent = "已保存";
        document.getElementById("subject").value = "";
        document.getElementById("minutes").value = "";
        document.getElementById("score").value = "";
        document.getElementById("note").value = "";
        loadLogs();
    } else {
        msg.style.color = "#dc2626";
        msg.textContent = data.message || "保存失败";
    }
}

let chartInstance = null;

async function loadLogs() {
    const res = await fetch("api/study_logs.php?days=30");
    const data = await res.json();

    if (!data.success) return;

    renderChart(data.logs);
    renderList(data.logs);
}

function renderChart(logs) {
    // 按日期汇总当天总学习分钟数
    const byDate = {};
    logs.forEach(l => {
        byDate[l.log_date] = (byDate[l.log_date] || 0) + Number(l.minutes);
    });

    const labels = Object.keys(byDate).sort();
    const values = labels.map(d => byDate[d]);

    const ctx = document.getElementById("chartCanvas");
    if (chartInstance) chartInstance.destroy();

    chartInstance = new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [{
                label: "每日学习时长(分钟)",
                data: values,
                borderColor: "#2563eb",
                backgroundColor: "rgba(37,99,235,0.1)",
                tension: 0.3,
                fill: true,
            }]
        },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: true } }
        }
    });
}

function renderList(logs) {
    const listEl = document.getElementById("logList");
    listEl.innerHTML = "";

    if (logs.length === 0) {
        listEl.innerHTML = "<li>还没有学习记录</li>";
        return;
    }

    logs.slice().reverse().forEach(l => {
        const li = document.createElement("li");
        li.className = "log-item";
        let text = `${l.log_date}　${l.subject}　${l.minutes}分钟`;
        if (l.score !== null) text += `　分数:${l.score}`;
        if (l.note) text += `　(${l.note})`;
        li.textContent = text;
        listEl.appendChild(li);
    });
}

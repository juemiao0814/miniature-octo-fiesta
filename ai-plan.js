// AI学习规划助手页面逻辑

document.addEventListener("DOMContentLoaded", async () => {
    const session = await requireLogin();
    if (!session) return;
});

async function generatePlan() {
    const btn = document.getElementById("genBtn");
    const msg = document.getElementById("msg");
    const planCard = document.getElementById("planCard");
    const planContent = document.getElementById("planContent");

    btn.disabled = true;
    btn.textContent = "生成中，请稍候...";
    msg.textContent = "";

    try {
        const res = await fetch("api/ai_plan.php", { method: "POST" });
        const data = await res.json();

        if (data.success) {
            planContent.textContent = data.plan;
            planCard.style.display = "block";
        } else {
            msg.style.color = "#dc2626";
            msg.textContent = data.message || "生成失败";
        }
    } catch (e) {
        msg.style.color = "#dc2626";
        msg.textContent = "无法连接服务器";
    } finally {
        btn.disabled = false;
        btn.textContent = "生成本周学习计划";
    }
}

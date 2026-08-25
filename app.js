const tasks=[
 {id:1,subject:'高等数学（一）',title:'复习极限与连续：30 分钟',detail:'完成教材例题 5 题',done:true},
 {id:2,subject:'Python程序设计',title:'学习函数定义与参数：60 分钟',detail:'完成 5 道练习题',done:false},
 {id:3,subject:'大学英语（一）',title:'四级词汇 30 个',detail:'完成单词复习与听力 20 分钟',done:false},
 {id:4,subject:'创业实践',title:'访谈 1 名同学',detail:'记录一个真实学习痛点',done:false},
];
const engCourses=[
 ['∫','高等数学（一）','函数、极限、导数、积分；当前优先级最高。',78,'88分目标'],
 ['EN','大学英语（一）','词汇、阅读、听力与写作，兼顾后续四级。',64,'80+目标'],
 ['AI','人工智能概论','理解 AI、机器学习、大模型基础，并完成实践。',70,'85+目标'],
 ['道','思想道德与法治','完成课程学习与阶段测评，保证学分与成绩。',82,'稳定通过'],
 ['语','大学语文','阅读、写作与课程作业，安排在低峰时段。',76,'80+目标']
];
const compRoad=[
 ['01','Python基础','变量、类型、条件、循环、函数','42%'],
 ['02','C语言基础','语法、数组、指针、结构体、文件','0%'],
 ['03','数据结构','数组、链表、栈、队列、树、排序','0%'],
 ['04','数据库','SQL、MySQL、表设计与CRUD','0%'],
 ['05','Web开发','HTML、CSS、JS + 项目实战','0%']
];
const titles={dashboard:'今天，也为转专业多走一步。',daily:'把计划变成真正完成的小时数。',engineering:'先守住工程管理，再争取转专业。',computer:'从编程基础开始建立计算机能力曲线。',tests:'学完一章，就用测试证明自己掌握。',grades:'分数只是结果，错题才告诉你下一步。',projects:'用 20% 的时间验证一个真实创业项目。',ai:'让 AI 根据你的真实数据安排下一周。'};

function renderTasks(){
  const html=tasks.map(t=>`<div class="task-item ${t.done?'done':''}" data-id="${t.id}"><button class="check" onclick="toggleTask(${t.id})"></button><div><b>${t.title}</b><span>${t.subject} · ${t.detail}</span></div></div>`).join('');
  document.getElementById('dashboardTasks').innerHTML=html;
  document.getElementById('dailyTasks').innerHTML=html;
  updateRate();
}
function toggleTask(id){const t=tasks.find(x=>x.id===id);t.done=!t.done;renderTasks();}
function updateRate(){const rate=Math.round(tasks.filter(t=>t.done).length/tasks.length*100);const el=document.getElementById('dailyRate'); if(el)el.textContent=rate+'%';}
function renderCourses(){document.getElementById('engineeringCourses').innerHTML=engCourses.map(c=>`<article class="course-card"><div class="course-icon">${c[0]}</div><h3>${c[1]}</h3><p>${c[2]}</p><div class="progress"><i style="width:${c[3]}%"></i></div><div class="course-foot"><span>${c[3]}% 已学</span><span>${c[4]}</span></div></article>`).join('');}
function renderRoadmap(){document.getElementById('computerRoadmap').innerHTML=compRoad.map(c=>`<article class="road-step"><div class="num">${c[0]}</div><h3>${c[1]}</h3><p>${c[2]}</p><div class="rate">进度 ${c[3]}</div></article>`).join('');}
function renderGrades(){const cards=[['工程管理总评','86','当前目标 ≥ 85','基础盘稳定'],['计算机能力','35','目标 ≥ 70','Python 已启动'],['本周作业完成率','72','目标 ≥ 90','需要提升连续性']];document.getElementById('gradeCards').className='content-grid three';document.getElementById('gradeCards').innerHTML=cards.map(c=>`<div class="grade-card"><h3>${c[0]}</h3><div class="big">${c[1]}<small> 分</small></div><p>${c[2]} · ${c[3]}</p></div>`).join('');document.getElementById('barChart').innerHTML=[72,76,74,81,84,83,88,86].map((v,i)=>`<div class="bar"><i style="--h:${v*2}px"></i><span>W${i+1}</span></div>`).join('');}
function saveStudyLog(){const subject=document.getElementById('logSubject').value.trim();const mins=document.getElementById('logMinutes').value;const score=document.getElementById('logScore').value;const note=document.getElementById('logNote').value.trim();if(!subject||!mins){alert('请填写科目和学习分钟数');return}const arr=JSON.parse(localStorage.getItem('growthos_logs')||'[]');arr.push({date:new Date().toISOString(),subject,minutes:Number(mins),score:score?Number(score):null,note});localStorage.setItem('growthos_logs',JSON.stringify(arr));document.getElementById('savedLog').textContent=`已保存：${subject} · ${mins} 分钟${score?` · 成绩 ${score}`:''}`;}
function answerQuiz(btn,correct){btn.style.borderColor=correct?'#18a67a':'#f59e0b';btn.style.background=correct?'#effaf5':'#fff8e8';btn.textContent+=(correct?' ✓ 正确':' · 再想想');}
async function generateAIPlan(){const box=document.getElementById('aiResult');box.textContent='正在读取学习数据并生成计划…';try{const res=await fetch('ai_plan.php',{method:'GET',headers:{'Accept':'application/json'}});const data=await res.json();box.textContent=data.success?data.plan:data.message||'暂时无法生成计划。';}catch(e){box.textContent='AI 接口暂时不可用。请确认网站已部署到 PHP 环境，并完成 config.php 与登录会话配置。';}}
function showPage(name){document.querySelectorAll('.page').forEach(p=>p.classList.remove('active-page'));document.getElementById(name).classList.add('active-page');document.querySelectorAll('.nav-item').forEach(n=>n.classList.toggle('active',n.dataset.page===name));document.getElementById('pageTitle').textContent=titles[name]||'成长OS';history.replaceState(null,'','#'+name);window.scrollTo({top:0,behavior:'smooth'});}
document.querySelectorAll('.nav-item').forEach(n=>n.addEventListener('click',()=>showPage(n.dataset.page)));document.querySelectorAll('[data-jump]').forEach(b=>b.addEventListener('click',()=>showPage(b.dataset.jump)));
document.getElementById('themeBtn').addEventListener('click',()=>{document.body.classList.toggle('dark');localStorage.setItem('growthos_dark',document.body.classList.contains('dark')?'1':'0')});
function init(){if(localStorage.getItem('growthos_dark')==='1')document.body.classList.add('dark');document.getElementById('dateChip').textContent=new Intl.DateTimeFormat('zh-CN',{month:'long',day:'numeric',weekday:'short'}).format(new Date());renderTasks();renderCourses();renderRoadmap();renderGrades();const page=location.hash.replace('#','');if(page&&titles[page])showPage(page);}
init();
